import React from 'react'
import { Alert, Button, Container } from 'react-bootstrap'
import { connect } from 'react-redux'
import { isEmpty } from 'react-redux-firebase'
import { Redirect } from 'react-router-dom'
import { withLastLocation } from 'react-router-last-location'
import { compose } from 'recompose'
import { login } from '../actions/authActions'
import PropTypes from 'prop-types'

/**
 * Page to login
 */
const LoginPage = ({ login, auth, lastLocation, error}) => {
  // if logged in, redirect to the last location
  // if last location is not found, redirect to home page
  if (!isEmpty(auth)) {
    const redirectPath = lastLocation ? lastLocation : "/"
    return <Redirect to={redirectPath}/>
  }

  return (
    <Container fluid className="login-background">
      <div className="login-container d-flex flex-column">
        <h3 className="text-center mb-3">Please log in</h3>
        {error ? <Alert variant="danger">{error}</Alert> : null}
        <div>
          <Button block onClick={login}>Login with Google</Button>
        </div>
      </div>
    </Container>
  )
}

LoginPage.propTypes = {
  /** Handler to prompt user to OAuth login */
  login: PropTypes.func.isRequired,
  auth: PropTypes.object,
  /** Last location of the user */
  lastLocation: PropTypes.object,
  /** Optional error message to display */
  error: PropTypes.string,
}

const enhance = compose(
  withLastLocation,
  connect(
    (state) => ({
      auth: state.firebase.auth,
      profile: state.firebase.profile,
      error: state.loginPage,
    }),
    (dispatch) => ({
      login: () => dispatch(login()),
    })
  ),
)

export default enhance(LoginPage)