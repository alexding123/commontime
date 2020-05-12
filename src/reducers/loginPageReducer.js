import {LOGIN_ERROR, LOGIN_SUCCESS} from '../actions/authActions'

const initialState = null
const loginPageReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return null
    case LOGIN_ERROR: 
      return action.msg
    default:
      return state
  }
}

export default loginPageReducer