const date = require('date-and-time')

/**
 * Supplies an array of helper functions and constants used in various
 * places of the app
 */

/**
 * Returns whether a date is between two other dates
 * @param {Date} d The date to check
 * @param {Date} dBefore The starting date range
 * @param {Date} dAfter The ending date range
 * @returns {bool}
 */
export const dateInBetween = (d, dBefore, dAfter) => {
  return (date.subtract(d, dBefore).toMinutes() > 0 && date.subtract(d, dAfter).toMinutes() < 0)
}

/**
 * A constant to map from day number to the corresponding English representation
 */
export const dayMap = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

/**
 * Returns a list of rooms that are free for a certain time slot
 * @param {Object} roomsDict All potential rooms
 * @param {Object} instancesDict All preexisting events and courses happening on the time slot
 * @returns {Object[]}
 */
export const getFreeRooms = (roomsDict, instancesDict) => {
  const rooms = roomsDict ? Object.values(roomsDict) : []
  // if no event, all rooms are free
  if (!instancesDict) {
    return rooms
  }
  const instances = Object.values(instancesDict)
  // by default, all rooms are free
  let roomsMap = {}
  rooms.forEach(room => {
    roomsMap[room.id] = true
  })
  // if there's a meeting in a room, set the room to false
  instances.forEach(instance => {
    if (!instance) return
    roomsMap[instance.room] = false
  })
  // get all rooms that are still free
  return rooms.filter(room => roomsMap[room.id])
}

/**
 * Returns a list of rooms that are regularly free in a given period
 * @param {Object} roomsDict All potential rooms
 * @param {Object} coursesDict All courses
 * @param {Object} recurringsDict All recurirng meetings
 * @param {string} period The ID of the period to check free rooms for
 * @returns {Object[]}
 */
export const getFreeRecurringRooms = (roomsDict, coursesDict, recurringsDict, period) => {
  const rooms = roomsDict ? Object.values(roomsDict) : []
  let roomsMap = {}
  const courses = coursesDict ? Object.values(coursesDict) : []
  const recurrings = recurringsDict ? Object.values(recurringsDict) : []
  // by default, all rooms are free
  rooms.forEach(room => {
    roomsMap[room.id] = true
  })
  // check all courses and mark any occupied room
  courses.forEach(course => {
    if (!course.times) return
    course.times.forEach(time => {
      // filter to only courses that happen during the selected period
      if (`${time.day}-${time.period}` === period) {
        roomsMap[time.room] = false
      }
    })
  })
  // check all recurring meetings and mark any occupied room
  recurrings.forEach(recurring => {
    roomsMap[recurring.period] = false
  })
  // get all rooms that are still free
  return rooms.filter(room => roomsMap[room.id])
}

/**
 * Returns a list of time-location pairs in a given date that have no class during it
 * Each time-location pair contains a list of (potentially empty) other meetings
 * during it  
 * @param {Object} instancesDict List of preexisting meetings
 * @param {Object[]} periods List of acceptable periods
 * @param {Object[]} rooms List of acceptable rooms
 * @param {Date} forDate Given date to find free times for
 * @returns {Object[]}
 */
