import React from 'react'
import { useSelector } from 'react-redux'
import { isEmpty, isLoaded } from 'react-redux-firebase'
import { Route } from 'react-router-dom'
import NotFoundPage from '../components/NotFoundPage'

function AdministratorRoute({ children, ...rest }) {
  const auth = useSelector(state => state.firebase.auth)
  const profile = useSelector(state => state.firebase.profile)
  return (
    <Route
      {...rest}
      render={() =>
        (isLoaded(auth) && !isEmpty(auth) && isLoaded(profile) && profile.token.claims.admin) ? (
          children
        ) : (
          <NotFoundPage/>
        )
      }
    />
  );
}

export default AdministratorRoute