const date = require('date-and-time')

export const getPeriodTimes = (state, periodDate, periodID) => {
  periodDate = date.parse(date.format(periodDate, 'MM/DD/YYYY'), 'MM/DD/YYYY')
  const period = state.firestore.data.periods[periodID]
  const [startHours, startMinutes] = period.startTime.split(':').map(n => Number(n))
  const [endHours, endMinutes] = period.endTime.split(':').map(n => Number(n))
  return {
    startDate: date.addMinutes(date.addHours(periodDate, startHours), startMinutes),
    endDate: date.addMinutes(date.addHours(periodDate, endHours), endMinutes),
  }
}