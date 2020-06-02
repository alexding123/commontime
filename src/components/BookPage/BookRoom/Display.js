import React from 'react'
import { ListGroup } from 'react-bootstrap'
import { connect } from 'react-redux'
import { isEmpty } from 'react-redux-firebase'
import { compose } from 'recompose'
import { getFreeInstances } from '../../../utils'
import InstanceDisplay from './InstanceDisplay'
import PropTypes from 'prop-types'

/**
 * Order an array of instances to display the booked instances first
 * @param {Object[]} instances Array of instances to sort
 */
const sortInstances = (instances) => {
  const bookedInstances = instances.filter(instance => instance.instance)
  const freeInstances = instances.filter(instance => !instance.instance)
  return [...bookedInstances, ...freeInstances]
}

/**
 * Component to display the found instances within the contraints of
 * the filters
 */
const Display = ({profile, instances, periods, data}) => {
  // all time/location pairs within the constraint of the filters that 
  // don't have a class (including pairs that are booked meetings) 
  const freeInstances = getFreeInstances(instances, periods, data)
  // all the instances the current user has booked 
  const userBookedInstances = isEmpty(profile) || data.allowRebook ? [] : freeInstances.filter(instance => instance.instance && instance.instance.creator === profile.id)
  // only teachers can even have the option to rebook
  const canRebook = !isEmpty(profile) && profile.token.claims.teacher ? data.allowRebook : false
  // if exclude booked instances, we filter all time/location pairs
  // with any meeting on it
  const filteredInstances = canRebook ? sortInstances(freeInstances) : freeInstances.filter(instance => !instance.instance)

  // display the user's own booked instances and the filtered results
  const allInstancesToDisplay = [...userBookedInstances, ...filteredInstances]
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

Display.propTypes = {
  profile: PropTypes.object,
  instances: PropTypes.object,
  periods: PropTypes.object,
  data: PropTypes.object,
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