import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import SplashScreen from '../../SplashScreen'
import ExceptionDisplay from './ExceptionDisplay'
import { Button, Card } from 'react-bootstrap'
import ErrorBoundary from '../../ErrorBoundary'

const Exceptions = ({exceptions}) => {
  if (!isLoaded(exceptions)) {
    return <SplashScreen/>
  }

  const filteredExceptions = exceptions ? Object.entries(exceptions).filter(([key, exception]) => exception) : []

  return (<div>
    <h3>Exceptions</h3>
    <div className="divider"/>
    <Button href="/Administrator/AddException">Add Exception</Button>
    <div className="mt-1">
      <ErrorBoundary>
      { filteredExceptions.length ? 
        filteredExceptions.map(([key, exception]) => 
          <ExceptionDisplay key={key} id={key} exception={exception}/>
        ) :
        <Card>
          <Card.Body>
          <div>
            There is currently no exception in the database. 
          </div>
          </Card.Body>
        </Card>
      }
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
  }))
)

export default enhance(Exceptions)