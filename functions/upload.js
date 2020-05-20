/* eslint-disable no-await-in-loop */
/* eslint-disable no-loop-func */
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const sentry = require("@sentry/node")
const db = admin.firestore()

const sleep = async (time) => {
  await new Promise(resolve => setTimeout(resolve, time))
}

exports.users = functions.https.onCall(async (data, context) => {
  try {
  if (!context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can upload assets')
  }

  // mark that an upload is happening
  await db.collection('meta').doc('internal').update({
    isUploadingUsers: true,
  })

  // delete current userPresets
  await db.collection('userPreset').get().then(docs => {
    const promises = docs.docs.map(doc => {
      return doc.ref.delete()
    })
    return Promise.all(promises)
  })
  
  // set new userPresets
  const userData = data.data
  for (let datum of userData) {
    datum = {
      ...datum,
      email: datum.email.toLowerCase(),
    }
    await db.collection('userPreset').doc(datum.id).set(datum)
  }

  await sleep(1000 * 15)

  await db.collection('meta').doc('internal').update({
    isUploadingUsers: false,
  })
  } catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
})

exports.periods = functions.https.onCall(async (data, context) => {
  try {
  if (!context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can upload periods')
  }

  // delete all existing periods
  await db.collection('periods').get().then(docs => {
    const promises = docs.docs.map(doc => {
      return doc.ref.delete()
    })
    return Promise.all(promises)
  })
  
  const periods = data.data
  const promises = periods.map(data => {
    const id = `${data.day}-${data.period}`
    return db.collection('periods').doc(id).set(data)
  })
  await Promise.all(promises)
  } catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
})

exports.rooms = functions.https.onCall(async (data, context) => {
  try {
  if (!context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can upload rooms')
  }
  
  // delete all existing rooms
  await db.collection('rooms').get().then(docs => {
    const promises = docs.docs.map(doc => {
      return doc.ref.delete()
    })
    return Promise.all(promises)
  })
  
  
  const periods = data.data
  const promises = periods.map(data => {
    const id = data.id
    return db.collection('rooms').doc(id).set(data)
  })
  await Promise.all(promises)
  } catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
})

exports.courses = functions.https.onCall(async (data, context) => {
  /* uploads a new year's courses files and clear the calendar */
  try {
  if (!context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can upload rooms')
  }

  // mark that an upload is happening
  await db.collection('meta').doc('internal').update({
    isUploadingCourses: true,
  })

  // delete all existing courses
  await db.collection('courses').get().then(docs => {
    const promises = docs.docs.map(async doc => {
      const subdocs = await db.collection('courses').doc(doc.id).collection('instances').get()
      for (let subdoc of subdocs.docs) {
        await subdoc.ref.delete()
      }

      await doc.ref.delete()
    })
    return Promise.all(promises)
  })

  // delete all instances and recurrings
  await db.collection('instances').get().then(docs => {
    const promises = docs.docs.map(doc => db.collection('instances').doc(doc.id).delete())
    return Promise.all(promises)
  })

  await db.collection('recurrings').get().then(docs => {
    const promises = docs.docs.map(async doc => {
      const subdocs = await db.collection('recurrings').doc(doc.id).collection('instances').get()
      for (let subdoc of subdocs.docs) {
        await subdoc.ref.delete()
      }

      await doc.ref.delete()
    })
    return Promise.all(promises)
  })
  
  // set meta
  const handleDate = (d) => {
    const newD = new Date(Date.parse(d))
    return new Date(newD.toDateString())
  }
  await db.collection('meta').doc('terms').set({
    fallStart: handleDate(data.terms.fallStart),
    fallEnd: handleDate(data.terms.fallEnd),
    winterStart: handleDate(data.terms.winterStart),
    winterEnd: handleDate(data.terms.winterEnd),
    springStart: handleDate(data.terms.springStart),
    springEnd: handleDate(data.terms.springEnd),
    daylightEnd: handleDate(data.terms.daylightEnd),
    daylightStart: handleDate(data.terms.daylightStart),
  })

  const courses = data.data
  const promises = courses.map(course => {
    return db.collection('courses').doc(course.id).set(course)
  })
  await Promise.all(promises)


  await db.collection('users').get().then(docs => {
    const promises = docs.docs.map(doc => {
      return doc.ref.update({
        shouldPopulateCourses: true,
      })
    })
    return Promise.all(promises)
  })

  // sleep to give some time for the courses.onCreate
  // triggers to run before rewriting meta.internal.isUploadingCourses
  await sleep(1000 * 15)

  await db.collection('meta').doc('internal').update({
    isUploadingCourses: false,
  })

  } catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
})