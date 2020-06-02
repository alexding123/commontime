import { combineReducers } from "redux"
import { NOTIFICATION_CLOSED, NOTIFICATION_SET } from "../actions/notificationsActions"

/**
 * Reducer for which current notification is open
 */
const currentReducer = (state=null, action) => {
  switch (action.type) {
    case NOTIFICATION_SET:
      return action.data.kind
    case NOTIFICATION_CLOSED:
      return null
    default:
      return state
 } 
}

/**
 * Reducer for providing optional data to the currently open notification
 */
const dataReducer = (state={}, action) => {
  switch (action.type) {
    case NOTIFICATION_SET:
      return action.data.data
    default: 
      return state
  }
}

/**
 * Reducer for all notifications
 */
const notificationsReducer = combineReducers({
  current: currentReducer,
  data: dataReducer,
})

export default notificationsReducer