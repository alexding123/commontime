const date = require('date-and-time')

export const dateInBetween = (d, dBefore, dAfter) => {
  if (date.subtract(d, dBefore).toMinutes() > 0 && date.subtract(d, dAfter).toMinutes() < 0) {
    return true
  }
  return false
}

export const dayMap = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const getFreeRooms = (roomsDict, instancesDict) => {
  const rooms = roomsDict ? Object.values(roomsDict) : []
  if (!instancesDict) {
    return rooms
  }
  const instances = Object.values(instancesDict)
  let roomsMap = {}
  rooms.forEach(room => {
    roomsMap[room.id] = true
  })
  instances.forEach(instance => {
    if (!instance) return
    roomsMap[instance.room] = false
  })
  return rooms.filter(room => roomsMap[room.id])
}

export const getFreeRecurringRooms = (roomsDict, coursesDict, recurringsDict, period) => {
  const rooms = roomsDict ? Object.values(roomsDict) : []
  let roomsMap = {}
  const courses = coursesDict ? Object.values(coursesDict) : []
  const recurrings = recurringsDict ? Object.values(recurringsDict) : []
  rooms.forEach(room => {
    roomsMap[room.id] = true
  })
  courses.forEach(course => {
    if (!course.times) return
    course.times.forEach(time => {
      if (`${time.day}-${time.period}` === period) {
        roomsMap[time.room] = false
      }
    })
  })
  recurrings.forEach(recurring => {
    roomsMap[recurring.period] = false
  })
  return rooms.filter(room => roomsMap[room.id])
}

const getFreeInstancesForDate = (instancesDict, periods, rooms, forDate) => {
  const periodsForDay = periods.filter(period => period.day === forDate.getDay())
  let availbilityMap = {}
  periodsForDay.forEach(period => {
    availbilityMap[`${period.period}`] = {}
    rooms.forEach(room => {
      availbilityMap[`${period.period}`][room.id] = null
    })
  })
  const formattedDateStr = date.format(forDate, 'MM/DD/YYYY')
  Object.entries(instancesDict).filter(([key, instance]) => instance && instance.date === formattedDateStr).forEach(([key, instance]) => {
    if (!periodsForDay.map(period => `${period.period}`).includes(instance.period.split('-')[1]) || !rooms.map(room => room.id).includes(instance.room)) {
      return
    }
    if (instance.type === 'event') {
      availbilityMap[instance.period.split('-')[1]][instance.room] = {
        booked: true,
        instance: {...instance, key},
      }
    } else {
      availbilityMap[instance.period.split('-')[1]][instance.room] = {
        booked: true,
      }
    }
  })
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
  while (date.subtract(endDate, currentDate).toDays() >= 0) {
    const newInstances = getFreeInstancesForDate(instancesDict, periods, rooms, currentDate)
    results = results.concat(newInstances)
    currentDate = date.addDays(currentDate, 1)
  }
  return results
}

const generateAllPeriods = (startDate, endDate, periods) => {
  let currentDate = date.parse(date.format(startDate, 'MM/DD/YYYY'), 'MM/DD/YYYY')
  endDate = date.parse(date.format(endDate, 'MM/DD/YYYY'), 'MM/DD/YYYY')
  let periodMap = {} // date => periods
  while (date.subtract(endDate, currentDate).toDays() >= 0) {
    const currentDateDay = currentDate.getDay()
    const currentDateFormat = date.format(currentDate, 'MM/DD/YYYY')
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

export const getCommonFreePeriods = (instancesDict, periodsDict, data) => {
  // if there's not a single instance that day,
  // there must be no class 
  const periodsFilter = data.periods.map(period => period.period)
  const people = data.people
  const periods = periodsDict ? Object.values(periodsDict).filter(period => periodsFilter.includes(period.period)) : []
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

export const getCommonRecurringPeriods = (coursesDict, recurringsDict, periodsDict, data) => {
  const periodsFilter = data.periods.map(period => period.period)
  const people = data.people
  const periods = periodsDict ? Object.values(periodsDict).filter(period => periodsFilter.includes(period.period)) : []
  const courses = coursesDict ? Object.values(coursesDict) : []
  const recurrings = recurringsDict ? Object.values(recurringsDict) : []
  let retMap = {}
  periods.forEach(period => {
    retMap[`${period.day}-${period.period}`] = {
      ok: true,
      conflicts: [],
    }
  })

  people.forEach(person => {
    courses.forEach(course => {
      if (!course || !course.members.includes(person.id) || !course.times) return
      course.times.forEach(time => {
        if (!retMap[`${time.day}-${time.period}`]) return
        retMap[`${time.day}-${time.period}`].ok = false
      })
    })
    recurrings.forEach(recurring => {
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

export const shortenCourseName = (name) => {
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
  replacements.forEach(([original, replacement]) => {
    replaced = replaced.replace(original, replacement)
  })

  return replaced
}

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

export const defaultExcludeRooms = ['WWOff', 'Lib', '4-ART', '5C', '5P', '2B', 'Gym', 'LA']

export const defaultExcludePeriods = ['Before School', 'After School', 'Assembly', 'Recess', 'Class Meetings', 'Lunch']


const getDeltaTime = (period, currentTime, currentDate) => {
  const [startHour, startMinute] = period.startTime.split(':').map(n => Number(n))
  const [endHour, endMinute] = period.endTime.split(':').map(n => Number(n))
  const startTime = date.addMinutes(date.addHours(currentDate, startHour), startMinute)
  const endTime = date.addMinutes(date.addHours(currentDate, endHour), endMinute)
  return {
    startTime: date.subtract(currentTime, startTime).toMinutes(),
    endTime: date.subtract(currentTime, endTime).toMinutes(),
    period: period,
  }
}

export const getCurrentPeriod = (periodsDict, terms, currentTime) => {
  const periods = periodsDict ? Object.values(periodsDict) : []
  const periodsToday = periods.filter(period => period.day === currentTime.getDay())
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