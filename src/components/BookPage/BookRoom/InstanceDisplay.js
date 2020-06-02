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
import PropTypes from 'prop-types'

/** 
 * Component to display a single search result
 */
const InstanceDisplay = ({instance, users, profile, bookRoom, rebookRoom, cancelBooking}) => {
  // filter any potential null value
  const allUsers = users ? Object.values(users).filter(user => user) : []

  // find creator of the instance, if they exist
  let creator = instance.instance && allUsers.length ? 
  allUsers.filter(user => user.id === instance.instance.creator)[0] :
    null
  creator = creator ? creator : {}

  // only teachers can book private meetings
  const canBookPrivate = !isEmpty(profile) && profile.token.claims.teacher
  return <ListGroup.Item>
  <Row>
    {/** Information about the instance */}
    <Col xs={7}>
      {`${dayMap[instance.period.day]} ${instance.period.name}`}&nbsp;
      {
        instance.instance ?
        <OverlayTrigger trigger={['hover', 'click']} placement='right' overlay={
          <Tooltip>
            {instance.instance.private ? 
              <div><Badge variant='info'>Private</Badge>{` - ${creator.name}`}</div> : 
              <div>{`${instance.instance.name} - ${creator.name}`}</div>}
          </Tooltip>
        }>
          <Badge variant='info'>Booked</Badge>
        </OverlayTrigger>:
        null
      }
    </Col>
    {/** Room of the instance, linked */}
    <Col xs={3}>
      <Button className="inline-link" variant="link" href={`/Room/${instance.room.id}`}>{instance.room.name}</Button>
    </Col>
    {/** All the buttons */}
    { !isEmpty(profile) ?
    <Col xs={2} className="d-flex flex-row justify-content-end pr-0 ml-auto">
      {/** A single book/rebook button */}
      { !(instance.instance && instance.instance.creator === profile.id) ? 
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
        <Button variant='link' className='center-button'>
          <LibraryBooksIcon/>
        </Button>
      </OverlayTrigger> : null
      }
      {/** If instance is booked, render a cancel button */}
      { instance.instance ?
        <Button variant="link" className="center-button" onClick={cancelBooking(instance.instance.key)}>     
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

InstanceDisplay.propTypes = {
  instance: PropTypes.shape({
    room: PropTypes.object.isRequired,
    period: PropTypes.object.isRequired,
    instance: PropTypes.object,
  }).isRequired,
  users: PropTypes.object,
  profile: PropTypes.object,
  /** Handler to book the instance */
  bookRoom: PropTypes.func.isRequired,
  /** Handler to overwrite the booking of the instance */
  rebookRoom: PropTypes.func.isRequired,
  /** Handler to delete the booking of the instance */
  cancelBooking: PropTypes.func.isRequired,
}

const enhance = compose(
  connect(state => ({
    users: state.firestore.data.userPreset,
    profile: state.firebase.profile,
  }), dispatch => ({
    bookRoom: (date, period, room) => (values) => dispatch(bookRoom(date, period, room)(values)),
    rebookRoom: (instance, instanceID) => (values) => dispatch(rebookRoom(instance, instanceID)(values)),
    cancelBooking: (instanceID) => () => dispatch(cancelBooking(instanceID))
  })),
)

export default enhance(InstanceDisplay)