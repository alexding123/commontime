import React from 'react'
import { Alert, Button, Container } from 'react-bootstrap'
import { connect } from 'react-redux'
import { isEmpty } from 'react-redux-firebase'
import { Redirect, withRouter } from 'react-router-dom'
import { withLastLocation } from 'react-router-last-location'
import { compose } from 'recompose'
import { login } from '../actions/authActions'

const LoginPage = ({ login, auth, lastLocation, error}) => {
  if (!isEmpty(auth)) {
    console.log(lastLocation)
    return <Redirect to={lastLocation}/>
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