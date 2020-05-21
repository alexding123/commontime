import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import SplashScreen from '../../SplashScreen'
import { Alert } from 'react-bootstrap'
import { addException } from '../../../actions/administratorActions'
import ErrorBoundary from '../../ErrorBoundary'
import AddExceptionForm from '../../forms/AddExceptionForm'

const AddException = ({exceptions, error, handleSubmit}) => {
  if (!isLoaded(exceptions)) {
    return <SplashScreen/>
  }
  const filteredExceptions = exceptions ? Object.values(exceptions).filter(exception => exception) : []

  return (<div>
    <h3>Add an Exception</h3>
    <div className="divider"/>
    {error ? <Alert variant="danger">{error}</Alert> : null}
    <div>
      <ErrorBoundary>
      <AddExceptionForm onSubmit={handleSubmit(filteredExceptions)}/>
      </ErrorBoundary>
    </div>
  </div>)
}

const enhance = compose(
  firestoreConnect([{
    collection: 'exceptions',
  }]),
  connect((state) => ({
    exceptions: state.firestore.data.exceptions,
    error: state.administratorPage.addException,
  }), dispatch => ({
    handleSubmit: (exceptions) => (values) => dispatch(addException(exceptions, values)),
  }))
)

export default enhance(AddException)