import { combineReducers } from "redux"
import { PROFILE_MEETINGS_TAB_SET, PROFILE_COLLAPSE_TOGGLED } from '../actions/profilePageActions'

/**
 * Reducer for managing which tab is open
 */
const meetingsTabReducer = (state='oneOff', action) => {
  switch (action.type) {
    case PROFILE_MEETINGS_TAB_SET:
      return action.data
    default:
      return state
  }
}

/**
 * Reducer for managing the visibility of the sidebar
 */
const sidebarCollapsedReducer = (state=true, action) => {
  switch (action.type) {
    case PROFILE_COLLAPSE_TOGGLED:
      return !state
    default:
      return state
  }
}

/**
 * Reducer for the Profile Page
 */
const profilePageReducer = combineReducers({
  meetingsTab: meetingsTabReducer,
  sidebarCollapsed: sidebarCollapsedReducer,
})

export default profilePageReducer
