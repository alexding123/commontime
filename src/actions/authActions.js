import { notificationSet } from "./notificationsActions"

export const LOGIN_ERROR = 'LOGIN_ERROR'
export const loginError = (msg) => ({
  type: LOGIN_ERROR,
  msg,
})

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const loginSuccess = () => ({
  type: LOGIN_SUCCESS,
})

export const CREATE_CALENDAR_SUCCESS = 'CREATE_CALENDAR'
export const createCalendarSuccess = () => ({
  type: CREATE_CALENDAR_SUCCESS
})

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

export const login = () => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    console.log("Trying to login Google")
    window.gapi.auth2.getAuthInstance().signIn().then(user => {
      console.log("Google Login success")
      if (user.getHostedDomain() !== "commschool.org") {
        throw new Error("You must log in with a @commschool.org email")
      }
      const email = user.getBasicProfile().getEmail().toLowerCase()
      const idToken = user.getAuthResponse().id_token
      const db = getFirestore()
      const getPromise = db.collection('userPreset').where('email', '==', email).get()
      const idTokenPromise = Promise.resolve(idToken)
      
      console.log("Getting userPreset for", email)
      return Promise.all([getPromise, idTokenPromise])
    }).then(([docs, idToken]) => {
      if (docs.empty) {
        throw new Error("Your email was not found on the uploaded roster. Make sure you're logging in with the email of a student or teacher.")
      }
      const firebase = getFirebase()
      console.log("Trying to login firebase")
      return firebase.login({
        credential: firebase.auth.GoogleAuthProvider.credential(
          idToken,
        )
      })
    }).then((r) => {
      if (r.additionalUserInfo.isNewUser) {
        dispatch(createCalendar())
        dispatch(notificationSet('firstTimeLogin'))
      } else {
        // check if we should populate with courses
        const db = getFirestore()
        console.log(r.user.uid)
        db.collection('users').doc(r.user.uid).get().then(doc => {
          if (doc.exists && doc.data().shouldPopulateCourses) {
            dispatch(populateCourses(r.user.uid))
            dispatch(notificationSet('coursesPopulated'))
          }
          if (doc.exists && !doc.data().calendar && !doc.data().isCreatingCalendar) {
            dispatch(createCalendar(  ))
            dispatch(notificationSet('firstTimeLogin'))
          }

        })
      }
      dispatch(loginSuccess())
    }).catch(err => {
      console.log("Error", err)
      console.log("Signing out")
      window.gapi.auth2.getAuthInstance().signOut()
      const firebase = getFirebase()
      firebase.logout()
      switch (err.error) {
        case "popup_closed_by_user":
          return
        default:
          if (err.message) {
            dispatch(loginError(err.message))
          } else {
            console.log(err)
          }
      }
    })
  }
}

export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS'
export const logoutSuccess = () => ({
  type: LOGOUT_SUCCESS
})
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