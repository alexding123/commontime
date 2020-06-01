import React from 'react'
import { useSelector } from 'react-redux'
import { isEmpty, isLoaded } from 'react-redux-firebase'
import { Redirect, Route } from 'react-router-dom'
import PropTypes from 'prop-types'

/**
 * Helper component to only render if the user is logged in
 * Otherwise, redirect to a login page
 */
function PrivateRoute({ children, ...rest }) {
  const auth = useSelector(state => state.firebase.auth)
  const profile = useSelector(state => state.firebase.profile)
  return (
    <Route
      {...rest}
      render={({ location }) =>
        (isLoaded(auth) && !isEmpty(auth) && isLoaded(profile)) ? (
          children
        ) : (
          <Redirect
            from="*"
            to={{
              pathname: "/Login",
              state: { from: location }
            }}
          />
        )
      }
    />
  )
}

PrivateRoute.propTypes = {
  /** JSX components to render if the user is logged in */
  children: PropTypes.object.isRequired,
}

export default PrivateRoute