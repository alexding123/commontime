import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import SplashScreen from '../../SplashScreen'
import NotFoundPage from '../../NotFoundPage'
import { withRouter } from 'react-router-dom'
import { editUser } from '../../../actions/administratorActions'
import EditUserForm from '../../forms/EditUserForm'
import ErrorBoundary from '../../ErrorBoundary'
import PropTypes from 'prop-types'

/**
 * Subpage to edit an user
 */
const EditUser = ({user, users, handleSubmit}) => {
  if (!isLoaded(user) || !isLoaded(users)) {
    return <SplashScreen/>
  }
  if (!user) {
    return <NotFoundPage/>
  }
  return (<div>
    <h3>Edit User</h3>
    <div className="divider"/>
    <div className="mt-1">
    <ErrorBoundary>
    <EditUserForm user={user} onSubmit={handleSubmit}/>
    </ErrorBoundary>
    </div>
  </div>)
}

EditUser.propTypes = {
  user: PropTypes.object,
  users: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
}

const enhance = compose(
  withRouter,
  firestoreConnect(props => [{
    collection: 'userPreset',
  }, {
    collection: 'userPreset',
    doc: props.match.params.id,
    storeAs: `userPreset${props.match.params.id}`
  }]),
  connect((state, props) => ({
    users: state.firestore.data.userPreset,
    user: state.firestore.data[`userPreset${props.match.params.id}`],
  }), (dispatch, props) => ({
    handleSubmit: (values) => dispatch(editUser(props.match.params.id, values))
  }))
)

export default enhance(EditUser)