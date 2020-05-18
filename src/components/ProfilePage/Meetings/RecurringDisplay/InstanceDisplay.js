import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline'
import PersonAddIcon from '@material-ui/icons/PersonAdd'
import React from 'react'
import { Button, Card, Col, OverlayTrigger, Row } from 'react-bootstrap'
import { connect } from 'react-redux'
import { firestoreConnect, isEmpty, isLoaded } from 'react-redux-firebase'
import { compose } from 'recompose'
import { deleteRecurringMeeting, inviteRecurringMeeting, notifyRecurringMeeting, unsubscribeRecurringMeeting } from '../../../../actions/meetingPageActions'
import { dayMap } from '../../../../utils'
import SplashScreen from '../../../SplashScreen'
import inviteFunc from './inviteFunc'
import notifyFunc from './notifyFunc'

const InstanceDisplay = ({profile, recurring, recurringID, periods, rooms, invitations, unsubscribe, deleteMeeting, handleNotifySubmit, handleInviteSubmit}) => {
  if (recurring.creator === profile.id && !isLoaded(invitations)) {
    return <SplashScreen/>
  }
  const periodName = periods[recurring.period].name
  const roomName = recurring.room ? rooms[recurring.room].name : recurring.roomName
  const dayName = dayMap[periods[recurring.period].day]
  const isNotify = !isEmpty(profile) && profile.token.claims.teacher
  const isCreator = profile.id === recurring.creator
  return <Card className="mb-2">
    <Card.Body>
      <Row className="mx-0 p-0">
      <Col className="p-0">
      <Row className="mx-0 p-0">
      <Col className="p-0">
        <h5 className="d-inline">{recurring.name}</h5>
        <div className="d-inline pl-1">{recurring.room ? 
          <Button className="inline-link" variant="link" href={`/Rooms/${recurring.room}`}>{roomName}</Button> :
          roomName
        }</div>  
      </Col>
      </Row>
      <Row className="mx-0 p-0">
        <Col className="p-0">{`${dayName} ${periodName}`}</Col>
      </Row>
      </Col>
      <Col className="p-0 d-flex justify-content-end align-items-center">
        { isCreator ?
          <OverlayTrigger trigger='click' rootClose={true} placement="top-start" overlay={
            isNotify ? 
            notifyFunc(recurring, recurringID, handleNotifySubmit(recurringID)) : 
            inviteFunc(recurring, recurringID, handleInviteSubmit(recurring, recurringID, profile.id))
          }>
            <Button variant="link" className='p-0' style={{lineHeight: '0 !important'}}>
              <PersonAddIcon/>
            </Button>
          </OverlayTrigger> : null
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
  connect((state, props) => ({
    periods: state.firestore.data.periods,
    rooms: state.firestore.data.rooms,
    profile: state.firebase.profile,
    invitations: state.firestore.data[`${props.recurringID}Invitations`]
  }), (dispatch, props) => ({
    deleteMeeting: () => dispatch(deleteRecurringMeeting(props.recurringID)),
    unsubscribe: (id) => dispatch(unsubscribeRecurringMeeting(props.recurringID, id)),
    handleNotifySubmit: (recurringID) => (values) => {
      dispatch(notifyRecurringMeeting(values, recurringID))
      document.body.click()
    },
    handleInviteSubmit: (recurring, recurringID, userID) => (values) => {
      dispatch(inviteRecurringMeeting(values, recurring, recurringID, userID))
      document.body.click()
    }
  })),
  firestoreConnect(props => {
    if (props.recurring.creator === props.profile.id) {
      return [{
        collection: 'invitations',
        where: [['recurringID', '==', props.recurringID]],
        storeAs: `${props.recurringID}Invitations`
      }]
    }
    return []
  }),
)

export default enhance(InstanceDisplay)