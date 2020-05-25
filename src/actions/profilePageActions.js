import { startSubmit, stopSubmit } from "redux-form"

export const PROFILE_MEETINGS_TAB_SET = 'PROFILE_MEETINGS_TAB_SET'
export const profileMeetingsTabSet = (tab) => ({
  type: PROFILE_MEETINGS_TAB_SET,
  data: tab,
})

export const PROFILE_COLLAPSE_TOGGLED = 'PROFILE_COLLAPSE_TOGGLED'
export const profileCollapseToggled = () => ({
  type: PROFILE_COLLAPSE_TOGGLED
})

export const updateSettings = (id, values) => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    dispatch(startSubmit('profileForm'))
    const db = getFirestore()
    db.collection('users').doc(id).update({
      allowEmail: values.email,
    }).then(() => {
      dispatch(stopSubmit('profileForm'))
    })
  }
}

export const resetCalendar = () => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const firebase = getFirebase()
    const resetCalendar = firebase.functions().httpsCallable('calendar-reset')
    resetCalendar({
      token: window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true).access_token,
    })
  }
}