import React from 'react'
import { ListGroup, Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import AddIcon from '@material-ui/icons/Add'
import AddMeetingForm from '../../forms/AddMeetingForm'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { addMeeting } from '../../../actions/homeActions'
import PropTypes from 'prop-types'

/**
 * Component that allows an admin to add a lunch or after school meeting
 */
const AddMeeting = ({isAdd, setIsAdd, time, instances, rooms, handleSubmit}) => {
  if (!isAdd) {
    return <ListGroup.Item>
      <OverlayTrigger
        placement="top-start"
        overlay={
          <Tooltip>
            Add Meeting
          </Tooltip>
        }
      >
      <Button variant="link" className="center-button mx-auto"  onClick={() => setIsAdd(true)}>
        <AddIcon/>
      </Button>
      </OverlayTrigger>
    </ListGroup.Item>
  }

  return <AddMeetingForm
    rooms={rooms}
    onSubmit={handleSubmit}
    time={time}
    cancelForm={() => setIsAdd(false)}
    instances={instances}
  />
}

AddMeeting.propTypes = {
  /** Whether we are in the middle of adding a meeting */
  isAdd: PropTypes.bool.isRequired,
  /** Hook to set the value of isAdd */
  setIsAdd: PropTypes.func.isRequired,
  /** Current date, formatted as MM/DD/YYYY */
  time: PropTypes.string.isRequired,
  instances: PropTypes.object,
  rooms: PropTypes.object,
  /** Handler for form submission */
  handleSubmit: PropTypes.func.isRequired,
}

const enhance = compose(
  connect(null, (dispatch, props) => ({
    handleSubmit: (values) => {props.setIsAdd(false); return dispatch(addMeeting(props.date, props.day, props.time)(values))}
  }))
)

export default enhance(AddMeeting)