const getFreeInstancesForDate = (instancesDict, periods, rooms, forDate) => {
  // get all periods on the given date
  const periodsForDay = periods.filter(period => period.day === forDate.getDay())
  let availbilityMap = {} // access: availabilityMap[periodID][roomID]
  periodsForDay.forEach(period => {
    availbilityMap[`${period.period}`] = {}
    rooms.forEach(room => {
      availbilityMap[`${period.period}`][room.id] = null
    })
  })
  const formattedDateStr = date.format(forDate, 'MM/DD/YYYY')
  // use only instances on the correct date
  Object.entries(instancesDict).filter(([key, instance]) => instance && instance.date === formattedDateStr).forEach(([key, instance]) => {
    // if the instance's room or period is not on the acceptable list, ignore
    if (!periodsForDay.map(period => `${period.period}`).includes(instance.period.split('-')[1]) || !rooms.map(room => room.id).includes(instance.room)) {
      return
    }
    
    if (instance.type === 'event') {
      // append the instance to the list if it's an event
      availbilityMap[instance.period.split('-')[1]][instance.room] = {
        booked: true,
        instance: {...instance, key},
      }
    } else {
      // don't append if it's a course
      availbilityMap[instance.period.split('-')[1]][instance.room] = {
        booked: true,
      }
    }
  })

  // prepare the return data
  let returnInstances = []
  periodsForDay.forEach(period => {
    rooms.forEach(room => {
      const availability = availbilityMap[`${period.period}`][room.id]
      if (!availability) {
        returnInstances.push({
          period: period,
          room: room,
          date: forDate,
          instance: null,
        })
      } else if (availability.instance) {
        returnInstances.push({
          period: period,
          room: room,
          date: forDate,
          instance: availability.instance,
        })
      }
    })
  })
  return returnInstances
}

/**
 * Returns all time-place pairs within a defined time range that have no class
 * Each pair is associated with a potentially empty list of meetings that happen during it
 * @param {*} instancesDict All instances within the time frame
 * @param {*} periodsDict All periods
 * @param {Object} data Description of the users' filter specification
 * @returns {Object[]}
 */
export const getFreeInstances = (instancesDict, periodsDict, data) => {
  // if there's not a single instance that day,
  // there must be no class 
  const periodsFilter = data.periods.map(period => period && period.period)
  const periods = periodsDict ? Object.values(periodsDict).filter(period => period && periodsFilter.includes(period.period)) : null
  const rooms = data.rooms
  if (!instancesDict) {
    return []
  }
  let results = []
  let currentDate = date.parse(date.format(data.dateRange.startDate, 'MM/DD/YYYY'), 'MM/DD/YYYY')
  const endDate = date.parse(date.format(data.dateRange.endDate, 'MM/DD/YYYY'), 'MM/DD/YYYY')
  // iterate through each day and concatenate the results
  while (date.subtract(endDate, currentDate).toDays() >= 0) {
    const newInstances = getFreeInstancesForDate(instancesDict, periods, rooms, currentDate)
    results = results.concat(newInstances)
    currentDate = date.addDays(currentDate, 1)
  }
  return results
}

/**
 * Returns an availability map of all periods between a given date range
 * @param {Date} startDate Starting date of the range
 * @param {Date} endDate Ending date of the range
 * @param {Object[]} periods List of all periods
 * @returns {Object}
 */
const generateAllPeriods = (startDate, endDate, periods) => {
  let currentDate = date.parse(date.format(startDate, 'MM/DD/YYYY'), 'MM/DD/YYYY')
  endDate = date.parse(date.format(endDate, 'MM/DD/YYYY'), 'MM/DD/YYYY')
  let periodMap = {} // date => periods
  // iterate through all dates between the two
  while (date.subtract(endDate, currentDate).toDays() >= 0) {
    const currentDateDay = currentDate.getDay()
    const currentDateFormat = date.format(currentDate, 'MM/DD/YYYY')
    // get all periods on that weekday
    const periodsForDate = periods.filter(period => period.day === currentDateDay)
    periodMap[currentDateFormat] = {}
    periodsForDate.forEach(period => {
      periodMap[currentDateFormat][`${period.period}`] = {
        ok: true,
      }
    })
    currentDate = date.addDays(currentDate, 1)
  }
  return periodMap
}

/**
 * Returns a list of class-free time-place pairs shared by a group of people within
 * a given date range. Each pair has a potentially empty list of meetings (conflicts) 
 * @param {Object} instancesDict All preexisting meetings and classes in the time range 
 * @param {Object} periodsDict All periods
 * @param {Object} data Search filter parameters
 * @returns {Object[]}
 */
