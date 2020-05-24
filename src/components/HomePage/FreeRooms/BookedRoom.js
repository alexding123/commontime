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



const BookedRoom = ({instance, users, profile, rooms, handleSubmit, handleCancel, handleAttend, handleUnattend}) => {
  users = users ? Object.values(users) : [] 
  const creator = users.filter(user => user && user.id === instance.creator)[0]
  const room = rooms[instance.room] ? rooms[instance.room] : {}
  return (<ListGroup.Item key={instance.room}>
    <Row>
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