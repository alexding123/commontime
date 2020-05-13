import React from 'react'
import { useSelector } from 'react-redux'
import { isEmpty, isLoaded } from 'react-redux-firebase'
import { Redirect, Route } from 'react-router-dom'

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
  );
}

export default PrivateRoute