export const getCommonFreePeriods = (instancesDict, periodsDict, data) => {
  // if there's not a single instance that day,
  // there must be no class 
  const periodsFilter = data.periods.map(period => period.period)
  const people = data.people
  const periods = periodsDict ? Object.values(periodsDict).filter(period => periodsFilter.includes(period.period)) : []
  // if no instance, must be a date range where there's no school, hence no free period
  if (!instancesDict) {
    return []
  }
  // generate a list of candidate date-period pairs
  const allPeriods = generateAllPeriods(data.dateRange.startDate, data.dateRange.endDate, periods)
  people.forEach(person => {
    Object.entries(instancesDict).forEach(([key, instance]) => {
      if (!instance) {
        return
      }
      if (instance.members.includes(person.id)) {
        if (!allPeriods[instance.date]) {
          return
        }
        if (allPeriods[instance.date][instance.period.split('-')[1]]) {
          allPeriods[instance.date][instance.period.split('-')[1]].ok = false
          // if it's an event (not a course), concatenate the conflict to the list of instances (to show all conflicts)
          if (instance.type === 'event') {
            const instanceToAssign = {...instance, key, person }
            allPeriods[instance.date][instance.period.split('-')[1]]['instances'] = 
            allPeriods[instance.date][instance.period.split('-')[1]]['instances'] ?
            allPeriods[instance.date][instance.period.split('-')[1]]['instances'].concat(instanceToAssign) : 
            [instanceToAssign]
          }
        }
      }
    })
  })
  // prepare return data
  let freePeriods = []
  Object.entries(allPeriods).forEach(([periodDate, periodsForDate]) => {
    Object.entries(periodsForDate).forEach(([period, value]) => {
      if (value.ok || value.instances) {
        freePeriods = freePeriods.concat([{
          period: `${date.parse(periodDate, 'MM/DD/YYYY').getDay()}-${period}`,
          date: periodDate,
          ok: value.ok,
          instances: value.instances,
        }])
      }
    })
  })
  return freePeriods
}

/**
 * Returns a list of class-free weekly time-place pairs shared by a group of people within
 * a given date range. Each pair has a potentially empty list of recurring meeting conflicts 
 * @param {*} coursesDict All courses
 * @param {*} recurringsDict All recurirng meetings
 * @param {*} periodsDict All periods
 * @param {*} data Search filters
 */
export const getCommonRecurringPeriods = (coursesDict, recurringsDict, periodsDict, data) => {
  const periodsFilter = data.periods.map(period => period.period)
  const people = data.people
  // filter out potential null values
  const periods = periodsDict ? Object.values(periodsDict).filter(period => period && periodsFilter.includes(period.period)) : []
  const courses = coursesDict ? Object.values(coursesDict).filter(course => course) : []
  const recurrings = recurringsDict ? Object.values(recurringsDict).filter(recurring => recurring) : []
  let retMap = {}
  periods.forEach(period => {
    retMap[`${period.day}-${period.period}`] = {
      ok: true,
      conflicts: [],
    }
  })

  // iterate through people
  people.forEach(person => {
    // account for all courses
    courses.forEach(course => {
      // if person not in the course, skip
      if (!course || !course.members.includes(person.id) || !course.times) return
      course.times.forEach(time => {
        if (!retMap[`${time.day}-${time.period}`]) return
        retMap[`${time.day}-${time.period}`].ok = false
      })
    })
    // account for all recurring meetings
    recurrings.forEach(recurring => {
      // if perosn not in the recurring meeting, skip
      if (!recurring.members.includes(person.id)) return
      if (!retMap[recurring.period]) return
      retMap[recurring.period].ok = false
      retMap[recurring.period].conflicts.push({
        ...recurring,
        person,
      })
    })
  })
  let freePeriods = []
  Object.entries(retMap).forEach(([period, value]) => {
    if (value.ok || value.conflicts.length) {
      freePeriods.push({
        conflicts: value.conflicts,
        period,
      })
    }
  })
  return freePeriods
}

/**
 * Helper function to return a display text given the state right now
 * @param {string} state What "now" translates to qualitatively
 * @param {Object} period The period "now" is in (could be empty)
 * @param {Date} currentDate Today
 * @returns {string}
 */
