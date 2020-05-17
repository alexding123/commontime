import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxOutlinedIcon from '@material-ui/icons/CheckBoxOutlined'
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline'
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks'
import React from 'react'
import { Badge, Button, Col, ListGroup, OverlayTrigger, Row } from 'react-bootstrap'
import { connect } from 'react-redux'
import { isEmpty } from 'react-redux-firebase'
import { compose } from 'recompose'
import { attendMeeting, cancelBooking, rebookRoom, unattendMeeting } from '../../../actions/homeActions'
import rebookRoomFunc from './rebookRoom'



const BookedRoom = ({instance, users, profile, rooms, handleSubmit, handleCancel, handleAttend, handleUnattend}) => {
  const creator = Object.values(users).filter(user => user && user.id === instance.creator)[0]
  const room = rooms[instance.room]
  return (<ListGroup.Item key={instance.room}>
    <Row>
      <Col xs={5}>
        <Button variant="link" className="p-0" href={`/Room/${instance.room}`}>{room.name}</Button>
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
            <Button variant="link" className="p-0 d-flex justify-content-center align-items-center" onClick={handleUnattend} disabled={instance.creator === profile.id}>
              <CheckBoxOutlinedIcon/>
            </Button> :
            <Button variant="link" className="p-0 d-flex justify-content-center align-items-center" onClick={handleAttend}>
              <CheckBoxOutlineBlankIcon/>
            </Button>
          }
          { instance.creator === profile.id ?
            <Button variant='link' className='p-0 d-flex justify-content-center align-items-center' onClick={handleCancel}>
              <DeleteOutlineIcon/>
            </Button> :
            profile.token.claims.teacher ? 
            <OverlayTrigger
              rootClose={true}
              overlay={rebookRoomFunc(instance, handleSubmit)}
              trigger='click'
            >
            <Button variant='link' className='p-0 d-flex justify-content-center align-items-center'>
              <LibraryBooksIcon/>
            </Button>
            </OverlayTrigger> :
            null
          }
        </Col> :
        null
      }
    </Row>
    
  </ListGroup.Item>)
}

const enhance = compose(
  connect(null, (dispatch, props) => ({
    handleSubmit: (instance) => (values) => dispatch(rebookRoom(instance, props.id)(values)),
    handleCancel: () => dispatch(cancelBooking(props.id)),
    handleAttend: () => dispatch(attendMeeting(props.id)),
    handleUnattend: () => dispatch(unattendMeeting(props.id)),
  }))
)

export default enhance(BookedRoom)