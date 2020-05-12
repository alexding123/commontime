import { combineReducers } from "redux"
import { PAGE_SET, SCHEDULE_MEETING_SETUP_SAVED, TOGGLE_SHOW_MEETING_FILTERS, ONEOFF_INSTANCE_SELECTED, PERIOD_SELECTED } from "../actions/meetingPageActions"

const showFiltersReducer = (state=false, action) => {
  switch (action.type) {
    case TOGGLE_SHOW_MEETING_FILTERS:
      return !state
    default:
      return state
  }
}

const stageReducer = (state='PEOPLE', action) => {
  switch (action.type) {
    case PAGE_SET:
      return action.data
    default:
      return state
  }
}

const allowRebookReducer = (state=false, action) => {
  switch (action.type) {
    case SCHEDULE_MEETING_SETUP_SAVED:
      return action.data.allowRebook ? action.data.allowRebook : false
    default:
      return state
  }
}

const frequencyReducer = (state='ONE_OFF', action) => {
  switch (action.type) {
    case SCHEDULE_MEETING_SETUP_SAVED:
      return action.data.frequency
    default:
      return state
  }
}

const peopleReducer = (state=[], action) => {
  switch (action.type) {
    case SCHEDULE_MEETING_SETUP_SAVED:
      return action.data.people
    default:
      return state
  }
}

const periodsReducer = (state=[], action) => {
  switch (action.type) {
    case SCHEDULE_MEETING_SETUP_SAVED:
      return action.data.periods
    default:
      return state
  }
}

const dateRangeReducer = (state={
  startDate: new Date(),
  endDate: new Date(),
}, action) => {
  switch (action.type) {
    case SCHEDULE_MEETING_SETUP_SAVED:
      return action.data.dateRange
    default:
      return state
  }
}

const oneoffInstanceReducer = (state=null, action) => {
  switch (action.type) {
    case ONEOFF_INSTANCE_SELECTED:
      return action.data
    default:
      return state
  }
}

const recurringPeriodReducer = (state=null, action) => {
  switch (action.type) {
    case PERIOD_SELECTED:
      return action.data
    default:
      return state
  }
}

const meetingPageReducer = combineReducers({
  stage: stageReducer,
  frequency: frequencyReducer,
  people: peopleReducer,
  dateRange: dateRangeReducer,
  showFilters: showFiltersReducer,
  periods: periodsReducer,
  allowRebook: allowRebookReducer,
  oneoffInstance: oneoffInstanceReducer,
  recurringPeriod: recurringPeriodReducer,
})

export default meetingPageReducer