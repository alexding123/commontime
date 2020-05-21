import LibraryBooksIcon from '@material-ui/icons/LibraryBooks'
import React from 'react'
import { Button, Card, Col, ListGroup, OverlayTrigger, Row } from 'react-bootstrap'
import { connect } from 'react-redux'
import { firestoreConnect, isEmpty, isLoaded } from 'react-redux-firebase'
import { compose } from 'recompose'
import { bookRoom } from '../../../actions/homeActions'
import { dayMap, getFreeRooms } from '../../../utils'
import SplashScreen from '../../SplashScreen'
import BookedRoom from './BookedRoom'
import bookRoomFunc from './bookRoom'


const FreeRooms = ({rooms, instances, period, profile, handleSubmit}) => {
  if (!isLoaded(instances)) {
    return <SplashScreen/>
  }

  const freeRooms = getFreeRooms(rooms, instances)
  const isTeacher = !isEmpty(profile) && profile.token.claims.teacher
  const bookedInstances = instances ? Object.entries(instances).filter(([key, instance]) => 
    instance && instance.type === 'event' && instance.room &&
    (!instance.private || instance.creator === profile.id)
  ) : []
  return (
    <div>
    <Card>
      <Card.Header>Rooms available for {`${period.name}, ${dayMap[period.day]} (${period.startTime}-${period.endTime}).`}</Card.Header>
      <Card.Body className='pt-0 pl-0 pr-0 pb-1'>
        <ListGroup variant="flush" >
          {freeRooms.map(room => (
            <ListGroup.Item key={room.id}>
              <Row>
                <Col>
                  <Button className="inline-link" variant="link" href={`/Room/${room.id}`}>{room.name}</Button>
                </Col>
                <Col className='ml-auto d-flex justify-content-end' xs={2}>
                  <OverlayTrigger
                    rootClose={true}
                    overlay={bookRoomFunc(room, isTeacher, handleSubmit)}
                    trigger='click'
                  >
                    <Button variant='link' className='center-button'>
                      <LibraryBooksIcon/>
                    </Button>
                  </OverlayTrigger>
                    
                </Col>
              </Row>
              
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
    {bookedInstances.length ? 
    <Card>
      <Card.Header>Booked Rooms</Card.Header>
      <Card.Body className='pt-0 pl-0 pr-0 pb-1'>
        <ListGroup variant="flush" >
          {bookedInstances.map(([key, instance]) => 
            <BookedRoom id={key} key={key} instance={instance}/>
          )}
        </ListGroup>
      </Card.Body>
    </Card> :
    null
    }
    </div>
  )
}

const enhance = compose(
  firestoreConnect((props) => [
    {
      collectionGroup: 'instances',
      where: [
        ['date', '==', props.date],
        ['period', '==', `${props.period.day}-${props.period.period}`],
      ],
      storeAs: 'instancesFreeRooms'
    },
  ]),
  connect(state => ({
    rooms: state.firestore.data.rooms,
    instances: state.firestore.data.instancesFreeRooms,
    users: state.firestore.data.userPreset,
    profile: state.firebase.profile,
  }), (dispatch, props) => ({
    handleSubmit: (room) => (values) => dispatch(bookRoom(props.date, `${props.period.day}-${props.period.period}`, room)(values)),
  })),
)

export default enhance(FreeRooms)