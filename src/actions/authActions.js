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
    window.gapi.auth2.getAuthInstance().signIn().then(user => {
      if (user.getHostedDomain() !== "commschool.org") {
        dispatch(loginError("You must log in with a @commschool.org email"))
        return
      }
      const firebase = getFirebase()
      return firebase.login({
        credential: firebase.auth.GoogleAuthProvider.credential(
          user.getAuthResponse().id_token,
        )
      })
    }).then((r) => {
      if (r.additionalUserInfo.isNewUser) {
        dispatch(createCalendar())
        dispatch(notificationSet('firstTimeLogin'))
      }

      // check if we should populate with courses
      const db = getFirestore()
      db.collection('users').doc(r.user.uid).get().then(doc => {
        if (doc.exists && doc.data().shouldPopulateCourses) {
          dispatch(populateCourses(r.user.uid))
          dispatch(notificationSet('coursesPopulated'))
        }
      })
      dispatch(loginSuccess())
    }).catch(err => {
      switch (err.type) {
        case "tokenFailed":
          dispatch(loginError("You must log in with a @commschool.org email"))
          return
        default:
          console.error(err)
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
      dispatch(logoutSuccess())
    })
  }
}