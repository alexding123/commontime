import { TOGGLE_SHOW_FILTERS, UPDATE_FILTERS } from '../actions/bookPageActions'
import { combineReducers } from 'redux'

const showFilters = (state=false, action) => {
  switch (action.type) {
    case TOGGLE_SHOW_FILTERS:
      return !state
    default:
      return state
  }
}

const page = (state='ROOM', action) => {
  switch (action.type) {
    default:
      return state
  }
}

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

const bookPageReducer = combineReducers({
  showFilters,
  page,
  data
})

export default bookPageReducer