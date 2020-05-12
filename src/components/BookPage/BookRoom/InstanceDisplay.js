import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline'
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks'
import date from 'date-and-time'
import React from 'react'
import { Alert, Badge, Button, Col, ListGroup, OverlayTrigger, Popover, Row, Tooltip } from 'react-bootstrap'
import { connect } from 'react-redux'
import { isEmpty } from 'react-redux-firebase'
import { compose } from 'recompose'
import { bookRoom, cancelBooking, rebookRoom } from '../../../actions/homeActions'
import { dayMap } from '../../../utils'
import BookRoomForm from '../../forms/BookRoomForm'
import RebookRoomForm from '../../forms/RebookRoomForm'

const InstanceDisplay = ({instance, users, profile, bookRoom, rebookRoom, cancelBooking}) => {
  users = users ? Object.values(users) : []
  let creator = instance.instance && users.length ? 
    users.filter(user => user.id === instance.instance.creator)[0] :
    null
  creator = creator ? creator : {}
  const canBookPrivate = !isEmpty(profile) && profile.token.claims.teacher
  return <ListGroup.Item>
  <Row>
    <Col xs={7}>
      {`${dayMap[instance.period.day]} ${instance.period.name}`}&nbsp;
      {
        instance.instance ?
        <OverlayTrigger trigger={['hover', 'click']} placement='right' overlay={
          <Tooltip>
            {instance.instance.private ? 
              <div><Badge variant='info'>Private</Badge>{` - ${creator.displayName}`}</div> : 
              <div>{`${instance.instance.name} - ${creator.displayName}`}</div>}
          </Tooltip>
        }>
          <Badge variant='info'>Booked</Badge>
        </OverlayTrigger>:
        null
      }
    </Col>
    <Col xs={3}>
      <Button className="p-0" variant="link" href={`/Room/${instance.room.id}`}>{instance.room.name}</Button>
    </Col>
    { !isEmpty(profile) ?
    <Col xs={2} className="d-flex flex-row justify-content-end pr-0 ml-auto">
      <OverlayTrigger
        rootClose={true}
        overlay={
          instance.instance ?
          <Popover>
            <Popover.Title>{`Override booking of ${instance.room.name} on ${dayMap[instance.period.day]} ${instance.period.name}, ${date.format(instance.date, 'MMMM DD')}`}</Popover.Title>
            <Popover.Content>
              <Alert variant="info">This will notify the original booker of the room.</Alert>
              <RebookRoomForm room={instance.room} date={instance.date} onSubmit={(values) => {rebookRoom(instance.instance, instance.instance.key)(values); document.body.click()}} canBookPrivate={canBookPrivate} cancelForm={() => document.body.click()}/>
            </Popover.Content>
          </Popover> :
           <Popover>
            <Popover.Title>{`Book room ${instance.room.name} on ${dayMap[instance.period.day]} ${instance.period.name}, ${date.format(instance.date, 'MMMM DD')}`}</Popover.Title>
            <Popover.Content>
              <BookRoomForm room={instance.room} date={instance.date} onSubmit={values => {bookRoom(date.format(instance.date, 'MM/DD/YYYY'), `${instance.period.day}-${instance.period.period}`, instance.room.id)(values); document.body.click()}} canBookPrivate={canBookPrivate} cancelForm={() => document.body.click()}/>
            </Popover.Content>
          </Popover>
        }
        trigger='click'
      >
        <Button variant='link' className='p-0 d-flex justify-content-center align-items-center'>
          <LibraryBooksIcon/>
        </Button>
      </OverlayTrigger>
      { instance.instance ?
        <Button variant="link" className="p-0 d-flex justify-content-center align-items-center" onClick={cancelBooking(instance.instance.key)}>     
          <DeleteOutlineIcon/>
        </Button> :
        null
      }
      
    </Col> :
    null
    }
  </Row>
  
</ListGroup.Item>
}

const enhance = compose(
  connect(state => ({
    users: state.firestore.data.users,
    profile: state.firebase.profile,
  }), dispatch => ({
    bookRoom: (date, period, room) => (values) => dispatch(bookRoom(date, period, room)(values)),
    rebookRoom: (instance, instanceID) => (values) => dispatch(rebookRoom(instance, instanceID)(values)),
    cancelBooking: (instanceID) => () => dispatch(cancelBooking(instanceID))
  })),
)

export default enhance(InstanceDisplay)