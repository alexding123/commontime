import React from 'react'
import { compose, withState} from 'recompose'
import { withFirebase, firestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase'
import { connect } from 'react-redux'
import SplashScreen from '../../SplashScreen'
import { ListGroup, Card } from 'react-bootstrap'
import Meeting from './Meeting'
import AddMeeting from './AddMeeting'
import PropTypes from 'prop-types'

/**
 * Component to list all lunch and after school meetings
 */
const Meetings = ({instancesLunch, instancesAfter, rooms, profile, isAddLunch, setIsAddLunch, date, period, isAddAfter, setIsAddAfter}) => {
  if (!isLoaded(instancesLunch) || !isLoaded(instancesAfter) || !isLoaded(rooms)) {
    return <SplashScreen/>
  }

  // only admins can add meetings to this list
  const hasAccess = !isEmpty(profile) && profile.token.claims.admin
  return (
    <Card>
      <Card.Header>Meetings</Card.Header>
      <Card.Body className='pt-1 pl-1 pr-1 pb-1'>
        {/** Lunch meetings */}
        <ListGroup variant="flush">
          { instancesLunch ?
          <React.Fragment>
          <ListGroup.Item>Lunch</ListGroup.Item>
          {instancesLunch ? Object.entries(instancesLunch).filter(([key, instance]) => instance.room !== '').map(([key, instance]) => (
            <Meeting key={key} id={key} instance={instance} instances={instancesLunch} rooms={rooms} editable={hasAccess} />
          )) : null}
          </React.Fragment> :
          hasAccess ?
          <React.Fragment>
          <ListGroup.Item>Lunch</ListGroup.Item>
          <AddMeeting date={date} day={period.day} instances={instancesLunch} isAdd={isAddLunch} setIsAdd={setIsAddLunch} rooms={rooms} time="Lunch"/>
          </React.Fragment> :
          <ListGroup.Item>No Lunch Meeting!</ListGroup.Item>
          }
        </ListGroup>
        {/** After school meetings */}
        <ListGroup variant="flush">
          { instancesAfter ? 
          <React.Fragment>
          <ListGroup.Item>After School</ListGroup.Item>
          {instancesAfter ? Object.entries(instancesAfter).filter(([key, instance]) => instance.room !== '').map(([key, instance]) => (
            <Meeting key={key} id={key} instance={instance} instances={instancesAfter} rooms={rooms} editable={!isEmpty(profile) && (profile.token.claims.admin || profile.token.claims.teacher)} />
          )) : null}
          </React.Fragment> :
          hasAccess ? 
          <React.Fragment>
          <ListGroup.Item>After School</ListGroup.Item>
          <AddMeeting date={date} day={period.day} instances={instancesAfter} isAdd={isAddAfter} setIsAdd={setIsAddAfter} rooms={rooms} time="After School"/>
          </React.Fragment> :
          <ListGroup.Item>No After School Meeting!</ListGroup.Item>
          }
        </ListGroup>
      </Card.Body>
    </Card>
  )
}

Meetings.propTypes = {
  /** All lunch meetings (could be null) */
  instancesLunch: PropTypes.object,
  /** All after school meetings (could be null) */
  instancesAfter: PropTypes.object,
  rooms: PropTypes.object,
  profile: PropTypes.object,
  /** Whether user is adding a lunch meeting */
  isAddLunch: PropTypes.bool.isRequired,
  /** Hook to update isAddLunch */
  setIsAddLunch: PropTypes.func.isRequired,
  /** Whether user is adding an after school meeting */
  isAddAfter: PropTypes.bool.isRequired,
  /** Hook to update isAddAfter */
  setIsAddAfter: PropTypes.func.isRequired,
}

const enhance = compose(
  withFirebase,
  withState('isAddLunch', 'setIsAddLunch', false),
  withState('isAddAfter', 'setIsAddAfter', false),
  firestoreConnect((props) => [
    {
      collectionGroup: 'instances',
      where: [
        ['type', '==', 'event'],
        ['date', '==', props.date],
        ['period', '==', `${props.period.day}-Lunch`],
      ],
      storeAs: 'instancesEventsLunch'
    },
    {
      collectionGroup: 'instances',
      where: [
        ['type', '==', 'event'],
        ['date', '==', props.date],
        ['period', '==', `${props.period.day}-After School`],
      ],
      storeAs: 'instancesEventsAfter'
    },
    {
      collection: 'rooms',
    }
  ]),
  
  connect(state => ({
    rooms: state.firestore.data.rooms,
    instancesLunch: state.firestore.data.instancesEventsLunch,
    instancesAfter: state.firestore.data.instancesEventsAfter,
    profile: state.firebase.profile,
  })),
)

export default enhance(Meetings)