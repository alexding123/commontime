import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline'
import PersonAddIcon from '@material-ui/icons/PersonAdd'
import date from 'date-and-time'
import React from 'react'
import { Button, Card, Col, OverlayTrigger, Row } from 'react-bootstrap'
import { connect } from 'react-redux'
import { firestoreConnect, isEmpty, isLoaded } from 'react-redux-firebase'
import { compose } from 'recompose'
import { deleteOneOffMeeting, inviteOneOffMeeting, notifyOneOffMeeting, unsubscribeOneOffMeeting } from '../../../../actions/meetingPageActions'
import { dayMap } from '../../../../utils'
import SplashScreen from '../../../SplashScreen'
import inviteFunc from './inviteFunc'
import notifyFunc from './notifyFunc'

const InstanceDisplay = ({profile, instance, instanceID, periods, rooms, invitations, unsubscribe, deleteMeeting, handleNotifySubmit, handleInviteSubmit}) => {
  if (!isLoaded(invitations)) {
    return <SplashScreen/>
  }
  const periodName = periods[instance.period].name
  const roomName = instance.room ? rooms[instance.room].name : instance.roomName
  const dateObj = date.parse(instance.date, 'MM/DD/YYYY')
  const dayName = dayMap[dateObj.getDay()]
  const dateName = date.format(dateObj, 'MMMM DD')
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
          <Button className="inline-link" variant="link" href={`/Rooms/${instance.room}`}>{roomName}</Button> :
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
          <OverlayTrigger trigger='click' rootClose={true} overlay={
            isNotify ? 
            notifyFunc(instance, instanceID, handleNotifySubmit(instanceID)) : 
            inviteFunc(instance, instanceID, handleInviteSubmit(instance, instanceID, profile.id))
          }>
            <Button variant="link" className='p-0' style={{lineHeight: '0 !important'}}>
              <PersonAddIcon/>
            </Button>
          </OverlayTrigger> :
          null
        }
        <Button variant="link" className='p-0' style={{lineHeight: '0 !important'}} onClick={() => {
          if (isCreator) {
            deleteMeeting()
          } else {
            unsubscribe(profile.id)
          }
          
        }}>
          <DeleteOutlineIcon/>
        </Button>
      </Col>
      </Row>
    </Card.Body>
  </Card>
}

const enhance = compose(
  firestoreConnect(props => [{
    collection: 'invitations',
    where: [['instanceID', '==', props.instanceID]],
    storeAs: `${props.instanceID}Invitations`
  }]),
  connect((state, props) => ({
    periods: state.firestore.data.periods,
    rooms: state.firestore.data.rooms,
    profile: state.firebase.profile,
    invitations: state.firestore.data[`${props.instanceID}Invitations`]
  }), (dispatch, props) => ({
    deleteMeeting: () => dispatch(deleteOneOffMeeting(props.instanceID)),
    unsubscribe: (id) => dispatch(unsubscribeOneOffMeeting(props.instanceID, id)),
    handleNotifySubmit: (instanceID) => (values) => {
      dispatch(notifyOneOffMeeting(values, instanceID))
      document.body.click()
    },
    handleInviteSubmit: (instance, instanceID, userID) => (values) => {
      dispatch(inviteOneOffMeeting(values, instance, instanceID, userID))
      document.body.click()
    }
  }))
)

export default enhance(InstanceDisplay)