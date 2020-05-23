import React from 'react'
import { connect } from 'react-redux'
import { isEmpty } from 'react-redux-firebase'
import { compose } from 'recompose'
import { updateFilters } from '../../../actions/bookPageActions'
import { defaultExcludePeriods, defaultExcludeRooms, filterDuplicate } from '../../../utils'
import ScheduleRoomForm from '../../forms/ScheduleRoomForm'

const Filters = ({rooms, periods, profile, handleSubmit}) => {
  rooms = rooms ? Object.values(rooms) : []
  periods = periods ? filterDuplicate(Object.values(periods), 'period') : []
  const initRooms = rooms.filter(room => room && !defaultExcludeRooms.includes(room.id))
  const initPeriods = periods.filter(period => period && !defaultExcludePeriods.includes(period.period))

  return (
    <ScheduleRoomForm 
      onSubmit={handleSubmit}
      initialValues={{
        rooms: initRooms,
        periods: initPeriods,
        dateRange: {
          startDate: new Date(),
          endDate: new Date(),
        },
        allowRebook: false
      }} rooms={rooms} periods={periods}
      canRebook={!isEmpty(profile) && profile.token.claims.teacher}
    />
  )
}

const enhance = compose(
  connect(state => ({
    rooms: state.firestore.data.rooms,
    periods: state.firestore.data.periods,
    profile: state.firebase.profile,
  }), dispatch => ({
    handleSubmit: (values) => dispatch(updateFilters(values)),
  })),
)

export default enhance(Filters)