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

const createRootReducer = (history) => combineReducers({
  form: formReducer,
  firebase: firebaseReducer,
  firestore: firestoreReducer,
  location: locationReducer,
  notifications: notificationsReducer,
  loginPage: loginPageReducer,
  administratorPage: administratorPageReducer,
  bookPage: bookPageReducer,
  meetingPage: meetingPageReducer,
  profilePage: profilePageReducer,
  router: connectRouter(history),
})



export default createRootReducer