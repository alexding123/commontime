import { combineReducers } from "redux"
import { PAGE_SET, SCHEDULE_MEETING_SETUP_SAVED, ONEOFF_INSTANCE_SELECTED, PERIOD_SELECTED } from "../actions/meetingPageActions"

/**
 * Reducer for managing which subpage to display
 */
const stageReducer = (state='PEOPLE', action) => {
  switch (action.type) {
    case PAGE_SET:
      return action.data
    default:
      return state
  }
}

/**
 * Reducer for managing whether to show booked time slots
 */
const allowRebookReducer = (state=false, action) => {
  switch (action.type) {
    // save value when the setup is done
    case SCHEDULE_MEETING_SETUP_SAVED:
      return action.data.allowRebook ? action.data.allowRebook : false
    default:
      return state
  }
}

/**
 * Reducer for managing whether to book a one-off or a recurring meeting
 */
const frequencyReducer = (state='oneOff', action) => {
  switch (action.type) {
    // save value when setup is done
    case SCHEDULE_MEETING_SETUP_SAVED:
      return action.data.frequency
    default:
      return state
  }
}

/**
 * Reducer for managing who are in the meeting
 */
const peopleReducer = (state=[], action) => {
  switch (action.type) {
    // save value when setup is done
    case SCHEDULE_MEETING_SETUP_SAVED:
      return action.data.people
    default:
      return state
  }
}

/**
 * Reducer for managing which periods are allowed
 */
const periodsReducer = (state=[], action) => {
  switch (action.type) {
    // save value when setup is done
    case SCHEDULE_MEETING_SETUP_SAVED:
      return action.data.periods
    default:
      return state
  }
}

/**
 * Reducer for managing the date range of time slots to search
 */
const dateRangeReducer = (state={
  startDate: new Date(),
  endDate: new Date(),
}, action) => {
  switch (action.type) {
    // save value when setup is done
    case SCHEDULE_MEETING_SETUP_SAVED:
      return action.data.dateRange
    default:
      return state
  }
}

/**
 * Reducer for managing which one-off time slot is selected
 */
const oneoffInstanceReducer = (state=null, action) => {
  switch (action.type) {
    case ONEOFF_INSTANCE_SELECTED:
      return action.data
    default:
      return state
  }
}

/**
 * Reducer for managing which recurring time slot is selected
 */
const recurringPeriodReducer = (state=null, action) => {
  switch (action.type) {
    case PERIOD_SELECTED:
      return action.data
    default:
      return state
  }
}

/**
 * Reducer for the Meeting Page
 */
const meetingPageReducer = combineReducers({
  stage: stageReducer,
  frequency: frequencyReducer,
  people: peopleReducer,
  dateRange: dateRangeReducer,
  periods: periodsReducer,
  allowRebook: allowRebookReducer,
  oneoffInstance: oneoffInstanceReducer,
  recurringPeriod: recurringPeriodReducer,
})

export default meetingPageReducer