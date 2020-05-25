import React from 'react'
import { connect } from 'react-redux'
import { isLoaded } from 'react-redux-firebase'
import { compose } from 'recompose'
import { updateSettings } from '../../../actions/profilePageActions'
import ErrorBoundary from '../../ErrorBoundary'
import ProfileForm from '../../forms/ProfileForm'
import SplashScreen from '../../SplashScreen'
import ResetCalendar from './ResetCalendar'

const Settings = ({auth, profile, handleSubmit}) => {
  if (!isLoaded(auth) || !isLoaded(profile)) {
    return <SplashScreen/>
  }
  return (<div>
    <h3 className="tabs-heading">Settings</h3>
    <div className="divider"/>
    <ErrorBoundary>
    <ProfileForm initialValues={{
      email: profile.allowEmail,
    }} onSubmit={handleSubmit(auth.uid)}/>
    <hr/>
    </ErrorBoundary>
    <ErrorBoundary>
    <ResetCalendar/>
    </ErrorBoundary>
  </div>)
}

const enhance = compose(
  connect((state) => ({
    auth: state.firebase.auth,
    profile: state.firebase.profile,
  }), (dispatch) => ({
    handleSubmit: (id) => (values) => dispatch(updateSettings(id, values))
  }))
)

export default enhance(Settings)