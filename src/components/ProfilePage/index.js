import React, { lazy } from 'react'
import { Col, Row } from 'react-bootstrap'
import { connect } from 'react-redux'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import { Redirect, Route, Switch } from 'react-router-dom'
import { compose } from 'recompose'
import SplashScreen from '../SplashScreen'
import Sidebar from './Sidebar'
import ErrorBoundary from '../ErrorBoundary'
import PropTypes from 'prop-types'

const Settings = lazy(() => import('./Settings'))
const Meetings = lazy(() => import('./Meetings'))

/**
 * Page to display the user profile and settings
 */
const ProfilePage = ({ profile, users }) => {
  if (!isLoaded(profile) || !isLoaded(users)) {
    return <SplashScreen/>
  }
  return (
    <Row className="sidebar-page">
      <Sidebar/>
      <Col className="ml-auto px-4 pt-3">
        <ErrorBoundary>
        <Switch>
          <Route exact path="/Profile/Settings"><Settings/></Route>
          <Route exact path="/Profile/Meetings"><Meetings/></Route>
          <Route path="/Profile*"><Redirect from="*" to="/Profile/Meetings"/></Route>
        </Switch>
        </ErrorBoundary>
      </Col>
    </Row>
  )
}

ProfilePage.propTypes = {
  profile: PropTypes.object,
  users: PropTypes.object,
}

const enhance = compose(
  firestoreConnect([{
    collection: 'periods',
  }, {
    collection: 'rooms',
  }, {
    collection: 'exceptions',
  }, {
    collection: 'userPreset',
  }]),
  connect(
    (state) => ({
      profile: state.firebase.profile,
      users: state.firestore.data.userPreset,
    }),
  ),
)

export default enhance(ProfilePage)