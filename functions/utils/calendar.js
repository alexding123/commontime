/* eslint-disable no-await-in-loop */
/* eslint-disable no-loop-func */

const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2
const calendar = google.calendar('v3')
const functions = require('firebase-functions')
const date = require('date-and-time')
const { getPeriod, getRoom, getTerms } = require('./db')

const oAuth2Client = new OAuth2(
  functions.config().calendar.client_id,
  functions.config().calendar.client_secret,
  functions.config().calendar.redirect_uri,
)

oAuth2Client.setCredentials({
  refresh_token: functions.config().calendar.refresh_token
})

exports.calendar = calendar
exports.auth = oAuth2Client
exports.getAuth = (token) => {
  const client = new OAuth2(
    functions.config().calendar.client_id,
    functions.config().calendar.client_secret,
    functions.config().calendar.redirect_uri,
  )
  client.setCredentials({
    access_token: token,
  })
  return client
}

const firstDayFromDay = (inputDate, weekday) => {
  if (0 > weekday || weekday > 6) {
    throw functions.https.HttpsError('invalid-argument', 'Weekday must be between 0 and 6')
  }
  while (inputDate.getDay() !== weekday) {
    inputDate = date.addDays(inputDate, 1)
  }
  return inputDate
} 
exports.firstDayFromDay = firstDayFromDay

exports.dateInBetween = (d, dBefore, dAfter) => {
  if (date.subtract(d, dBefore).toMinutes() > 0 && date.subtract(d, dAfter).toMinutes() < 0) {
    return true
  }
  return false
}

exports.insert = (setup) => {
  return new Promise((resolve, reject) => {
    calendar.events.insert(setup, 
      (err, res) => {
        if (err) {
          reject(err)
        } 
        resolve(res)
      }
    )
  })
}

exports.delete_ = (setup) => {
  return new Promise((resolve, reject) => {
    calendar.events.delete(setup, 
      (err, res) => {
        if (err) {
          reject(err)
        }
        resolve(res)
      }
    )
  })
}

exports.deleteEvent = async (calendarId, userAuth, id) => {
  return {
    auth: userAuth,
    calendarId: calendarId,
    eventId: id,
  }
}

const list = (setup) => {
  return new Promise((resolve, reject) => {
    calendar.events.list(setup, (err, res) => {
      if (err) {
        reject(err)
      }
      const results = res.data['items']
      resolve(results)
    })
  })
}

exports.list = list

exports.listEvents = async (calendarId, userAuth, field, id) => {
  return {
    calendarId: calendarId,
    sharedExtendedProperty: `${field}=${id}`,
    auth: userAuth,
  }
}

exports.addInstance = async (calendarId, data, userAuth, id) => {
  const roomName = data.room ? await getRoom(data.room) : data.roomName
  return {
    auth: userAuth,
    calendarId: calendarId,
    resource: {
      summary: data.name,
      location: roomName,
      start: {
        dateTime: new Date(data.startDate._seconds*1000).toISOString(),  
        timeZone: "America/New_York",
      },
      end: {
        dateTime: new Date(data.endDate._seconds*1000).toISOString(),
        timeZone: "America/New_York",
      },
      extendedProperties: {
        shared: {
          instanceID: id,
        }
      }
    },
  }
}

const formatToICal = (d) => {
  const str = d.toISOString()
  return str.substring(0, str.length - 5).replace(/-|:/g, '').concat('Z')
}

const addRecurringTerm = async (calendarId, data, userAuth, id, termStart, termEnd) => {
  const roomName = data.room ? await getRoom(data.room) : data.roomName
  const period = await getPeriod(data.period)

  const eventDate = firstDayFromDay(new Date(termStart._seconds*1000), period.day)
  const [startHour, startMinute] = period.startTime.split(':').map(n => Number(n))
  const [endHour, endMinute] = period.endTime.split(':').map(n => Number(n))
  const startTime = date.addMinutes(date.addHours(eventDate, startHour), startMinute)
  const endTime = date.addMinutes(date.addHours(eventDate, endHour), endMinute)
  return {
    auth: userAuth,
    calendarId,
    resource: {
      summary: data.name,
      location: roomName,
      start: {
        dateTime: startTime.toISOString(), 
        timeZone: "America/New_York",
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: "America/New_York",
      },
      recurrence: [
        `RRULE:FREQ=WEEKLY;UNTIL=${formatToICal(new Date(termEnd._seconds*1000))}`
      ],
      extendedProperties: {
        shared: {
          recurringID: id,
        }
      }
    },
  }
}

exports.addRecurring = async (calendarId, data, userAuth, id) => {
  const terms = await getTerms()
  let setups = []
  setups.push(await addRecurringTerm(calendarId, data, userAuth, id, terms.fallStart, terms.fallEnd))
  setups.push(await addRecurringTerm(calendarId, data, userAuth, id, terms.winterStart, terms.winterEnd))
  setups.push(await addRecurringTerm(calendarId, data, userAuth, id, terms.springStart, terms.springEnd))
  return setups
}

const addCourseTime = async (calendarId, data, userAuth, id, termStart, termEnd, time) => {
  const room = await getRoom(data.room)
  const period = await getPeriod(`${time.day}-${time.period}`)

  const eventDate = firstDayFromDay(new Date(termStart._seconds*1000), period.day)
  const [startHour, startMinute] = period.startTime.split(':').map(n => Number(n))
  const [endHour, endMinute] = period.endTime.split(':').map(n => Number(n))
  const startTime = date.addMinutes(date.addHours(eventDate, startHour), startMinute)
  const endTime = date.addMinutes(date.addHours(eventDate, endHour), endMinute)
  return {
    auth: userAuth,
    calendarId,
    resource: {
      summary: data.name,
      location: room.name,
      start: {
        dateTime: startTime.toISOString(),  
        timeZone: "America/New_York",
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: "America/New_York",
      },
      recurrence: [
        `RRULE:FREQ=WEEKLY;UNTIL=${formatToICal(new Date(termEnd._seconds*1000))}`
      ],
      extendedProperties: {
        shared: {
          courseID: id,
        }
      }
    },
  }
}

exports.addCourse = async (calendarId, data, userAuth, id) => {
  const terms = await getTerms()
  let setups = []
  if (!data.times) return []
  for (let time of data.times) {
    if (data.fallTerm) {
      setups.push(await addCourseTime(calendarId, data, userAuth, id, terms.fallStart, terms.fallEnd, time))
    }
    if (data.winterTerm) {
      setups.push(await addCourseTime(calendarId, data, userAuth, id, terms.winterStart, terms.winterEnd, time))
    }
    if (data.springTerm) {
      setups.push(await addCourseTime(calendarId, data, userAuth, id, terms.springStart, terms.springEnd, time))
    }
  }
  return setups
}