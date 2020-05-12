import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import SplashScreen from '../../../SplashScreen'
import InstanceDisplay from './InstanceDisplay'

const RecurringDisplay = ({recurrings}) => {
  if (!isLoaded(recurrings)) {
    return <SplashScreen/>
  }
  if (!recurrings) {
    return <div className="mt-2">
      <p>You are not part of any recurring meeting.</p>
    </div>
  }
  return (<div className="mt-2">
    { Object.entries(recurrings).filter(([key, recurring]) => recurring).map(([key, recurring]) => 
      <InstanceDisplay recurring={recurring} recurringID={key} key={key}/>
    )}
  </div>)
}

const enhance = compose(
  firestoreConnect(props => [{
    collection: 'recurrings',
    where: [
      ['members', 'array-contains', props.userId],
    ],
  }]),
  connect(state => ({
    recurrings: state.firestore.data.recurrings,
  })),
)

export default enhance(RecurringDisplay)