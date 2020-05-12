
export const SCHEDULE_SWITCH_TO_ROOM = 'SCHEDULE_SWITCH_TO_ROOM'
export const scheduleSwitchToRoom = () => ({
  type: SCHEDULE_SWITCH_TO_ROOM,
})

export const switchPageRoom = () => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    dispatch(scheduleSwitchToRoom())
  }
}

export const SCHEDULE_SWITCH_TO_PERIOD = 'SCHEDULE_SWITCH_TO_PERIOD'

export const TOGGLE_SHOW_FILTERS = 'TOGGLE_SHOW_FILTERS'
export const toggleShowFilters = () => ({
  type: TOGGLE_SHOW_FILTERS
})

export const UPDATE_FILTERS = 'UPDATE_FILTERS'
export const updateFilters = (values) => {
  return {
    type: UPDATE_FILTERS,
    data: values,
  }
}