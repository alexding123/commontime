const LOCATION_CHANGE = 'LOCATION_CHANGE'
const initialState = null

/**
 * Reducer required by router to mark when URL changes
 */
export default function locationReducer(state = initialState, action) {
  return action.type === LOCATION_CHANGE ? action.payload : state
}