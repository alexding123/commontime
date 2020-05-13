import React from 'react'
import { Alert, Button, Container } from 'react-bootstrap'
import { connect } from 'react-redux'
import { isEmpty } from 'react-redux-firebase'
import { Redirect, withRouter } from 'react-router-dom'
import { compose } from 'recompose'
import { login } from '../actions/authActions'

const LoginPage = ({ login, auth, location, error}) => {
  if (!isEmpty(auth)) {
    const { from } = location.state || { from : { pathname: "/"}}
    return <Redirect to={from}/>
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
  withRouter,
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