import React from 'react'
import { ListGroup } from 'react-bootstrap'
import { connect } from 'react-redux'
import { isEmpty } from 'react-redux-firebase'
import { compose } from 'recompose'
import { getFreeInstances } from '../../../utils'
import InstanceDisplay from './InstanceDisplay'



const sortInstances = (instances) => {
  const bookedInstances = instances.filter(instance => instance.instance)
  const freeInstances = instances.filter(instance => !instance.instance)
  return [...bookedInstances, ...freeInstances]
}

const Display = ({profile, instances, periods, data}) => {
  const freeInstances = getFreeInstances(instances, periods, data)
  const userBookedRooms = isEmpty(profile) || data.allowRebook ? [] : freeInstances.filter(instance => instance.instance && instance.instance.creator === profile.id)
  const canRebook = !isEmpty(profile) && profile.token.claims.teacher ? data.allowRebook : false
  const filteredInstances = canRebook ? sortInstances(freeInstances) : freeInstances.filter(instance => !instance.instance)

  const allInstancesToDisplay = [...userBookedRooms, ...filteredInstances]
  return allInstancesToDisplay.length ? 
    <ListGroup>
      {allInstancesToDisplay.map((instance, index) => 
        <InstanceDisplay key={index} instance={instance} canRebook={canRebook}/>
      )}
    </ListGroup> :
    <ListGroup>
      <ListGroup.Item className="d-flex flex-column justify-content-center align-items-center p-3">
        <div>
          No match
        </div>
        <div>
          <small>Try changing your filter settings</small>
        </div>
      </ListGroup.Item>
    </ListGroup>
}

const enhance = compose(
  connect(state => ({
    data: state.bookPage.data,
    instances: state.firestore.data.instancesScheduleRoom,
    periods: state.firestore.data.periods,
    profile: state.firebase.profile,
  })),
)

export default enhance(Display)