import React, { lazy } from 'react'
import { Row, Col } from 'react-bootstrap'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import Sidebar from './Sidebar'
import { Switch, Route, Redirect } from 'react-router-dom'
import ErrorBoundary from '../ErrorBoundary'
const AnnualBoard = lazy(() => import('./AnnualBoard'))
const NotFoundPage = lazy(() => import('../NotFoundPage'))
const DangerZone = lazy(() => import('./DangerZone'))
const Dashboard = lazy(() => import('./Dashboard'))
const Courses = lazy(() => import('./Courses'))
const AddCourse = lazy(() => import('./AddCourse'))
const EditCourse = lazy(() => import('./EditCourse'))
const Users = lazy(() => import('./Users'))
const AddUser = lazy(() => import('./AddUser'))
const EditUser = lazy(() => import('./EditUser'))

const AdministratorPage = ({ profile }) => {
  if (!profile.token.claims.admin) {
    return <NotFoundPage/>
  }
  return (
    <Switch>
    <Route exact path="/Administrator/DangerZone"><DangerZone/></Route>
    <Route path="*">
      <Row style={{height: '100%'}}>
        <Sidebar/>
        <Col className="ml-auto px-4 pt-3">
          <ErrorBoundary>
          <Switch>
            <Route exact path="/Administrator/Dashboard"><Dashboard/></Route>
            <Route exact path="/Administrator/Annual"><AnnualBoard/></Route>
            <Route exact path="/Administrator/Courses"><Courses/></Route>
            <Route exact path="/Administrator/Courses/:id"><EditCourse/></Route>
            <Route exact path="/Administrator/AddCourse"><AddCourse/></Route>
            <Route exact path="/Administrator/Users"><Users/></Route>
            <Route exact path="/Administrator/Users/:id"><EditUser/></Route>
            <Route exact path="/Administrator/AddUser"><AddUser/></Route>
            <Route path="*"><Redirect from="*" to="/Administrator/Dashboard"/></Route>
          </Switch>
          </ErrorBoundary>
        </Col>
      </Row>
    </Route>
    </Switch>
  )
}

const enhance = compose(
  connect(
    (state) => ({
      auth: state.firebase.auth,
      profile: state.firebase.profile,
    }),
  ),
)

export default enhance(AdministratorPage)