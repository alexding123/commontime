import { notificationSet } from "./notificationsActions"

export const LOGIN_ERROR = 'LOGIN_ERROR'
/**
 * Causes an error to be displayed on the LoginPage screen
 * @param {string} msg The message to be displayed
 */
export const loginError = (msg) => ({
  type: LOGIN_ERROR,
  msg,
})

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
/**
 * Resets any error messages
 */
export const loginSuccess = () => ({
  type: LOGIN_SUCCESS,
})


/**
 * Calls the Firebase function to create a Google Calendar for the
 * current user, passing along the Google API access token
 * to allow Firebase functions to impersonate the user
 */
const createCalendar = () => {
  return (dispatch, getState, {getFirebase}) => {
    const firebase = getFirebase()
    const createCalendar = firebase.functions().httpsCallable('calendar-create')
    createCalendar({
      token: window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true).access_token
    }).catch(console.error)
    // ignore deadlines
  }
}

/**
 * Calls the Firebase function to populate the user's Google Calendar
 * with the latest courses, passing along the Google API access token
 * to allow Firebase functions to impersonate the user 
 * @param {number} uid 
 */
const populateCourses = (uid) => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const firebase = getFirebase()
    const db = getFirestore()
    db.collection('users').doc(uid).update({
      shouldPopulateCourses: false,
    })
    const populateCourses = firebase.functions().httpsCallable('calendar-populateCourses')
    populateCourses({
      token: window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true).access_token
    }).catch(console.error)
    // ignore deadlines
  }
}

/**
 * Uses OAuth to login the user to Google API and Firebase, logging out
 * the user if any error occurs in the process
 */
export const login = () => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    window.gapi.auth2.getAuthInstance().signIn().then(user => {
      // restrict login to commschool.org domain emails
      // throw Error to reverse the login
      if (user.getHostedDomain() !== "commschool.org") {
        throw new Error("You must log in with a @commschool.org email")
      }
      const email = user.getBasicProfile().getEmail().toLowerCase()
      const idToken = user.getAuthResponse().id_token
      const db = getFirestore()
      // check if the commschool.org email exists in database
      // this is to safeguard against potential logins from non-personal accounts
      const getPromise = db.collection('userPreset').where('email', '==', email).get()
      const idTokenPromise = Promise.resolve(idToken)
      
      return Promise.all([getPromise, idTokenPromise])
    }).then(([docs, idToken]) => {
      if (docs.empty) {
        throw new Error("Your email was not found on the uploaded roster. Make sure you're logging in with the email of a student or teacher.")
      }

      // login with the id token acquired from logging into Google API
      const firebase = getFirebase()
      return firebase.login({
        credential: firebase.auth.GoogleAuthProvider.credential(
          idToken,
        )
      })
    }).then((r) => {
      if (r.additionalUserInfo.isNewUser) {
        // create Google Calendar if user is new
        dispatch(createCalendar())
        dispatch(notificationSet('firstTimeLogin'))
      } else {
        const db = getFirestore()
        db.collection('users').doc(r.user.uid).get().then(doc => {
          // check if we should populate user's Calendar courses 
          // (this flag is set when admin uploads course files, i.e., when a new year comes)
          if (doc.exists && doc.data().shouldPopulateCourses) {
            dispatch(populateCourses(r.user.uid))
            dispatch(notificationSet('coursesPopulated'))
          }

          // also check if user's Google Calendar is somehow not created
          // this might happen if the Google API login is successful but Firebase login isn't 
          // (usually due to bad internet)
          if (doc.exists && !doc.data().calendar && !doc.data().isCreatingCalendar) {
            // just pretend this is the first time logging in
            dispatch(createCalendar())
            dispatch(notificationSet('firstTimeLogin'))
          }
        })
      }
      dispatch(loginSuccess())
    }).catch(err => {
      // if catching any error, reverse the login and display the message
      dispatch(logout())
      switch (err.error) {
        // user closing the pop-up returns an error; no need to display warning
        case "popup_closed_by_user":
          return
        default:
          // if clause to guard against undefined err.message
          if (err.message) {
            dispatch(loginError(err.message))
          }
      }
    })
  }
}

export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS'
/**
 * Signals successful logout for debugging
 * Triggers no reducer (yet)
 */
export const logoutSuccess = () => ({
  type: LOGOUT_SUCCESS
})

/**
 * Logs out the user from Google API and Firebase
 */
export const logout = () => {
  return (dispatch, getState, {getFirebase}) => {
    const firebase = getFirebase()
    firebase.logout().then(() => {
      return window.gapi.auth2.getAuthInstance().signOut()
    }).then(() => {
      dispatch(logoutSuccess())
    }) 
  }
}