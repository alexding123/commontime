import React from 'react'
import { compose, withProps } from 'recompose'
import { connect } from 'react-redux'
import { firestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase'
import date from 'date-and-time'
import SplashScreen from '../../../../SplashScreen'
import InstanceDisplay from './InstanceDisplay'

import { ListGroup } from 'react-bootstrap'
import { getCommonFreePeriods } from '../../../../../utils'
import PropTypes from 'prop-types'

/**
 * Component to display the search results for potential times of 
 * one-off meetings
 */
const OneOff = ({profile, instances, periods, data}) => {
  if (!isLoaded(instances) || !isLoaded(periods) || !isLoaded(profile) || !data) {
    return <SplashScreen/>
  }
  // get all time slots with no class shared by all members
  const searchResults = getCommonFreePeriods(instances, periods, data)
  // only teachers can even have the option to rebook
  const canRebook = !isEmpty(profile) && profile.token.claims.teacher ? data.allowRebook : false
  // get all free time slots shared by members
  const freeInstances = canRebook ? searchResults : searchResults.filter(instance => !instance.instances)
  return freeInstances.length ? 
    <ListGroup>
      {
        freeInstances.map((instance, index) => <InstanceDisplay key={index} instance={instance}/>)
      }
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

OneOff.propTypes = {
  profile: PropTypes.object,
  instances: PropTypes.object,
  periods: PropTypes.object,
  /** Values the user inputted in the search parameters form */
  data: PropTypes.shape({
    frequency: PropTypes.oneOf(['oneOff', 'recurring']).isRequired,
    periods: PropTypes.array.isRequired,
    people: PropTypes.array.isRequired,
    dateRange: PropTypes.shape({
      startDate: PropTypes.objectOf(Date).isRequired,
      endDate: PropTypes.objectOf(Date).isRequired,
    }),
    allowRebook: PropTypes.bool,
  }).isRequired,
}

const enhance = compose(
  connect(state => ({
    data: state.meetingPage,
    instances: state.firestore.data.instancesMeetingOneOff,
    periods: state.firestore.data.periods,
    profile: state.firebase.profile,
  })),
  withProps(props => {
    const startDate = date.parse(date.format(props.data.dateRange.startDate, 'MM/DD/YYYY'), 'MM/DD/YYYY')
    const endDate = date.parse(date.format(date.addDays(props.data.dateRange.endDate, 1), 'MM/DD/YYYY'), 'MM/DD/YYYY')
    return {
      startDate,
      endDate
    }
  }),
  firestoreConnect(props => [{
    collectionGroup: 'instances',
    where: [
      ['startDate', '>', props.startDate],
      ['startDate', '<', props.endDate],
    ],
    storeAs: 'instancesMeetingOneOff'
  }])
)

export default enhance(OneOff)