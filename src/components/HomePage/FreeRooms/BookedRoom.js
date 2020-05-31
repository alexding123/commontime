import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxOutlinedIcon from '@material-ui/icons/CheckBoxOutlined'
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline'
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks'
import React from 'react'
import { Badge, Button, Col, ListGroup, OverlayTrigger, Row, Tooltip } from 'react-bootstrap'
import { connect } from 'react-redux'
import { isEmpty } from 'react-redux-firebase'
import { compose } from 'recompose'
import { attendMeeting, cancelBooking, rebookRoom, unattendMeeting } from '../../../actions/homeActions'
import rebookRoomFunc from './rebookRoom'
import PropTypes from 'prop-types'

/**
 * Component that shows a booked room
 */
const BookedRoom = ({instance, users, profile, rooms, handleSubmit, handleCancel, handleAttend, handleUnattend}) => {
  // needed to avoid null values
  const allUsers = users ? Object.values(users).filter(user => user) : [] 
  // find the creator of the instance (could be null)
  const creator = allUsers.filter(user => user && user.id === instance.creator)[0]
  // and the room of the instance
  const room = rooms[instance.room] ? rooms[instance.room] : {}
  return (<ListGroup.Item key={instance.room}>
    <Row>
      {/** Room information and optional private badge */}
      <Col xs={5}>
        <Button variant="link" className="inline-link" href={`/Room/${instance.room}`}>{room.name}</Button>
        &nbsp;
        {instance.private ? 
         <Badge variant="info">Private</Badge> :
        null}
      </Col>
      <Col xs={5}>
        {`${instance.name}${creator ? ` - ${creator.name}`: ''}` }
      </Col>
      { 
        !isEmpty(profile) ?
        <Col className='ml-auto d-flex justify-content-end'>
          {/** If logged in, show an attend/unattend button */}
          {
            instance.members.includes(profile.id) ?
            <OverlayTrigger
              placement="top-start"
              overlay={
                <Tooltip>
                  Remove from Calendar
                </Tooltip>
              }
            >
            <Button variant="link" className="center-button" onClick={handleUnattend} disabled={instance.creator === profile.id}>
              <CheckBoxOutlinedIcon/>
            </Button>
            </OverlayTrigger> :
            <OverlayTrigger
              placement="top-start"
              overlay={
                <Tooltip>
                  Add to Calendar
                </Tooltip>
              }
            >
            <Button variant="link" className="center-button" onClick={handleAttend}>
              <CheckBoxOutlineBlankIcon/>
            </Button>
            </OverlayTrigger>
          }
          {/** If current user is creator, show delete button */}
          { instance.creator === profile.id ?
            <OverlayTrigger
              placement="top-start"
              overlay={
                <Tooltip>
                  Delete Booking
                </Tooltip>
              }
            >
            <Button variant='link' className='center-button' onClick={handleCancel}>
              <DeleteOutlineIcon/>
            </Button>
            </OverlayTrigger> :
            profile.token.claims.teacher ? 
            <React.Fragment>
            {
            /** If current user is a teacher but not creator, 
              * allow user to rebook or simply delete the instance
              */
            }
            <OverlayTrigger
              rootClose={true}
              overlay={rebookRoomFunc(room, instance, handleSubmit)}
              trigger='click'
            >
            <Button variant='link' className='center-button'>
              <LibraryBooksIcon/>
            </Button>
            </OverlayTrigger>
            <OverlayTrigger
              placement="top-start"
              overlay={
                <Tooltip>
                  Delete Someone Else's Booking
                </Tooltip>
              }
            >
            <Button variant='link' className='center-button' onClick={handleCancel}>
              <DeleteOutlineIcon/>
            </Button>
            </OverlayTrigger>
            </React.Fragment> :
            null
          }
        </Col> :
        null
      }
    </Row>
    
  </ListGroup.Item>)
}

BookedRoom.propTypes = {
  /** Instance to be displayed */
  instance: PropTypes.shape({
    creator: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    room: PropTypes.string.isRequired,
    private: PropTypes.bool.isRequired,
    members: PropTypes.arrayOf(Object).isRequired,
  }).isRequired,
  users: PropTypes.object,
  profile: PropTypes.object,
  rooms: PropTypes.object,
  /** Handler of rebooking the room */
  handleSubmit: PropTypes.func.isRequired,
  /** Handler of deleting the room */
  handleCancel: PropTypes.func.isRequired,
  /** Hanlder of adding the current user to the meeting */
  handleAttend: PropTypes.func.isRequired,
  /** Handler of removing the current user from the meeting */
  handleUnattend: PropTypes.func.isRequired,
}

const enhance = compose(
  connect(state => ({
    rooms: state.firestore.data.rooms,
    users: state.firestore.data.userPreset,
    profile: state.firebase.profile,
  }), (dispatch, props) => ({
    handleSubmit: (instance) => (values) => dispatch(rebookRoom(instance, props.id)(values)),
    handleCancel: () => dispatch(cancelBooking(props.id)),
    handleAttend: () => dispatch(attendMeeting(props.id)),
    handleUnattend: () => dispatch(unattendMeeting(props.id)),
  }))
)

export default enhance(BookedRoom)