import { startSubmit, stopSubmit } from "redux-form"

export const PROFILE_MEETINGS_TAB_SET = 'PROFILE_MEETINGS_TAB_SET'
/**
 * Sets the tab opened in the meetings subpage of the profile page
 * @param {string} tab Name of the tab to open
 */
export const profileMeetingsTabSet = (tab) => ({
  type: PROFILE_MEETINGS_TAB_SET,
  data: tab,
})

export const PROFILE_COLLAPSE_TOGGLED = 'PROFILE_COLLAPSE_TOGGLED'
/**
 * Toggles the visibility of the profile page sidebar
 */
export const profileCollapseToggled = () => ({
  type: PROFILE_COLLAPSE_TOGGLED
})

/**
 * Updates the current user's setting
 * @param {string} id ID of the current user
 * @param {Object} values Form values describing the new settings
 */
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

/**
 * Resets the current user's calendar, deleting any existing calendar
 * associated with the user and recreating a new one
 */
export const resetCalendar = () => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const firebase = getFirebase()
    const resetCalendar = firebase.functions().httpsCallable('calendar-reset')
    resetCalendar({
      token: window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true).access_token,
    })
  }
}