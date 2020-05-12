
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
    const db = getFirestore()
    db.collection('users').doc(id).update({
      allowEmail: values.email,
    })
  }
}