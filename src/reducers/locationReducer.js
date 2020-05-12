const LOCATION_CHANGE = 'LOCATION_CHANGE'
const initialState = null
export default function locationReducer(state = initialState, action) {
  return action.type === LOCATION_CHANGE ? action.payload : state
}