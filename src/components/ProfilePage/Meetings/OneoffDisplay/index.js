import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import SplashScreen from '../../../SplashScreen'
import InstanceDisplay from './InstanceDisplay'

const OneoffDisplay = ({instances}) => {
  if (!isLoaded(instances)) {
    return <SplashScreen/>
  }
  if (!instances) {
    return <div className="mt-2">
      <p>You are not part of any one-off meeting.</p>
    </div>
  }
  return (<div className="mt-2">
    { Object.entries(instances).filter(([key, instance]) => instance).map(([key, instance]) => 
      <InstanceDisplay instance={instance} instanceID={key} key={key}/>
    )}
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
  })),
)

export default enhance(OneoffDisplay)