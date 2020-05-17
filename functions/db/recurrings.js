/* eslint-disable no-await-in-loop */
/* eslint-disable no-loop-func */
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const sentry = require("@sentry/node")
const db = admin.firestore()
const date = require('date-and-time')
const { firstDayFromDay, dateInBetween, auth, insert, addRecurring, listEvents, list, delete_, deleteEvent } = require('../utils/calendar')
const { getTerms, getPeriods, deleteRecurringInstances, getUserByID, deleteRecurringInvitations } = require('../utils/db')

const createInstancesForTerm = (targetDate, startDate, endDate, snap, context, periods, daylightStart, daylightEnd) => {
  const ref = db.collection('recurrings').doc(context.params.id).collection('instances')
  const data = snap.data()
  daylightStart = daylightStart.toDate()
  daylightEnd = daylightEnd.toDate()
  const period = periods[data.period]


  let dates = []
  let currentDate = startDate
  let lastDate = currentDate
  while (date.subtract(currentDate, targetDate).toMinutes() < 0) {
    if (dateInBetween(daylightEnd, lastDate, currentDate)) {
      currentDate = date.addHours(currentDate, -1)
    } else if (dateInBetween(daylightStart, lastDate, currentDate)) {
      currentDate = date.addHours(currentDate, 1)
    }
    lastDate = currentDate
    currentDate = date.addDays(currentDate, 7)
  }

  currentDate = firstDayFromDay(currentDate, periods[data.period].day)
  lastDate = currentDate
    
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
      room: data.room,
      date: date.format(startDateSummed, "MM/DD/YYYY"),
      period: data.period,
    })
    lastDate = currentDate
    currentDate = date.addDays(currentDate, 7)
  }

  
  const promises = dates.map(date => {
    return ref.add({
      type: 'event',
      parent: context.params.id,
      name: data.name,
      members: data.members,
      creator: data.creator,
      startDate: date.start,
      endDate: date.end,
      room: date.room,
      period: date.period,
      date: date.date,
      private: snap.data().private,
    })
  })
  return promises
}

exports.onCreate = functions.firestore.document('recurrings/{id}').onCreate(async (snap, context) => {
  try {
  await deleteRecurringInstances(context.params.id)

  const periods = await getPeriods()
  const terms = await getTerms()

  var promises = createInstancesForTerm(new Date(), terms.fallStart.toDate(), terms.fallEnd.toDate(), snap, context, periods, terms.daylightStart, terms.daylightEnd)
  await Promise.all(promises)
  promises = createInstancesForTerm(new Date(), terms.winterStart.toDate(), terms.winterEnd.toDate(), snap, context, periods, terms.daylightStart, terms.daylightEnd)
  await Promise.all(promises)
  promises = createInstancesForTerm(new Date(), terms.springStart.toDate(), terms.springEnd.toDate(), snap, context, periods, terms.daylightStart, terms.daylightEnd)
  await Promise.all(promises)

  // add to members' calendars
  for (let member of snap.data().members) {
    const calendarID = (await getUserByID(member)).calendar
    if (!calendarID) continue

    const setups = await addRecurring(calendarID, snap.data(), auth, context.params.id)
    for (let setup of setups) {
      await insert(setup)
    }
  }
  } catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
})

exports.onDelete = functions.firestore.document('recurrings/{id}').onDelete(async (snap, context) => {
  try {
  await deleteRecurringInstances(context.params.id)
  await deleteRecurringInvitations(context.params.id)
  for (let member of snap.data().members) {
    const calendarID = (await getUserByID(member)).calendar
    if (!calendarID) continue

    const setups = await addRecurring(calendarID, snap.data(), auth, context.params.id)
    for (let setup of setups) {
      await insert(setup)
    }
  }
  } catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
})

exports.onUpdate = functions.firestore.document('recurrings/{id}').onUpdate(async (snap, context) => {
  try {
  const recurringID = context.params.id
  const deleteMember = async (member) => {
    const calendarID = (await getUserByID(member)).calendar
    
    if (!calendarID) return null

    const setup = await listEvents(calendarID, auth, 'recurringID', recurringID)
    const items = await list(setup)
    
    for (let item of items) {
      const deleteSetup = await deleteEvent(calendarID, auth, item.id)
      await delete_(deleteSetup).catch(console.error)
    }
    return null
  }

  const addMember = async (member) => {
    const calendarID = (await getUserByID(member)).calendar
    if (!calendarID) return null

    const data = snap.before.data()
    const setups = await addRecurring(calendarID, data, auth, recurringID)
    for (let setup of setups) {
      await insert(setup).catch(console.error)
    }
    return null
  }

  // compare members from before and after
  const beforeMembers = snap.before.data().members
  const afterMembers = snap.after.data().members

  if (beforeMembers.length > afterMembers.length) {
    // member deleted
    const diff = beforeMembers.filter(member => !afterMembers.includes(member))
    for (let member of diff) {
      await deleteMember(member)
    }
  } else {
    // member added
    const diff = afterMembers.filter(member => !beforeMembers.includes(member))
    for (let member of diff) {
      await addMember(member)
    }
  }
  } catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
})