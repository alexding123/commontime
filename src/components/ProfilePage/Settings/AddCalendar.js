import React from 'react'
import { connect } from 'react-redux'
import { isLoaded } from 'react-redux-firebase'
import { compose } from 'recompose'
import SplashScreen from '../../SplashScreen'
import { Button } from 'react-bootstrap'

const AddCalendar = ({profile}) => {
  if (!isLoaded(profile)) {
    return <SplashScreen/>
  }
  return (<div>
    <p>Accidentally removed your Commontime Calendar? Click the button below to add it back to your Google Calendar</p>
    <Button onClick={() => {window.open(`https://calendar.google.com/calendar/r?cid=${profile.calendar}`, '_blank', 'toolbar=0,location=0,menubar=0')}}>Add Google Calendar</Button>
  </div>)
}

const enhance = compose(
  connect((state) => ({
    profile: state.firebase.profile,
  }))
)

export default enhance(AddCalendar)