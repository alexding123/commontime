/* eslint-disable no-await-in-loop */
/* eslint-disable no-loop-func */
const { calendar, auth, getAuth, insert, addInstance, addRecurring, addCourse, listEvents, list } = require('./utils/calendar')
const { getUserByID, getUserPresetByEmail } = require('./utils/db')
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const sentry = require("@sentry/node")
const db = admin.firestore()

/**
 * Helper function to populate a Google Calendar with events created from a list of instances
 * @param {Object[]} instances List of instance objects to create events for
 * @param {string} calendarId ID of the Google Calendar
 * @param {Object} userAuth Auth object to impersonate the user
 */
const populateCalendarInstances = async (instances, calendarId, userAuth) => {
  // list of attempts failed this runthrough to try again next round
  let retries = []
  let nextRetries = []
  do {
    // if not the first round (is a retry)
    if (retries.length) {
      // iterate through each retry
      for (let retry of retries) {
        if (retry.attempt > 5) return // give up after 5 tries
        // if the instance's corresponding event is already created, just skip and we're good
        if ((await list(listEvents('instanceID', retry.id, calendarId, userAuth))).length) return
        // if it fails again, push to next round of retry
        await insert(retry.setup).catch(err => {
          if (err.message === "Rate Limit Exceeded") {
            nextRetries.push({
              setup: retry.setup,
              attempt: retry.attempt+1, // mark the attempt count
              id: retry.id,
            })
          } else {
            console.error(err)
          }
        })
      }
      // cycle to the next retries
      retries = nextRetries
      nextRetries = []
    } else {
      // if this is the first round, just iterate and add instances to the Calendar
      for (let instance of instances) {
        const setup = await addInstance(calendarId, instance.data(), userAuth, instance.id)
        await insert(setup).catch(err => {
          // if fail, push to retries for next round
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

/**
 * Helper function to populate a Google Calendar with recurring events created from a list of recurring meetings
 * @param {Object[]} recurrings List of recurring meetings to create recurring events for
 * @param {string} calendarId ID of the Google Calendar
 * @param {Object} userAuth Auth object to impersonate the user
 */
const populateCalendarRecurrings = async (recurrings, calendarId, userAuth) => {
  // list of attempts failed this runthrough to try again next round
  let retries = []
  let nextRetries = []
  do {
    // if not the first round (is a retry)
    if (retries.length) {
      // iterate through each retry
      for (let retry of retries) {
        if (retry.attempt > 5) return // give up after 5 retries
        // if the instance's corresponding event is already created, just skip and we're good
        if ((await list(listEvents('recurringID', retry.id, calendarId, userAuth))).length) return
        // if it fails again, push to next round of retry
        await insert(retry.setup).catch(err => {
          if (err.message === "Rate Limit Exceeded") {
            nextRetries.push({
              setup: retry.setup,
              attempt: retry.attempt+1, // mark the attempt count
              id: retry.id,
            })
          } else {
            console.error(err)
          }
        })
      }
      // cycle to the next retries
      retries = nextRetries
      nextRetries = []
    } else {
      // if this is the first round, just iterate and add instances to the Calendar
      for (let recurring of recurrings) {
        const setups = await addRecurring(calendarId, recurring.data(), userAuth, recurring.id)
        for (let setup of setups) {
          await insert(setup).catch(err => {
            // if fail, push to retries for next round
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

/**
 * Helper function to populate a Google Calendar with recurring events created from a list of courses
 * @param {Object[]} courses List of courses to create multiple recurring events for
 * @param {string} calendarId ID of the Google Calendar
 * @param {Object} userAuth Auth object to impersonate the user
 */
const populateCalendarCourses = async (courses, calendarId, userAuth) => {
  // list of attempts failed this runthrough to try again next round
  let retries = []
  let nextRetries = []
  do {
    // if not the first round (is a retry)
    if (retries.length) {
      // iterate through each retry
      for (let retry of retries) {
        if (retry.attempt > 5) return // give up after 5 retries
        // if the instance's corresponding event is already created, just skip and we're good
        if ((await list(listEvents('courseID', retry.id, calendarId, userAuth))).length) return
        // if it fails again, push to next round of retry
        await insert(retry.setup).catch(err => {
          if (err.message === "Rate Limit Exceeded") {
            nextRetries.push({
              setup: retry.setup,
              attempt: retry.attempt+1, // mark the attempt count
              id: retry.id,
            })
          } else {
            console.error(err)
          }
        })
      }
      // cycle to the next retries
      retries = nextRetries
      nextRetries = []
    } else {
      // if this is the first round, just iterate and add instances to the Calendar
      for (let course of courses) {
        const setups = await addCourse(calendarId, course.data(), userAuth, course.id)
        for (let setup of setups) {
          await insert(setup).catch(err => {
            // if fail, push to retries for next round
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

/**
 * Helper function to populate a user's Google Calendar with all the courses,
 * recurring meetings, and one-off meetings the user is in
 * @param {Object} user User to populate Calendar for
 * @param {string} calendarId ID of the user's Google Calendar
 * @param {string} token Auth token to impersonate the user with
 */
const populateCalendar = async (user, calendarId, token) => {
  // check taht user exists
  const userID = await db.collection('userPreset').doc(user.id).get().then(doc => {
    if (!doc.exists) {
      throw new Error(`Email ${user.email} not found in uploaded user file`)
    }
    return doc.data().id
  })
  
  // get the various instances associated with the user
  const instances = (await db.collection('instances').where('members', 'array-contains', userID).get()).docs
  const recurrings = (await db.collection('recurrings').where('members', 'array-contains', userID).get()).docs
  const courses = (await db.collection('courses').where('members', 'array-contains', userID).get()).docs

  const userAuth = getAuth(token)
  await populateCalendarInstances(instances, calendarId, userAuth)
  await populateCalendarRecurrings(recurrings, calendarId, userAuth)
  await populateCalendarCourses(courses, calendarId, userAuth)
}

const runtimeOpts = { timeoutSeconds: 540, memory: '1GB' }
/**
 * Firebase Function to populate a user's Calendar with the courses the user is in
 */
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
  // only populate courses
  const courses = (await db.collection('courses').where('members', 'array-contains', userID).get()).docs
  const userAuth = getAuth(data.token)
  await populateCalendarCourses(courses, calendarId, userAuth)
  } catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
})

/**
 * Firebase Function to create a Google Calendar for the user and populate it
 * with the courses and meetings the user is in
 * @param {Object} data Input data passed to the Firebase Function
 * @param {Object} context Context object to the Firebase Function call
 */
const create = async (data, context) => {
  const userAuth = getAuth(data.token)
  const user = await db.collection('users').doc(context.auth.token.uid).get().then(doc => doc.data())
  // mark that we are creating the Calendar right now (thus preventing the
  // frontend from freaking out about not having a Calendar)
  await db.collection('users').doc(context.auth.token.uid).set({
    isCreatingCalendar: true,
  }, {
    merge: true,
  })
  const userPreset = await getUserPresetByEmail(user.email)
  if (user.calendar) {
    throw new functions.https.HttpsError('invalid-argument', 'User already has a calendar associated')
  }

  // create a new calendar
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

  // set the Calendar in profile
  await db.collection('users').doc(context.auth.token.uid).update({
    calendar: newCalendar.id,
  }, {
    merge: true,
  })

  // set the notification settings (and add the Calendar to the user's CalendarList)
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

  // give Commontime access to the Calendar
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

  // add this Calendar to Commontime's listing as well
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

  // populate the Calendar with meetings and courses the user is in
  await populateCalendar(userPreset, newCalendar.id, data.token)

  // unset isCreatingCalendar
  await db.collection('users').doc(context.auth.token.uid).update({
    isCreatingCalendar: false,
  })
}

exports.create = functions.runWith(runtimeOpts).https.onCall(async (data, context) => {
  try {
    await create(data, context)
  } catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
})

/**
 * Firebase Function to reset the user's Calendar, deleting the current one
 * (if it exists) and creating a new one with the current values in the database
 */
exports.reset = functions.https.onCall(async (data, context) => {
  try {
  const userID = context.auth.uid
  if (!userID) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to reset your calendar')
  }
  const user = (await db.collection('users').doc(userID).get()).data()
  if (user.calendar) {
    console.log("Deleting")
    const deleteCalendarPromise = new Promise((resolve, reject) => {
      calendar.calendars.delete({
        calendarId: user.calendar,
        auth: auth,
      }, (err, res) => {
        if (err) {
          reject(err)
        }
        resolve(res)
      })
    }).catch(console.error)
    await deleteCalendarPromise
    await db.collection('users').doc(userID).set({
      calendar: null
    }, {
      merge: true,
    })
  }

  await create(data, context)

  } catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
})