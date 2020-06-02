import React from 'react'
import { useSelector } from 'react-redux'
import { isEmpty, isLoaded } from 'react-redux-firebase'
import { Route } from 'react-router-dom'
import NotFoundPage from '../components/NotFoundPage'
import PropTypes from 'prop-types'

/**
 * Helper component to only render if the user is an admin
 * Otherwise, display 404
 */
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

AdministratorRoute.propTypes = {
  /** Child JSX components to render if user is admin */
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
}

export default AdministratorRoute