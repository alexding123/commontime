/* eslint-disable no-await-in-loop */
/* eslint-disable no-loop-func */

const functions = require('firebase-functions')
const admin = require('firebase-admin')
const db = admin.firestore()
const date = require('date-and-time')
const { firstDayFromDay, dateInBetween, addInstance, insert, calendar, auth, list, listEvents, delete_, deleteEvent } = require('../utils/calendar')
const { getUserByID } = require('../utils/db')


const createInstancesForTerm = (startDate, endDate, snap, context, periods, daylightStart, daylightEnd) => {
  const ref = db.collection('courses').doc(context.params.id).collection('instances')
  const data = snap.data()
  startDate = startDate.toDate()
  endDate = endDate.toDate()
  daylightStart = daylightStart.toDate()
  daylightEnd = daylightEnd.toDate()
  let dates = []
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
  

  
  const promises = dates.map(date => {
    return ref.add({
      type: 'course',
      parent: context.params.id,
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
  // first thing to do: determine whether this is an upload
  const isUploading = (await db.collection('meta').doc('internal').get()).data().isUploading

  const periods = {}
  await db.collection('periods').get().then(docs => {
    docs.forEach(snap => {
      periods[snap.id] = snap.data()
    })
    return
  })
  
  const terms = (await db.collection('meta').doc('terms').get()).data()
  
  let promises = []
  if (data.fallTerm) {
    promises = promises.concat(createInstancesForTerm(terms.fallStart, terms.fallEnd, snap, context, periods, terms.daylightStart, terms.daylightEnd))
  }
  if (data.winterTerm) {
    promises = promises.concat(createInstancesForTerm(terms.winterStart, terms.winterEnd, snap, context, periods, terms.daylightStart, terms.daylightEnd))
  }
  if (data.springTerm) {
    promises = promises.concat(createInstancesForTerm(terms.springStart, terms.springEnd, snap, context, periods, terms.daylightStart, terms.daylightEnd))
  }

  await Promise.all(promises)

  // skip calendar operations if this is an upload
  if (isUploading) {
    return
  }

  // if this is an upload, then add course to members' calendars
  const members = snap.data().members
  for (let member of members) {
    const calendarID = (await getUserByID(member)).calendar
    if (!calendarID) {
      return
    }
    const setups = await addCourse(calendarID, snap.data(), auth, course.id)
    for (let setup of setups) {
      await insert(setup).catch(console.error)
    }
  }
})



exports.onDelete = functions.firestore.document('courses/{id}').onDelete(async (snap, context) => {
  // first thing to do: determine whether this is an upload
  const isUploading = (await db.collection('meta').doc('internal').get()).data().isUploading

  const courseID = context.params.id
  // delete all subinstances
  await db.collection('courses').doc(courseID).collection('instances').get().then(docs => {
    const promises = docs.docs.map(doc => {
      return doc.ref.delete()
    })
    return Promise.all(promises)
  })

  // skip calendar operations if this is an upload
  if (isUploading) {
    return
  }

  // if this is not an upload, then remove course from members' calendars
  const members = snap.data().members
  for (let member of members) {
    const calendarID = (await getUserByID(member)).calendar
    if (!calendarID) {
      return
    }
    
    const items = await list(await listEvents(calendarID, auth, 'courseID', courseID))
    for (let item of items) {
      const setup = await deleteEvent(calendarID, auth, item.id)
      await delete_(setup)
    }
  }
})
