import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxOutlinedIcon from '@material-ui/icons/CheckBoxOutlined'
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline'
import EditIcon from '@material-ui/icons/Edit'
import React from 'react'
import { Button, ListGroup } from 'react-bootstrap'
import { connect } from 'react-redux'
import { isEmpty } from 'react-redux-firebase'
import { compose, withState } from 'recompose'
import { attendMeeting, deleteMeeting, unattendMeeting, updateMeeting } from '../../../actions/homeActions'
import MeetingForm from '../../forms/MeetingForm'

const Meeting = ({isEdit, setIsEdit, key, editable, instance, profile, rooms, handleSubmit, handleDelete, handleAttend, handleUnattend, instances}) => {
  if (isEdit) {
    return <MeetingForm 
      key={key} 
      rooms={rooms}
      onSubmit={handleSubmit}
      instance={instance}
      instances={instances}
      cancelForm={() => {setIsEdit(false)}}
    />
  }
  return <ListGroup.Item>
    <div className="row">
      <div className="col-5">{instance.name}</div>
      <div className="col-5"><Button variant="link" className="p-0" href={`/Room/${instance.room}`}>{rooms[instance.room].name}</Button></div>
      <div className="col-2 pr-0 d-flex flex-row justify-content-end">
        { !isEmpty(profile) ? 
          (instance.members.includes(profile.id) ?
          <Button variant="link" className="p-0 d-flex justify-content-center align-items-center" onClick={handleUnattend}>
            <CheckBoxOutlinedIcon/>
          </Button> :
          <Button variant="link" className="p-0 d-flex justify-content-center align-items-center" onClick={handleAttend}>
            <CheckBoxOutlineBlankIcon/>
          </Button>) :
          null
        }
        {
          editable ? 
          <React.Fragment>
            <Button variant="link" className="p-0 d-flex justify-content-center align-items-center" onClick={() => {setIsEdit(true)}}>     
              <EditIcon/>
            </Button>
            <Button variant="link" className="p-0 d-flex justify-content-center align-items-center" onClick={handleDelete}>     
              <DeleteOutlineIcon/>
            </Button>
          </React.Fragment>
          : null
        }
      </div>
    </div>
  </ListGroup.Item>
}

const enhance = compose(
  withState('isEdit', 'setIsEdit', false),
  connect(state => ({
    profile: state.firebase.profile,
  }), (dispatch, props) => ({
    handleSubmit: (values) => {props.setIsEdit(false); return dispatch(updateMeeting(props.id)(values))},
    handleDelete: () => dispatch(deleteMeeting(props.id)),
    handleAttend: () => dispatch(attendMeeting(props.id)),
    handleUnattend: () => dispatch(unattendMeeting(props.id)),
  }))
)

export default enhance(Meeting)
