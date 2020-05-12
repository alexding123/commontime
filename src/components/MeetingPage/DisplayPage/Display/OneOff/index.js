import React from 'react'
import { compose, withProps } from 'recompose'
import { connect } from 'react-redux'
import { firestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase'
import date from 'date-and-time'
import SplashScreen from '../../../../SplashScreen'
import InstanceDisplay from './InstanceDisplay'

import { ListGroup } from 'react-bootstrap'
import { getCommonFreePeriods } from '../../../../../utils'

const OneOff = ({profile, instances, periods, data}) => {
  if (!isLoaded(instances) || !isLoaded(periods) || !isLoaded(profile) || !data) {
    return <SplashScreen/>
  }
  const freeInstances = getCommonFreePeriods(instances, periods, data)
  const canRebook = !isEmpty(profile) && profile.token.claims.teacher ? data.allowRebook : false
  const filteredInstances = canRebook ? freeInstances : freeInstances.filter(instance => !instance.instances)
  return filteredInstances.length ? 
    <ListGroup>
      {
        filteredInstances.map((instance, index) => <InstanceDisplay key={index} instance={instance}/>)
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