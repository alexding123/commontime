import React, { lazy } from 'react'
import { Col, Row } from 'react-bootstrap'
import { connect } from 'react-redux'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import { Redirect, Route, Switch } from 'react-router-dom'
import { compose } from 'recompose'
import SplashScreen from '../SplashScreen'
import Sidebar from './Sidebar'
import ErrorBoundary from '../ErrorBoundary'

const Settings = lazy(() => import('./Settings'))
const Meetings = lazy(() => import('./Meetings'))

const ProfilePage = ({ profile }) => {
  if (!isLoaded(profile)) {
    return <SplashScreen/>
  }
  return (
    <Row style={{height: '100%'}}>
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

const enhance = compose(
  firestoreConnect([{
    collection: 'periods',
  }, {
    collection: 'rooms',
  }, {
    collection: 'exceptions',
  }]),
  connect(
    (state) => ({
      profile: state.firebase.profile,
    }),
  ),
)

export default enhance(ProfilePage)