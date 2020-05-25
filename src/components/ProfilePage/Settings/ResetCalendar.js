import React from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { isLoaded } from 'react-redux-firebase'
import { compose } from 'recompose'
import { notificationSet } from '../../../actions/notificationsActions'
import SplashScreen from '../../SplashScreen'

const ResetCalendar = ({profile, resetCalendar}) => {
  if (!isLoaded(profile)) {
    return <SplashScreen/>
  }
  return (<div>
    <p>Is your Commontime calendar not created by the system, accidentally deleted, or somehow corrupted? Click the button below to manually reset it. </p>
    <Button onClick={resetCalendar(profile)}>Reset Google Calendar</Button>
  </div>)
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