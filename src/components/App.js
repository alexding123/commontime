import React, { lazy, Suspense } from 'react'
import Container from 'react-bootstrap/Container'
import { Route, Switch } from 'react-router-dom'
import { compose } from 'recompose'
import { hot } from 'react-hot-loader/root'
import AdministratorRoute from '../utils/AdministratorRoute'
import AuthIsLoaded from '../utils/AuthIsLoaded'
import PrivateRoute from '../utils/PrivateRoute'
import Navbar from './Navbar'
import Notifications from './Notifications'
import SplashScreen from './SplashScreen'
import ErrorBoundary from './ErrorBoundary'
const AdministratorPage = lazy(() => import('./AdministratorPage'))
const BookPage = lazy(() => import('./BookPage'))
const DevTools = lazy(() => import('./DevTools'))
const HomePage = lazy(() => import('./HomePage'))
const InvitationPage = lazy(() => import('./InvitationPage'))
const LoginPage = lazy(() => import('./LoginPage'))
const MeetingPage = lazy(() => import('./MeetingPage'))
const NotFoundPage = lazy(() => import('./NotFoundPage'))
const ProfilePage = lazy(() => import('./ProfilePage'))
const RoomPage = lazy(() => import('./RoomPage'))

/**
 * The main app, including the primary router and support
 * for lazy loading (Suspense) and optional DevTools
 */
const App = () => (
  <Suspense fallback={<SplashScreen/>}>
    {/** Requires that firebase.auth is loaded before proceeding */}
    <AuthIsLoaded>
    {/** Overlay notifications */}
    <ErrorBoundary>
    <Notifications/>
    </ErrorBoundary>
    {/** Primary routing */}
    <Switch>
      <Route path="/Login"><LoginPage/></Route>
      <Route path="*">
        <Navbar/>
        <Container role="main" fluid>
          <ErrorBoundary>
          <Switch>
            <Route exact path="/"><HomePage/></Route>
            <Route path="/Room/:id"><RoomPage/></Route>
            <Route path="/Book"><BookPage/></Route>
            <PrivateRoute path="/Meet"><MeetingPage/></PrivateRoute>
            <PrivateRoute path="/Profile"><ProfilePage/></PrivateRoute>
            <PrivateRoute path="/Invitation/:id"><InvitationPage/></PrivateRoute>
            <AdministratorRoute path="/Administrator"><AdministratorPage/></AdministratorRoute>
            <Route path="*"><NotFoundPage/></Route>
          </Switch>
          </ErrorBoundary>
        </Container>
      </Route>
    </Switch>
    </AuthIsLoaded>
    { process.env.NODE_ENV === "production" ? null : <DevTools/> }
  </Suspense>
)
const enhance = compose(
  hot,
)

export default enhance(App)
