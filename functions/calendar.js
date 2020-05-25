/* eslint-disable no-await-in-loop */
/* eslint-disable no-loop-func */
const { calendar, auth, getAuth, insert, addInstance, addRecurring, addCourse, listEvents, list } = require('./utils/calendar')
const { getUserByID, getUserPresetByEmail } = require('./utils/db')
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const sentry = require("@sentry/node")
const db = admin.firestore()

const populateCalendarInstances = async (instances, calendarId, userAuth) => {
  let retries = []
  let nextRetries = []
  do {
    if (retries.length) {
      for (let retry of retries) {
        if (retry.attempt > 5) return
        if ((await list(listEvents('instanceID', retry.id, calendarId, userAuth))).length) return
        await insert(retry.setup).catch(err => {
          if (err.message === "Rate Limit Exceeded") {
            nextRetries.push({
              setup: retry.setup,
              attempt: retry.attempt+1,
              id: retry.id,
            })
          } else {
            console.error(err)
          }
        })
      }
      retries = nextRetries
      nextRetries = []
    } else {
      for (let instance of instances) {
        const setup = await addInstance(calendarId, instance.data(), userAuth, instance.id)
        await insert(setup).catch(err => {
          if (err.message === "Rate Limit Exceeded") {
            retries.push({
              setup: setup,
              id: instance.id,
              attempt: 0,
            })
          } else {
            console.error(err)
          }
        })
      }
    }
  } while (retries.length)
}

const populateCalendarRecurrings = async (recurrings, calendarId, userAuth) => {
  let retries = []
  let nextRetries = []
  do {
    if (retries.length) {
      for (let retry of retries) {
        if (retry.attempt > 5) return
        if ((await list(listEvents('recurringID', retry.id, calendarId, userAuth))).length) return
        await insert(retry.setup).catch(err => {
          if (err.message === "Rate Limit Exceeded") {
            nextRetries.push({
              setup: retry.setup,
              attempt: retry.attempt+1,
              id: retry.id,
            })
          } else {
            console.error(err)
          }
        })
      }
      retries = nextRetries
      nextRetries = []
    } else {
      for (let recurring of recurrings) {
        const setups = await addRecurring(calendarId, recurring.data(), userAuth, recurring.id)
        for (let setup of setups) {
          await insert(setup).catch(err => {
            if (err.message === "Rate Limit Exceeded") {
              retries.push({
                setup: setup,
                id: recurring.id,
                attempt: 0,
              })
            } else {
              console.error(err)
            }
          })
        }
      }
    }
  } while (retries.length)
}

const populateCalendarCourses = async (courses, calendarId, userAuth) => {
  let retries = []
  let nextRetries = []
  do {
    if (retries.length) {
      for (let retry of retries) {
        if (retry.attempt > 5) return
        if ((await list(listEvents('courseID', retry.id, calendarId, userAuth))).length) return
        await insert(retry.setup).catch(err => {
          if (err.message === "Rate Limit Exceeded") {
            nextRetries.push({
              setup: retry.setup,
              attempt: retry.attempt+1,
              id: retry.id,
            })
          } else {
            console.error(err)
          }
        })
      }
      retries = nextRetries
      nextRetries = []
    } else {
      for (let course of courses) {
        const setups = await addCourse(calendarId, course.data(), userAuth, course.id)
        for (let setup of setups) {
          await insert(setup).catch(err => {
            if (err.message === "Rate Limit Exceeded") {
              retries.push({
                setup: setup,
                id: course.id,
                attempt: 0,
              })
            } else {
              console.error(err)
            }
          })
        }
      }
    }
  } while (retries.length)
}

const populateCalendar = async (user, calendarId, token) => {
  const userID = await db.collection('userPreset').doc(user.id).get().then(doc => {
    if (!doc.exists) {
      throw new Error(`Email ${user.email} not found in uploaded user file`)
    }
    return doc.data().id
  })
  
  const instances = (await db.collection('instances').where('members', 'array-contains', userID).get()).docs
  const recurrings = (await db.collection('recurrings').where('members', 'array-contains', userID).get()).docs
  const courses = (await db.collection('courses').where('members', 'array-contains', userID).get()).docs

  const userAuth = getAuth(token)
  await populateCalendarInstances(instances, calendarId, userAuth)
  await populateCalendarRecurrings(recurrings, calendarId, userAuth)
  await populateCalendarCourses(courses, calendarId, userAuth)
}

const runtimeOpts = { timeoutSeconds: 540, memory: '1GB' }

exports.populateCourses = functions.runWith(runtimeOpts).https.onCall(async (data, context) => {
  try {
  const user = (await db.collection('users').doc(context.auth.uid).get()).data()
  console.log(user)
  const calendarId = user.calendar

  if (!calendarId) {
    throw new functions.https.HttpsError('invalid-argument', `User ${context.auth.uid} has no calendar associated`)
  }

  const userID = await db.collection('userPreset').doc(user.id).get().then(doc => {
    if (!doc.exists) {
      throw new Error(`Email ${context.auth.token.email} not found in uploaded user file`)
    }
    return doc.data().id
  })
  const courses = (await db.collection('courses').where('members', 'array-contains', userID).get()).docs
  const userAuth = getAuth(data.token)
  await populateCalendarCourses(courses, calendarId, userAuth)
  } catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
})

exports.create = functions.runWith(runtimeOpts).https.onCall(async (data, context)=> {
  try {
  const userAuth = getAuth(data.token)
  const user = await db.collection('users').doc(context.auth.token.uid).get().then(doc => doc.data())
  await db.collection('users').doc(context.auth.token.uid).set({
    isCreatingCalendar: true,
  }, {
    merge: true,
  })
  const userPreset = await getUserPresetByEmail(user.email)
  if (user.calendar) {
    throw new functions.https.HttpsError('invalid-argument', 'User already has a calendar associated')
  }
  const newCalendar = await (new Promise((resolve, reject) => {
    calendar.calendars.insert({
      auth: userAuth,
      resource: {
        summary: `Commontime`,
        description: `${user.name}'s Commontime calendar`,
        timezone: 'EST',
      },
    }, (err, res) => {
      if (err) {
        reject(err)
      }
      resolve(res.data)
    })
  }))

  await db.collection('users').doc(context.auth.token.uid).update({
    calendar: newCalendar.id,
  }, {
    merge: true,
  })

  await new Promise((resolve, reject) => {
    calendar.calendarList.update({
      auth: userAuth,
      calendarId: newCalendar.id,
      resource: {
        defaultReminders: [{
          method: 'popup',
          minutes: 5
        }],
      }
    }, (err, res) => {
      if (err) {
        reject(err)
      }
      resolve()
    })
  })

  await new Promise((resolve, reject) => {
    calendar.acl.insert({
      auth: userAuth,
      calendarId: newCalendar.id,
      sendNotifications: false,
      resource: {
        role: 'owner',
        scope: {
          type: 'user',
          value: functions.config().mail.email,
        }
      }
    }, (err, res) => {
      if (err) {
        reject(err)
      }
      resolve()
    })
  })

  await new Promise((resolve, reject) => {
    calendar.calendarList.insert({
      auth: auth,
      resource: {
        id: newCalendar.id   
      }
    }, (err, res) => {
      if (err) {
        reject(err)
      }
      resolve()
    })
  })

  await populateCalendar(userPreset, newCalendar.id, data.token)

  await db.collection('users').doc(context.auth.token.uid).update({
    isCreatingCalendar: false,
  })
  } catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
})