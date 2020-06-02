import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import SplashScreen from '../../SplashScreen'
import { Alert } from 'react-bootstrap'
import { addUser } from '../../../actions/administratorActions'
import AddUserForm from '../../forms/AddUserForm'
import ErrorBoundary from '../../ErrorBoundary'
import PropTypes from 'prop-types'

/**
 * Subpage to add a new user to the database
 */
const AddUser = ({users, error, handleSubmit}) => {
  if (!isLoaded(users)) {
    return <SplashScreen/>
  }
  // necessary to avoid null values
  const filteredUsers = users ? Object.values(users).filter(user => user) : []

  return (<div>
    <h3>Add an User</h3>
    <div className="divider"/>
    {error ? <Alert variant="danger">{error}</Alert> : null}
    <div>
      <ErrorBoundary>
      <AddUserForm onSubmit={handleSubmit(filteredUsers)}/>
      </ErrorBoundary>
    </div>
  </div>)
}

AddUser.propTypes = {
  users: PropTypes.object,
  /** optional error message to display */
  error: PropTypes.string,
  handleSubmit: PropTypes.func.isRequired,
}

const enhance = compose(
  firestoreConnect([{
    collection: 'userPreset',
  }]),
  connect((state) => ({
    users: state.firestore.data.userPreset,
    error: state.administratorPage.addUser,
  }), dispatch => ({
    handleSubmit: (users) => (values) => dispatch(addUser(users, values))
  }))
)

export default enhance(AddUser)