import { firebaseReducer } from 'react-redux-firebase'
import { combineReducers } from "redux"
import { firestoreReducer } from 'redux-firestore'
import { reducer as formReducer } from 'redux-form'
import locationReducer from './locationReducer'
import loginPageReducer from './loginPageReducer'
import administratorPageReducer from './administratorPageReducer'
import { connectRouter } from 'connected-react-router'
import bookPageReducer from './bookPageReducer'
import meetingPageReducer from './meetingPageReducer'
import notificationsReducer from './notificationsReducer'
import profilePageReducer from './profilePageReducer'

/**
 * Root reducer, combining everything to form the store
 */
const createRootReducer = (history) => combineReducers({
  form: formReducer, // Redux-Form
  firebase: firebaseReducer, // React-Redux-Firebase
  firestore: firestoreReducer, // React-Redux-Firebase
  location: locationReducer, // for the router
  notifications: notificationsReducer, // custom notifications
  loginPage: loginPageReducer,
  administratorPage: administratorPageReducer,
  bookPage: bookPageReducer,
  meetingPage: meetingPageReducer,
  profilePage: profilePageReducer,
  router: connectRouter(history), // for the router
})



export default createRootReducer