import { combineReducers } from "redux"
import { NOTIFICATION_CLOSED, NOTIFICATION_SET } from "../actions/notificationsActions"

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

const dataReducer = (state={}, action) => {
  switch (action.type) {
    case NOTIFICATION_SET:
      return action.data.data
    default: 
      return state
  }
}

const notificationsReducer = combineReducers({
  current: currentReducer,
  data: dataReducer,
})

export default notificationsReducer