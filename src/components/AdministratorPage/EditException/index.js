import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import SplashScreen from '../../SplashScreen'
import NotFoundPage from '../../NotFoundPage'
import { withRouter } from 'react-router-dom'
import { editException } from '../../../actions/administratorActions'
import ErrorBoundary from '../../ErrorBoundary'
import EditExceptionForm from '../../forms/EditExceptionForm'
import PropTypes from 'prop-types'

/**
 * Subpage to edit an exception
 */
const EditCourse = ({exception, handleSubmit}) => {
  if (!isLoaded(exception)) {
    return <SplashScreen/>
  }
  if (!exception) {
    return <NotFoundPage/>
  }
  return (<div>
    <h3>Edit Exception</h3>
    <div className="divider"/>
    <div className="mt-1">
    <ErrorBoundary>
    <EditExceptionForm exception={exception} onSubmit={handleSubmit}/>
    </ErrorBoundary>
    </div>
  </div>)
}

EditExceptionForm.propTypes = {
  exception: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
}

const enhance = compose(
  withRouter,
  firestoreConnect(props => [{
    collection: 'exceptions',
    doc: props.match.params.id,
    storeAs: `exception${props.match.params.id}`
  }]),
  connect((state, props) => ({
    exception: state.firestore.data[`exception${props.match.params.id}`],
  }), (dispatch, props) => ({
    handleSubmit: (values) => dispatch(editException(props.match.params.id, values))
  }))
)

export default enhance(EditCourse)