import React from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { isLoaded } from 'react-redux-firebase'
import { compose } from 'recompose'
import { notificationSet } from '../../../actions/notificationsActions'
import SplashScreen from '../../SplashScreen'
import PropTypes from 'prop-types'

/**
 * Component to allow user to reset their Google Calendar
 */
const ResetCalendar = ({profile, resetCalendar}) => {
  if (!isLoaded(profile)) {
    return <SplashScreen/>
  }
  return (<div>
    <p>Is your Commontime calendar not created by the system, accidentally deleted, or somehow corrupted? Click the button below to manually reset it. </p>
    <Button onClick={resetCalendar(profile)}>Reset Google Calendar</Button>
  </div>)
}

ResetCalendar.propTypes = {
  profile: PropTypes.object,
  /** Handler to reset user's Google Calendar */
  resetCalendar: PropTypes.func.isRequired,
}

const enhance = compose(
  connect((state) => ({
    profile: state.firebase.profile,
  }), dispatch => ({
    resetCalendar: (profile) => () => dispatch(notificationSet('confirmResetCalendar', {
      profile,
    }))
  }))
)

export default enhance(ResetCalendar)