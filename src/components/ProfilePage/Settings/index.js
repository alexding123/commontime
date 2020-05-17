import React from 'react'
import { compose } from 'recompose'
import ProfileForm from '../../forms/ProfileForm'
import { isLoaded } from 'react-redux-firebase'
import SplashScreen from '../../SplashScreen'
import { connect } from 'react-redux'
import { updateSettings } from '../../../actions/profilePageActions'
import AddCalendar from './AddCalendar'
import ErrorBoundary from '../../ErrorBoundary'

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
    <AddCalendar/>
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