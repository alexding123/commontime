// TODO

import React from 'react'
import { connect } from 'react-redux'
import { isEmpty, isLoaded } from 'react-redux-firebase'
import { compose, withHandlers } from 'recompose'
import { addRecurringAndInvite, addRecurringAndNotify } from '../../actions/meetingPageActions'
import { dayMap } from '../../utils'
import BookRecurringForm from '../forms/BookRecurringForm'
import SplashScreen from '../SplashScreen'
import PropTypes from 'prop-types'

/**
 * Subpage to book a recurring meeting at a selected period/place
 */
const BookRecurringPage = ({courses, periods, period, profile, rooms, people, recurrings, handleSubmit}) => {
  if (!isLoaded(profile) || !isLoaded(courses) || !isLoaded(rooms) || !isLoaded(periods) || !isLoaded(recurrings)) {
    return <SplashScreen/>
  }
  // only teachers can book private meetings
  const canBookPrivate = !isEmpty(profile) && profile.token.claims.teacher
  // only a teacher booking a meeting with only students can simsply notify
  // instead of invite the other members
  const isInvite = isEmpty(profile) || !profile.token.claims.teacher || !people.every(person => person.id === profile.id || !person.teacher)
  return (<div className="stage-container">
    <h5>Adding a weekly meeting for {`${dayMap[periods[period.period].day]} ${periods[period.period].name}`}</h5>
    <BookRecurringForm onSubmit={handleSubmit(isInvite)} isInvite={isInvite} canBookPrivate={canBookPrivate} period={period.period}/>
  </div>)
}

BookRecurringPage.propTypes = {
  courses: PropTypes.object,
  periods: PropTypes.object,
  /** Selected period for the weekly meeting */
  period: PropTypes.shape({
    period: PropTypes.string.isRequired,
  }).isRequired,
  profile: PropTypes.object,
  rooms: PropTypes.object,
  /** Selected members of the meeting */
  people: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
  })).isRequired,
  recurrings: PropTypes.object,
  /** Handler for submitting the form to book the weekly meeting */
  handleSubmit: PropTypes.func.isRequired,
}

const enhance = compose(
  connect(state => ({
    data: state.meetingPage,
    profile: state.firebase.profile,
    period: state.meetingPage.recurringPeriod,
    people: state.meetingPage.people,
    courses: state.firestore.data.courses,
    recurrings: state.firestore.data.recurrings,
    rooms: state.firestore.data.rooms,
    periods: state.firestore.data.periods,
  }), {
    addRecurringAndInvite,
    addRecurringAndNotify,
  }), 
  withHandlers({
    handleSubmit: props => isInvite => values => {
      if (isInvite) {
        props.addRecurringAndInvite(props.period.period, values)
      } else {
        props.addRecurringAndNotify(props.period.period, props.people, values)
      }
  
    }
  })
)

export default enhance(BookRecurringPage)