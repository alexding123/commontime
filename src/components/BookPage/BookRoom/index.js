import React from 'react'
import { compose, withProps } from 'recompose'
import { connect } from 'react-redux'
import Filters from './Filters'
import Display from './Display'
import { Button, Alert } from 'react-bootstrap'
import { toggleShowFilters } from '../../../actions/bookPageActions'
import { firestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase'
import SplashScreen from '../../SplashScreen'
import date from 'date-and-time'

const BookRoom = ({showFilters, toggleShowFilters, rooms, periods, profile, instances, users, data}) => {
  if (!isLoaded(rooms) || !isLoaded(periods) || !isLoaded(profile) || !isLoaded(instances) || !isLoaded(users) || !data) {
    return <SplashScreen/>
  }
  return (
  <div className="d-flex flex-column">
    <div className="show-when-small">
      <Button block onClick={toggleShowFilters}>Show filters</Button>
    </div>
    <div className="d-flex filters-display-container">
      <div className={"search-filters " + (showFilters ? '' : 'show-when-big')}>
        <Filters/>
      </div>
      <div className="search-display flex-grow-1 pb-2">
        { isEmpty(profile) ? 
          <Alert variant="danger">Currently, we display a list of free rooms for each period. You must log in to book these rooms. </Alert> : null }
        <Display/>
      </div>
    </div>
  </div>)
}

const enhance = compose(
  connect(state => ({
    rooms: state.firestore.data.rooms,
    periods: state.firestore.data.periods,
    profile: state.firebase.profile,
    data: state.bookPage.data,
    instances: state.firestore.data.instancesScheduleRoom,
    users: state.firestore.data.users,
    showFilters: state.bookPage.showFilters,
  }), dispatch => ({
    toggleShowFilters: () => dispatch(toggleShowFilters()),
  })),
  withProps(props => {
    const startDate = date.parse(date.format(new Date(props.data.dateRange.startDate), 'MM/DD/YYYY'), 'MM/DD/YYYY')
    const endDate = date.parse(date.format(date.addDays(new Date(props.data.dateRange.endDate), 1), 'MM/DD/YYYY'), 'MM/DD/YYYY')
    return {
      startDate,
      endDate
    }
  }),
  firestoreConnect(props => [{
    collection: 'rooms',
  }, {
    collection: 'periods',
  }, {
    collection: 'users',
  }, {
    collectionGroup: 'instances',
    where: [
      ['startDate', '>', props.startDate],
      ['startDate', '<', props.endDate],
    ],
    storeAs: 'instancesScheduleRoom'
  }]),
)

export default enhance(BookRoom)