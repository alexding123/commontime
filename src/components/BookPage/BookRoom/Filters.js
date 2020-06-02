import React from 'react'
import { connect } from 'react-redux'
import { isEmpty } from 'react-redux-firebase'
import { compose } from 'recompose'
import { updateFilters } from '../../../actions/bookPageActions'
import { defaultExcludePeriods, defaultExcludeRooms, filterDuplicate } from '../../../utils'
import ScheduleRoomForm from '../../forms/ScheduleRoomForm'
import PropTypes from 'prop-types'

/** 
 * Component to allow the user to filter instances to display
 */
const Filters = ({rooms, periods, profile, handleSubmit}) => {
  const allRooms = rooms ? Object.values(rooms).filter(room => room) : []
  const allPeriods = periods ? filterDuplicate(Object.values(periods), 'period') : []
  // exclude the rooms and periods the users haven't selected
  const initRooms = allRooms.filter(room => room && !defaultExcludeRooms.includes(room.id))
  const initPeriods = allPeriods.filter(period => period && !defaultExcludePeriods.includes(period.period))

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
      }} rooms={allRooms} periods={allPeriods}
      canRebook={!isEmpty(profile) && profile.token.claims.teacher}
    />
  )
}

Filters.propTypes = {
  rooms: PropTypes.object,
  periods: PropTypes.object,
  profile: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
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