export const getCurrentStatus = (state, period, currentDate) => {
  if (state === 'weekend') {
    return 'It is now the weekend.'
  }

  if (state === 'beforeSchool') {
    return 'It is now before school.'
  }

  if (state === 'afterSchool') {
    return 'It is now after school.'
  }

  if (state === 'summerBefore') {
    return 'It is the summer before school starts.'
  }

  if (state === 'summerAfter') {
    return 'It is the summer after school ends.'
  }

  if (state === 'winterBreak') {
    return 'It is now winter break.'
  }

  if (state === 'springBreak') {
    return 'It is now spring break.'
  }

  if (state === 'before') {
    return `It is now the break before ${period.name}, ${dayMap[period.day]} (${period.startTime}-${period.endTime}), ${date.format(currentDate, 'MMMM DD, YYYY')}.`
  }

  if (state === 'during') {
    return `It is now ${period.name}, ${dayMap[period.day]} (${period.startTime}-${period.endTime}), ${date.format(currentDate, 'MMMM DD, YYYY')}.`
  }

}

/**
 * Helper function to shorten a course name
 * @param {string} name Full name of the course
 */
export const shortenCourseName = (name) => {
  // list of replacements
  const replacements = [
    ['Reasons for Writing', 'RW'],
    ['Reading in Ethics', 'Read. in Ethics'],
    ['United States History', 'US History'],
    ['Modern European History', 'Mod. Euro. History'],
    ['History of Modern East Asia', 'MEH'],
    ['American Culture and Politics, 1968–Present', 'Amer. Cult. & Poli.'],
    ['Algebra 2/Precalculus Advanced', 'Alg. 2/Precalc. Advanced'],
    ['Language and Ethics', 'Lang. and Ethics'],
    ['Readings in Ethics', 'Read. in Ethics'],
    ['Advanced Topics in Anatomy & Physiology', 'Anatomy & Physio.'],
    ['Computer Science 1: The Design of Computer Programs', 'CS 1'],
    ['Computer Science 2: AP Computer Science Principles', 'CS 2'],
    ['Computer Science 3: Data Structures and Algorithms', 'CS 3'],
    ['Computer Science 4: Advanced Topics in Computer Science', 'CS 4'],
    ['Theoretical Calculus', 'Theo. Calculus'],
    ['Multivariable Calculus', 'Multi Calculus'],
    ['Statistics (Half-credit)', 'Statistics (Half)'],
    ['Health and Community', 'Health & Comm.'],
    ['Project Week/Senior Project', 'Project Week'],
    ['Accelerated', 'Accel.'],
    ['Advanced', 'Adv.'],
    ['Intermediate', 'Interm.'],
    ['Conversation', 'Conv.'],
    ['Literature', 'Lit.'],
  ]
  let replaced = name
  // try each replacement out
  replacements.forEach(([original, replacement]) => {
    replaced = replaced.replace(original, replacement)
  })

  return replaced
}

/**
 * Helper function to filter out duplicate values in an array
 * @param {any[]} arr Input array
 * @param {string} idKey Access key to uniquely identify each item
 * @returns {any[]}
 */
export const filterDuplicate = (arr, idKey='id') => {
  const seen = new Set()
  return arr.filter(el => {
    if (!el) {
      return false
    }
    const duplicate = seen.has(el[idKey])
    seen.add(el[idKey])
    return !duplicate
  })
}

/**
 * Rooms to exclude from a list of options by default
 */
export const defaultExcludeRooms = ['WWOff', 'Lib', '4-ART', '5C', '5P', '2B', 'Gym', 'LA']
/**
 * Periods to exclude from a list of options by default
 */
export const defaultExcludePeriods = ['Before School', 'After School', 'Assembly', 'Recess', 'Class Meetings', 'Lunch']

