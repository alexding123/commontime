import CheckIcon from '@material-ui/icons/Check'
import CloseIcon from '@material-ui/icons/Close'
import React from 'react'
import { Button, Card, Col, Row } from 'react-bootstrap'
import { connect } from 'react-redux'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import { compose } from 'recompose'
import { acceptRecurringInvitation, declineInvitation } from '../../../../actions/meetingPageActions'
import { dayMap } from '../../../../utils'
import SplashScreen from '../../../SplashScreen'

const RecurringDisplay = ({invitation, periods, rooms, recurring, acceptInvitation, declineInvitation}) => {
  if (!isLoaded(recurring) || !recurring) {
    return <SplashScreen/>
  }
  const periodName = periods[recurring.period].name
  const roomName = recurring.room ? rooms[recurring.room].name : recurring.roomName
  const dayName = dayMap[periods[recurring.period].day]
  return <Card className="mb-2">
    <Card.Body>
      <Row className="mx-0 p-0">
      <Col className="p-0">
      <Row className="mx-0 p-0">
        <h5 className="d-inline">{recurring.name}</h5>
        <div className="d-inline pl-1">{recurring.room ? 
          <Button className="inline-link" variant="link" href={`/Rooms/${recurring.room}`}>{roomName}</Button> :
          roomName
        }</div>  
      </Row>
      <Row className="mx-0 p-0">
        {`${dayName} ${periodName} (recurring)`}
      </Row>
      </Col>
      <Button variant="link" className='mx-0 p-0 ml-auto d-flex justify-content-center align-items-center' style={{lineHeight: '0 !important'}} onClick={acceptInvitation}>
        <CheckIcon/>
      </Button>
      <Button variant="link" className='mx-0 p-0 ml-auto d-flex justify-content-center align-items-center' style={{lineHeight: '0 !important'}} onClick={declineInvitation}>
        <CloseIcon/>
      </Button>
      </Row>
    </Card.Body>
  </Card>
}

const enhance = compose(
  firestoreConnect(props => [{
    collection: 'recurrings',
    doc: props.invitation.recurringID,
    storeAs: `${props.invitationID}Recurrings`,
  }]),
  connect((state, props) => ({
    periods: state.firestore.data.periods,
    rooms: state.firestore.data.rooms,
    profile: state.firebase.profile,
    recurring: state.firestore.data[`${props.invitationID}Recurrings`],
  }), (dispatch, props) => ({
    acceptInvitation: () => dispatch(acceptRecurringInvitation(props.invitationID, props.invitation)),
    declineInvitation: () => dispatch(declineInvitation(props.invitationID)),
  }))
)

export default enhance(RecurringDisplay)