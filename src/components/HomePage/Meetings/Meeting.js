import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxOutlinedIcon from '@material-ui/icons/CheckBoxOutlined'
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline'
import EditIcon from '@material-ui/icons/Edit'
import React from 'react'
import { Button, ListGroup, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { connect } from 'react-redux'
import { isEmpty } from 'react-redux-firebase'
import { compose, withState } from 'recompose'
import { attendMeeting, deleteMeeting, unattendMeeting, updateMeeting } from '../../../actions/homeActions'
import MeetingForm from '../../forms/MeetingForm'
import PropTypes from 'prop-types'

/**
 * Component to show a single lunch or after school meeting
 */
const Meeting = ({isEdit, setIsEdit, key, editable, instance, profile, rooms, instances, handleSubmit, handleDelete, handleAttend, handleUnattend}) => {
  // if we're editting the meeting, show the form
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

  // otherwise, render the meeting
  return <ListGroup.Item>
    <div className="row">
      <div className="col-5">{instance.name}</div>
      <div className="col-5"><Button variant="link" className="inline-link" href={`/Room/${instance.room}`}>{rooms[instance.room].name}</Button></div>
      <div className="col-2 pr-0 d-flex flex-row justify-content-end">
        {/** If user is logged in, allow user to indicate attendance */}
        { !isEmpty(profile) ? 
          (instance.members.includes(profile.id) ?
          <Button variant="link" className="center-button" onClick={handleUnattend}>
            <CheckBoxOutlinedIcon/>
          </Button> :
          <Button variant="link" className="center-button" onClick={handleAttend}>
            <CheckBoxOutlineBlankIcon/>
          </Button>) :
          null
        }
        {/** If user is admin, allow user to edit or delete the meeting */}
        {
          editable ? 
          <React.Fragment>
            <OverlayTrigger
              placement="top-start"
              overlay={
                <Tooltip>
                  Edit
                </Tooltip>
              }
            >
            <Button variant="link" className="center-button" onClick={() => {setIsEdit(true)}}>     
              <EditIcon/>
            </Button>
            </OverlayTrigger>
            <OverlayTrigger
              placement="top-start"
              overlay={
                <Tooltip>
                  Delete
                </Tooltip>
              }
            >
            <Button variant="link" className="center-button" onClick={handleDelete}>     
              <DeleteOutlineIcon/>
            </Button>
            </OverlayTrigger>
          </React.Fragment>
          : null
        }
      </div>
    </div>
  </ListGroup.Item>
}

Meeting.propTypes = {
  /** Whether the meeting is being editted */
  isEdit: PropTypes.bool.isRequired,
  /** Hook to set isEdit */
  setIsEdit: PropTypes.func.isRequired,
  /** Random key to uniquely identify this meeting */
  key: PropTypes.string.isRequired,
  /** Whether the user has the privileges to edit this meeting */
  editable: PropTypes.bool.isRequired,
  /** Meeting information to be displayed */
  instance: PropTypes.shape({
    name: PropTypes.string.isRequired,
    room: PropTypes.string.isRequired,
    members: PropTypes.arrayOf(Object).isRequired,
  }).isRequired,
  profile: PropTypes.object,
  rooms: PropTypes.object,
  instances: PropTypes.object,
  /** Handler of when the add meeting form is submitted */
  handleSubmit: PropTypes.func.isRequired,
  /** Handler of deleting the meeting */
  handleDelete: PropTypes.func.isRequired,
  /** Handler of indicating current user's attendance */
  handleAttend: PropTypes.func.isRequired,
  /** Handler of removing current user's attendance */
  handleUnattend: PropTypes.func.isRequired,
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