/**
 * Returns the difference in time between now and the start and end times of a given period
 * @param {Object} period The given period
 * @param {Date} currentTime "Now"
 * @param {Date} currentDate The current date (with its time components set to 0)
 * @returns {Object}
 */
const getDeltaTime = (period, currentTime, currentDate) => {
  // build Date components for the period
  const [startHour, startMinute] = period.startTime.split(':').map(n => Number(n))
  const [endHour, endMinute] = period.endTime.split(':').map(n => Number(n))
  const startTime = date.addMinutes(date.addHours(currentDate, startHour), startMinute)
  const endTime = date.addMinutes(date.addHours(currentDate, endHour), endMinute)
  return {
    // integers of the number of minutes between now and the start and end times
    startTime: date.subtract(currentTime, startTime).toMinutes(),
    endTime: date.subtract(currentTime, endTime).toMinutes(),
    period: period,
  }
}

/**
 * Returns a description of what kind of time "now" is and (potentially) what period it is 
 * associated with
 * @param {Object} periodsDict All periods
 * @param {Object} terms Definition of beginning and end of various academic quarters
 * @param {Date} currentTime "Now" 
 * @returns {Object}
 */
export const getCurrentPeriod = (periodsDict, terms, currentTime) => {
  const periods = periodsDict ? Object.values(periodsDict) : []
  const periodsToday = periods.filter(period => period.day === currentTime.getDay())
  // eliminate the time elements and just keep the date
  const currentDate = new Date(currentTime.toDateString())
  if (date.subtract(terms.fallStart.toDate(), currentDate).toDays() > 0) {
    return {
      state: 'summerBefore',
      period: null,
    }
  }
  if (dateInBetween(currentDate, terms.fallEnd.toDate(), terms.winterStart.toDate())) {
    return {
      state: 'winterBreak',
      period: null,
    }
  }
  if (dateInBetween(currentDate, terms.winterEnd.toDate(), terms.springStart.toDate())) {
    return {
      state: 'springBreak',
      period: null,
    }
  }
  if (date.subtract(currentDate, terms.springEnd.toDate()).toDays() > 0) {
    return {
      state: 'summerAfter',
      period: null,
    }
  }
  if (periodsToday.length === 0) {
    return {
      state: 'weekend',
      period: null,
    }
  }
  const deltas = periodsToday.map(period => getDeltaTime(period, currentTime, currentDate))
  const between = deltas.filter(delta => (delta.startTime >= 0 && delta.endTime < 0))
  if (between.length === 1) {
    return {
      state: 'during',
      period: between[0].period,
    }
  }
  const breakBefore = deltas.filter(delta => (delta.startTime < 0 && delta.startTime >= -5))
  if (breakBefore.length === 1) {
    return {
      state: 'before',
      period: breakBefore[0].period,
    }
  }
  const before = deltas.filter(delta => (delta.startTime < 0))
  if (before.length > 0) {
    return {
      state: 'beforeSchool',
      period: null,
    }
  }
  return {
    state: 'afterSchool',
    period: null,
  }
}

export const getUserByID = (users, id) => {
  if (!users || !id) return null
  const usersArray = Object.values(users).filter(user => user)
  const filtered = usersArray.filter(user => user.id === id)
  if (filtered.length === 1) {
    return filtered[0]
  }
  return null
}

/**
 * Converts a period's start and end times to Date objects
 * @param {Object} state The Redux Store
 * @param {string} periodDate MM/DD/YYYY formatted date that the period is in
 * @param {string} periodID ID of the period 
 */
export const getPeriodTimes = (state, periodDate, periodID) => {
  periodDate = date.parse(periodDate, 'MM/DD/YYYY')
  const period = state.firestore.data.periods[periodID]
  const [startHours, startMinutes] = period.startTime.split(':').map(n => Number(n))
  const [endHours, endMinutes] = period.endTime.split(':').map(n => Number(n))
  return {
    startDate: date.addMinutes(date.addHours(periodDate, startHours), startMinutes),
    endDate: date.addMinutes(date.addHours(periodDate, endHours), endMinutes),
  }
}