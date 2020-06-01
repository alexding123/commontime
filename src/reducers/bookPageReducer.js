import { TOGGLE_SHOW_FILTERS, UPDATE_FILTERS } from '../actions/bookPageActions'
import { combineReducers } from 'redux'

/**
 * Reducer for managing the visibility of the Filters
 */
const showFilters = (state=false, action) => {
  switch (action.type) {
    case TOGGLE_SHOW_FILTERS:
      return !state
    default:
      return state
  }
}

/**
 * Reducer for managing the filter settings 
 */
const data = (state={
  dateRange: {
    startDate: new Date(),
    endDate: new Date(),
  },
  rooms: [],
  periods: [],
  allowRebook: false,
}, action) => {
  switch (action.type) {
    case UPDATE_FILTERS:
      return action.data
    default:
      return state
  }
}

/**
 * Reducer for the Book Page
 */
const bookPageReducer = combineReducers({
  showFilters,
  data
})

export default bookPageReducer