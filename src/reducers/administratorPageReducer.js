import { combineReducers } from "redux"
import { ADD_ADMIN_FORM_ERROR, ADD_ADMIN_FORM_SUCCESS, ADMINISTRATOR_SIDEBAR_COLLAPSED_TOGGLED, LIST_ADMINS_SUCCESS, PERIODS_ADD_PERIOD, PERIODS_DELETE_PERIOD, PERIODS_RESET, PERIODS_RETRIEVED, PERIODS_UPDATE_FIELD, PERIODS_UPLOAD_ERROR, PERIODS_UPLOAD_SUCCESS, ROOMS_ADD_ROOM, ROOMS_DELETE_ROOM, ROOMS_RESET, ROOMS_RETRIEVED, ROOMS_UPDATE_FIELD, ROOMS_UPLOAD_ERROR, ROOMS_UPLOAD_SUCCESS, UPLOAD_GROUPS_MEETINGS_MEMBERS_FORM_ERROR, UPLOAD_GROUPS_MEETINGS_MEMBERS_FORM_SUCCESS, UPLOAD_USERS_FORM_ERROR, UPLOAD_USERS_FORM_SUCCESS, SET_ADD_COURSE_ERROR, SET_ADD_USER_ERROR } from "../actions/administratorActions"

/**
 * Error message and success message
 */
const initialState = {
  error: null,
  message: null,
}

/**
 * Reducer for messages related to uploading the users file
 */
const usersReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPLOAD_USERS_FORM_SUCCESS:
      return {
        ...state,
        error: null,
        message: "Successfully uploaded!"
      }
    case UPLOAD_USERS_FORM_ERROR:
      return { 
        ...state,
        error: action.msg,
        message: null,
      }
    default:
      return state
  }
}

/**
 * Reducer for messages related to uploading the various courses file
 */
const coursesReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPLOAD_GROUPS_MEETINGS_MEMBERS_FORM_SUCCESS:
      return {
        ...state, 
        error: null,
        message: "Successfully uploaded courses!"
      }
    case UPLOAD_GROUPS_MEETINGS_MEMBERS_FORM_ERROR:
      return {
        ...state, 
        error: action.msg, 
        message: null
      }
    default:
      return state
  }
}

/**
 * Reducer for editting the list of periods
 */
const periodsReducer = (state = {
  default: null,
  current: null,
  error: null,
  message: null,
}, action) => {
  switch (action.type) {
    // when all periods are retrieved from Firebase
    case PERIODS_RETRIEVED:
      return {
        ...state,
        default: Object.assign({}, action.data),
        current: Object.assign({}, action.data),
      }
    case PERIODS_UPDATE_FIELD:
      return {
        ...state,
        current: {
          ...state.current,
          [action.period]: {
            ...state.current[action.period],
            [action.field]: action.value,
          }
        }
      }
    case PERIODS_ADD_PERIOD: 
      return {
        ...state,
        current: {
          ...state.current, 
          [action.id]: action.period,
        }
      }
    case PERIODS_DELETE_PERIOD:
      let clone = Object.assign({}, state)
      delete clone.current[action.period] 
      return clone
    // reset to the last save
    case PERIODS_RESET:
      return {
        ...state,
        current: Object.assign({}, state.default),
      }
    case PERIODS_UPLOAD_SUCCESS:
      return {
        ...state,
        default: Object.assign({}, state.current),
        message: action.msg,
        error: null,
      }
    case PERIODS_UPLOAD_ERROR:
      return {
        ...state,
        message: null,
        error: action.msg,
      }
    default:
      return state
  }
}

/**
 * Reducer for editting the list of rooms
 */
const roomsReducer = (state = {
  default: null,
  current: null,
  error: null,
  message: null,
}, action) => {
  switch (action.type) {
    // data retrieved from Firebase
    case ROOMS_RETRIEVED:
      return {
        ...state,
        default: Object.assign({}, action.data),
        current: Object.assign({}, action.data),
      }
    case ROOMS_UPDATE_FIELD:
      return {
        ...state,
        current: {
          ...state.current,
          [action.room]: {
            ...state.current[action.room],
            [action.field]: action.value,
          }
        }
      }
    case ROOMS_ADD_ROOM: 
      return {
        ...state,
        current: {
          ...state.current, 
          [action.id]: action.room,
        }
      }
    case ROOMS_DELETE_ROOM:
      let clone = Object.assign({}, state)
      delete clone.current[action.room] 
      return clone
    // reset to the last save
    case ROOMS_RESET:
      return {
        ...state,
        current: Object.assign({}, state.default),
      }
    case ROOMS_UPLOAD_SUCCESS:
      return {
        ...state,
        default: Object.assign({}, state.current),
        message: action.msg,
        error: null,
      }
    case ROOMS_UPLOAD_ERROR:
      return {
        ...state,
        message: null,
        error: action.msg,
      }
    default:
      return state
  }
}

/**
 * Reducer for data related to the annual board subpage
 */
const annualBoardReducer = combineReducers({
  users: usersReducer,
  courses: coursesReducer,
  periods: periodsReducer,
  rooms: roomsReducer,
})

/**
 * Reducer for managing the visibility of the sidebar
 */
const sidebarCollapsedReducer = (state=true, action) => {
  switch (action.type) {
    case ADMINISTRATOR_SIDEBAR_COLLAPSED_TOGGLED:
      return !state
    default:
      return state
  }
}

/**
 * Redcuer for managing the add admin form
 */
const adminReducer = (state=initialState, action) => {
  switch (action.type) {
    case ADD_ADMIN_FORM_SUCCESS:
      return {
        error: null,
        message: action.data,
      }
    case ADD_ADMIN_FORM_ERROR:
      return {
        error: action.data,
        message: null,
      }
    default:
      return state
  }
}

/**
 * Reducer for managing the all current admins display
 */
const adminsReducer = (state=[], action) => {
  switch (action.type) {
    case LIST_ADMINS_SUCCESS:
      return action.data
    default:
      return state
  }
}

/** 
 * Reducer for the Dashboard subpage
 */
const dashboardReducer = combineReducers({
  admin: adminReducer,
  admins: adminsReducer,
})

/**
 * Reducer for the Add Course subpage, with a potential error message
 */
const addCourseReducer = (state=null, action) => {
  switch (action.type) {
    case SET_ADD_COURSE_ERROR:
      return action.data
    default:
      return state
  }
}

/**
 * Reducer for the Add User subpage, with a potential error message
 */
const addUserReducer = (state=null, action) => {
  switch (action.type) {
    case SET_ADD_USER_ERROR:
      return action.data
    default:
      return state
  }
}

/**
 * Reducer for the Administrator Page
 */
const administratorPageReducer = combineReducers({
  annualBoard: annualBoardReducer,
  sidebarCollapsed: sidebarCollapsedReducer,
  dashboard: dashboardReducer,
  addCourse: addCourseReducer,
  addUser: addUserReducer,
})
export default administratorPageReducer