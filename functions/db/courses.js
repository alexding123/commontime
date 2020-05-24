/* eslint-disable no-await-in-loop */
/* eslint-disable no-loop-func */

const functions = require('firebase-functions')
const admin = require('firebase-admin')
const sentry = require("@sentry/node")
const db = admin.firestore()
const date = require('date-and-time')
const { firstDayFromDay, dateInBetween, addInstance, insert, calendar, auth, list, listEvents, delete_, deleteEvent, addCourse } = require('../utils/calendar')
const { getUserByID } = require('../utils/db')


const createInstancesForTerm = (startDate, endDate, data, courseID, periods, daylightStart, daylightEnd) => {
  const ref = db.collection('courses').doc(courseID).collection('instances')
  startDate = startDate.toDate()
  endDate = endDate.toDate()
  daylightStart = daylightStart.toDate()
  daylightEnd = daylightEnd.toDate()
  let dates = []
  if (data.times) {
    data.times.forEach(time => {
      let currentDate = firstDayFromDay(startDate, time.day)
      let lastDate = currentDate
      const periodID = `${time.day}-${time.period}`
      const period = periods[periodID]
      const [startHour, startMinute] = period.startTime.split(':').map(n => Number(n))
      const [endHour, endMinute] = period.endTime.split(':').map(n => Number(n))
      while (date.subtract(endDate, currentDate).toDays() >= 0) {
        if (dateInBetween(daylightEnd, lastDate, currentDate)) {
          currentDate = date.addHours(currentDate, -1)
        } else if (dateInBetween(daylightStart, lastDate, currentDate)) {
          currentDate = date.addHours(currentDate, 1)
        }

        let startDateSummed = date.addMinutes(date.addHours(currentDate, startHour), startMinute)
        let endDateSummed = date.addMinutes(date.addHours(currentDate, endHour), endMinute)

        dates.push({
          start: startDateSummed,
          end: endDateSummed,
          room: time.room,
          date: date.format(startDateSummed, "MM/DD/YYYY"),
          period: periodID,
        })
        lastDate = currentDate
        currentDate = date.addDays(currentDate, 7)
      }
    })
  } else {
    console.log(courseID, data.times)
  }
  

  
  const promises = dates.map(date => {
    return ref.add({
      type: 'course',
      parent: courseID,
      name: data.name,
      members: data.members,
      startDate: date.start,
      endDate: date.end,
      room: date.room,
      period: date.period,
      date: date.date,
    })
  })
  return promises
}

exports.onCreate = functions.firestore.document('courses/{id}').onCreate(async (snap, context) => {
  try {
  // first thing to do: determine whether this is an upload
  const isUploading = (await db.collection('meta').doc('internal').get()).data().isUploadingCourses

  const periods = {}
  await db.collection('periods').get().then(docs => {
    docs.forEach(snap => {
      periods[snap.id] = snap.data()
    })
    return
  })
  const data = snap.data()
  const courseID = context.params.id
  
  const terms = (await db.collection('meta').doc('terms').get()).data()
  
  if (data.fallTerm) {
    await Promise.all(createInstancesForTerm(terms.fallStart, terms.fallEnd, data, courseID, periods, terms.daylightStart, terms.daylightEnd))
  }
  if (data.winterTerm) {
    await Promise.all(createInstancesForTerm(terms.winterStart, terms.winterEnd, data, courseID, periods, terms.daylightStart, terms.daylightEnd))
  }
  if (data.springTerm) {
    await Promise.all(createInstancesForTerm(terms.springStart, terms.springEnd, data, courseID, periods, terms.daylightStart, terms.daylightEnd))
  }

  // skip calendar operations if this is an upload
  if (isUploading) {
    return
  }

  // if this is an upload, then add course to members' calendars
  const members = data.members
  if (!members) return
  for (let member of members) {
    const calendarID = (await getUserByID(member)).calendar
    if (!calendarID) {
      continue
    }
    const setups = await addCourse(calendarID, data, auth, courseID)
    for (let setup of setups) {
      await insert(setup).catch(console.error)
    }
  }
  } catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
})



exports.onDelete = functions.firestore.document('courses/{id}').onDelete(async (snap, context) => {
  try {
  // first thing to do: determine whether this is an upload
  const isUploading = (await db.collection('meta').doc('internal').get()).data().isUploadingCourses

  // skip all operations if this is an upload
  if (isUploading) {
    return
  }

  // we'll manually delete all subinstances in an upload
  // otherwise, this might delete instances generated for
  // newly uploaded courses
  const courseID = context.params.id
  // delete all subinstances
  await db.collection('courses').doc(courseID).collection('instances').get().then(docs => {
    const promises = docs.docs.map(doc => {
      return doc.ref.delete()
    })
    return Promise.all(promises)
  })

  
  // if this is not an upload, then remove course from members' calendars
  const members = snap.data().members
  if (!members) return
  for (let member of members) {
    const calendarID = (await getUserByID(member)).calendar
    if (!calendarID) {
      continue
    }
    
    const items = await list(await listEvents(calendarID, auth, 'courseID', courseID))
    for (let item of items) {
      const setup = await deleteEvent(calendarID, auth, item.id)
      await delete_(setup)
    }
  }
  } catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
})

exports.onUpdate = functions.firestore.document('courses/{id}').onUpdate(async (snap, context) => {
  try {
  // first thing to do: determine whether this is an upload
  const isUploading = (await db.collection('meta').doc('internal').get()).data().isUploadingCourses

  const courseID = context.params.id

  // skip operations if this is an upload
  if (isUploading) {
    return
  }

  // probably easiest just to delete and recreate everything
  // remove all instances of the course
  await db.collection('courses').doc(courseID).collection('instances').get().then(docs => {
    const promises = docs.docs.map(doc => {
      return doc.ref.delete()
    })
    return Promise.all(promises)
  })

  // remove calendar events associated
  const members = snap.before.data().members
  for (let member of members) {
    const calendarID = (await getUserByID(member)).calendar
    if (!calendarID) {
      continue
    }
    
    const items = await list(await listEvents(calendarID, auth, 'courseID', courseID))
    for (let item of items) {
      const setup = await deleteEvent(calendarID, auth, item.id)
      await delete_(setup)
    }
  }

  // recreate instances using new data
  const terms = (await db.collection('meta').doc('terms').get()).data()
  
  const periods = {}
  await db.collection('periods').get().then(docs => {
    docs.forEach(snap => {
      periods[snap.id] = snap.data()
    })
    return
  })
  if (snap.after.data().fallTerm) {
    await Promise.all(createInstancesForTerm(terms.fallStart, terms.fallEnd, snap.after.data(), courseID, periods, terms.daylightStart, terms.daylightEnd))
  }
  if (snap.after.data().winterTerm) {
    await Promise.all(createInstancesForTerm(terms.winterStart, terms.winterEnd, snap.after.data(), courseID, periods, terms.daylightStart, terms.daylightEnd))
  }
  if (snap.after.data().springTerm) {
    await Promise.all(createInstancesForTerm(terms.springStart, terms.springEnd, snap.after.data(), courseID, periods, terms.daylightStart, terms.daylightEnd))
  }

  // finally, add to members' calendars
  const newMembers = snap.after.data().members
  for (let member of newMembers) {
    const calendarID = (await getUserByID(member)).calendar
    if (!calendarID) {
      continue
    }
    const setups = await addCourse(calendarID, snap.after.data(), auth, courseID)
    for (let setup of setups) {
      await insert(setup).catch(console.error)
    }
  }
  } catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
})
