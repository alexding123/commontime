import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline'
import PersonAddIcon from '@material-ui/icons/PersonAdd'
import date from 'date-and-time'
import React from 'react'
import { Button, Card, Col, OverlayTrigger, Row, Tooltip } from 'react-bootstrap'
import { connect } from 'react-redux'
import { firestoreConnect, isEmpty, isLoaded } from 'react-redux-firebase'
import { compose } from 'recompose'
import { deleteOneOffMeeting, inviteOneOffMeeting, notifyOneOffMeeting, unsubscribeOneOffMeeting } from '../../../../actions/meetingPageActions'
import { dayMap } from '../../../../utils'
import SplashScreen from '../../../SplashScreen'
import inviteFunc from './inviteFunc'
import notifyFunc from './notifyFunc'
import PropTypes from 'prop-types'

/**
 * Component to display a single one-off meeting the user is in
 */
const InstanceDisplay = ({profile, instance, instanceID, periods, rooms, invitations, unsubscribe, deleteMeeting, handleNotifySubmit, handleInviteSubmit}) => {
  // only need the invitations if user is the creator of the instance
  if (instance.creator === profile.id) {
    if (!isLoaded(invitations)) {
      return <SplashScreen/>
    }
  }
  const periodName = periods[instance.period].name
  const roomName = instance.room ? rooms[instance.room].name : instance.roomName
  const dateObj = date.parse(instance.date, 'MM/DD/YYYY')
  const dayName = dayMap[dateObj.getDay()]
  const dateName = date.format(dateObj, 'MMMM DD')
  // only a teacher can simply add other members, instead of invite 
  const isNotify = !isEmpty(profile) && profile.token.claims.teacher
  const isCreator = profile.id === instance.creator
  return <Card className="mb-2">
    <Card.Body>
      <Row className="mx-0 p-0">
      <Col className="p-0">
      <Row className="mx-0 p-0">
      <Col className="p-0">
        <h5 className="d-inline">{instance.name}</h5>
        <div className="d-inline pl-1">{instance.room ? 
          <Button className="inline-link" variant="link" href={`/Room/${instance.room}`}>{roomName}</Button> :
          roomName
        }</div>  
      </Col>
      </Row>
      <Row className="mx-0 p-0">
        <Col className="p-0">{`${dayName} ${periodName}, ${dateName}`}</Col>
      </Row>
      </Col>
      <Col className="p-0 d-flex justify-content-end align-items-center">
        { isCreator ? 
          <OverlayTrigger trigger='click' rootClose={true} placement="top-start" overlay={
            isNotify ? 
            notifyFunc(instance, instanceID, handleNotifySubmit(instance, instanceID)) : 
            inviteFunc(instance, instanceID, handleInviteSubmit(instance, instanceID, profile.id))
          }>
            <Button variant="link" className='p-0' style={{lineHeight: '0 !important'}}>
              <PersonAddIcon/>
            </Button>
          </OverlayTrigger> :
          null
        }
        <OverlayTrigger
          placement="top-start"
          overlay={
            <Tooltip>
              Delete
            </Tooltip>
          }
        >
        <Button variant="link" className='p-0' style={{lineHeight: '0 !important'}} onClick={() => {
          if (isCreator) {
            deleteMeeting()
          } else {
            unsubscribe(profile.id)
          }
          
        }}>
          <DeleteOutlineIcon/>
        </Button>
        </OverlayTrigger>
      </Col>
      </Row>
    </Card.Body>
  </Card>
}

InstanceDisplay.propTypes = {
  profile: PropTypes.object,
  /** The instance to display */
  instance: PropTypes.shape({
    date: PropTypes.string.isRequired,
    room: PropTypes.string,
    roomName: PropTypes.string,
    period: PropTypes.string.isRequired,
    creator: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  /** ID of the displayed instance */
  instanceID: PropTypes.string.isRequired,
  periods: PropTypes.object,
  rooms: PropTypes.object,
  invitations: PropTypes.object,
  /** Handler to remove the current user from the members list */
  unsubscribe: PropTypes.func.isRequired,
  /** Handler to delete this meeting */
  deleteMeeting: PropTypes.func.isRequired,
  /** Handler to notify new members */
  handleNotifySubmit: PropTypes.func.isRequired,
  /** Handler to invite new members */
  handleInviteSubmit: PropTypes.func.isRequired,
}

const enhance = compose(
  connect((state, props) => ({
    periods: state.firestore.data.periods,
    rooms: state.firestore.data.rooms,
    profile: state.firebase.profile,
    invitations: state.firestore.data[`${props.instanceID}Invitations`]
  }), (dispatch, props) => ({
    deleteMeeting: () => dispatch(deleteOneOffMeeting(props.instanceID)),
    unsubscribe: (id) => dispatch(unsubscribeOneOffMeeting(props.instanceID, id)),
    handleNotifySubmit: (instance, instanceID) => (values) => {
      dispatch(notifyOneOffMeeting(values, instance, instanceID))
      document.body.click()
    },
    handleInviteSubmit: (instance, instanceID, userID) => (values) => {
      dispatch(inviteOneOffMeeting(values, instance, instanceID, userID))
      document.body.click()
    }
  })),
  firestoreConnect(props => {
    // only need the invitations if user is the creator of the instance
    if (props.instance.creator === props.profile.id) {
      return [{
        collection: 'invitations',
        where: [['instanceID', '==', props.instanceID]],
        storeAs: `${props.instanceID}Invitations`
      }]
    }
    return []
  }),
)

export default enhance(InstanceDisplay)