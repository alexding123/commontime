import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import SplashScreen from '../../../SplashScreen'
import InstanceDisplay from './InstanceDisplay'
import ErrorBoundary from '../../../ErrorBoundary'
import PropTypes from 'prop-types'

/**
 * Sort an array of instances from earliest to latest
 * @param {Object[]} instances Array of instances to sort
 */
const sortInstances = (instances) => {
  instances.sort((a, b) => a.startDate.toDate().getTime() - b.startDate.toDate().getTime())
  return instances
}

/**
 * Component that displays the one-off meetings the user is a member of
 */
const OneoffDisplay = ({instances, exceptions}) => {
  if (!isLoaded(instances) || !isLoaded(exceptions)) {
    return <SplashScreen/>
  }

  // if not in any meeting, say so
  if (!instances) {
    return <div className="mt-2">
      <p>You are not part of any upcoming one-off meeting.</p>
    </div>
  }
  const filteredInstances = Object.entries(instances).filter(([key, instance]) => instance).map(([key, instance]) => ({
    key,
    ...instance,
  }))

  const sortedInstances = sortInstances(filteredInstances)

  return (<div className="mt-2">
    <ErrorBoundary>
    { sortedInstances.map(instance => 
      <InstanceDisplay instance={instance} instanceID={instance.key} key={instance.key}/>
    )}
    </ErrorBoundary>
  </div>)
}

OneoffDisplay.propTypes = {
  instances: PropTypes.object,
  exceptions: PropTypes.object,
}

const enhance = compose(
  firestoreConnect(props => [{
    collection: 'instances',
    where: [
      ['members', 'array-contains', props.userId],
      ['endDate', '>', new Date()]
    ],
  }]),
  connect(state => ({
    instances: state.firestore.data.instances,
    exceptions: state.firestore.data.exceptions,
  })),
)

export default enhance(OneoffDisplay)