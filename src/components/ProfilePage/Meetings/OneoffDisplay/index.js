import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import SplashScreen from '../../../SplashScreen'
import InstanceDisplay from './InstanceDisplay'
import ErrorBoundary from '../../../ErrorBoundary'

const OneoffDisplay = ({instances, exceptions}) => {
  if (!isLoaded(instances) || !isLoaded(exceptions)) {
    return <SplashScreen/>
  }
  if (!instances) {
    return <div className="mt-2">
      <p>You are not part of any one-off meeting.</p>
    </div>
  }
  return (<div className="mt-2">
    <ErrorBoundary>
    { Object.entries(instances).filter(([key, instance]) => instance).map(([key, instance]) => 
      <InstanceDisplay instance={instance} instanceID={key} key={key}/>
    )}
    </ErrorBoundary>
  </div>)
}

const enhance = compose(
  firestoreConnect(props => [{
    collection: 'instances',
    where: [
      ['members', 'array-contains', props.userId],
      ['endDate', '>', new Date()],
    ],
  }]),
  connect(state => ({
    instances: state.firestore.data.instances,
    exceptions: state.firestore.data.exceptions,
  })),
)

export default enhance(OneoffDisplay)