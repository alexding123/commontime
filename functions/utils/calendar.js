/* eslint-disable no-await-in-loop */
/* eslint-disable no-loop-func */

/**
 * Helper functions for Google Calendar operations
 */

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

/** Calendar API object */
exports.calendar = calendar
/** Service account auth to access Calendar API */
exports.auth = oAuth2Client
/**
 * Creates an auth object based on user-supplied access token
 * @param {string} token The supplied token of the user account to impersonate
 * @returns {Object}
 */
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

/**
 * The first 'x'day (e.g. Monday) starting from a given date
 * @param {Date} inputDate Starting date
 * @param {number} weekday The weekday to look for
 * @returns {Date}
 */
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

/**
 * Helper function to check whether a date is within a date range
 * @param {Date} d Date to check
 * @param {Date} dBefore Starting date of the range
 * @param {Date} dAfter Ending date of the range
 * @returns {bool}
 */
exports.dateInBetween = (d, dBefore, dAfter) => {
  return (date.subtract(d, dBefore).toMinutes() > 0 && date.subtract(d, dAfter).toMinutes() < 0)
}

/**
 * Executes an insert operation on Google Calendar
 * @param {Object} setup Setup to pass to the Calendar API
 * @returns {Promise}
 */
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

/**
 * Executes a delete operation on Google Calendar
 * @param {Object} setup Setup to pass to the Calendar API
 * @returns {Promise}
 */
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

/**
 * Helper function to delete a Calendar event by ID
 * @param {string} calendarId ID of the Google Claendar
 * @param {Object} userAuth Auth object to use
 * @param {string} id ID of the event
 * @returns {Promise}
 */
exports.deleteEvent = async (calendarId, userAuth, id) => {
  return {
    auth: userAuth,
    calendarId: calendarId,
    eventId: id,
  }
}

/**
 * Excecutes a list operation on Google Calendar
 * @param {Object} setup Setup to pass to the Calendar API
 * @returns {Promise}
 */
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

/**
 * Helper function to list events on a Calendar with a certain sharedExtendedProperty
 * @param {string} calendarId ID of the Google Claendar
 * @param {Object} userAuth Auth object to use
 * @param {string} field Name of the field to filter with
 * @param {string} id Value of the field to filter with
 * @returns {Promise}
 */
exports.listEvents = async (calendarId, userAuth, field, id) => {
  return {
    calendarId: calendarId,
    sharedExtendedProperty: `${field}=${id}`,
    auth: userAuth,
  }
}

/**
 * Helper function to add an instance as an event to a user Calendar
 * @param {string} calendarId ID of the Google Claendar
 * @param {Object} data Instance data
 * @param {Object} userAuth Auth object to use
 * @param {string} id Value of the field to filter with
 * @returns {Promise}
 */
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

/**
 * Helper function to convert a Date to iCal representation
 * @param {Date} d Input date
 * @returns {string}
 */
const formatToICal = (d) => {
  const str = d.toISOString()
  return str.substring(0, str.length - 5).replace(/-|:/g, '').concat('Z')
}

/**
 * Helper function to add a repeating event in Calendar for a recurring meeting
 * for a single quarter
 * @param {string} calendarId ID of the Google Calendar to add to
 * @param {Object} data Details about the recurring meeting
 * @param {Object} userAuth Auth object of the user adding the recurring meeting
 * @param {string} id ID of the recurring meeting
 * @param {Object} termStart Start date of the quarter (Firebase timestamp)
 * @param {Object} termEnd End date of the quarter (Firebase timestamp)
 * @returns {Object[]}
 */
const addRecurringTerm = async (calendarId, data, userAuth, id, termStart, termEnd) => {
  const roomName = data.room ? await getRoom(data.room) : data.roomName
  const period = await getPeriod(data.period)

  // get the start and end time of the first instance of the recurring meeting
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

/**
 * Adds recurring events on Google Calendar to represent a recurring meeting
 * @param {string} calendarId ID of the Google Calendar to add to
 * @param {Object} data Details about the recurring meeting
 * @param {Object} userAuth Auth object for Calendar API
 * @param {string} id ID of the recurring meeting
 * @returns {Object[]}
 */
exports.addRecurring = async (calendarId, data, userAuth, id) => {
  const terms = await getTerms()
  let setups = []
  setups.push(await addRecurringTerm(calendarId, data, userAuth, id, terms.fallStart, terms.fallEnd))
  setups.push(await addRecurringTerm(calendarId, data, userAuth, id, terms.winterStart, terms.winterEnd))
  setups.push(await addRecurringTerm(calendarId, data, userAuth, id, terms.springStart, terms.springEnd))
  return setups
}

/**
 * Helper function to add a repeating event in Calendar for a single meeting time
 * of a single course
 * @param {string} calendarId ID of the Google Calendar to add to
 * @param {Object} data Details about the course
 * @param {Object} userAuth Auth object for Calendar API
 * @param {string} id ID of the course
 * @param {Object} termStart Start date of the quarter (Firebase timestamp)
 * @param {Object} termEnd End date of the quarter (Firebase timestamp)
 * @param {Object} time Particular time slot of the course to add
 * @returns {Object[]}
 */
const addCourseTime = async (calendarId, data, userAuth, id, termStart, termEnd, time) => {
  const room = await getRoom(data.room)
  const period = await getPeriod(`${time.day}-${time.period}`)

  // get the start and end time of the first instance of the time slot
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

/**
 * Returns the list of setups to add recurring events on Google Calendar to represent a course
 * @param {string} calendarId ID of the Google Calendar to add to
 * @param {Object} data Details about the course
 * @param {Object} userAuth Auth object for Calendar API
 * @param {string} id ID of the course
 * @returns {Object[]}
 */
exports.addCourse = async (calendarId, data, userAuth, id) => {
  const terms = await getTerms()
  let setups = []
  if (!data.times) return []
  // do each term for each time slot
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