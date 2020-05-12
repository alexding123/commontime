import React from 'react'
import { ListGroup, Button } from 'react-bootstrap'
import AddIcon from '@material-ui/icons/Add'
import AddMeetingForm from '../../forms/AddMeetingForm'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { addMeeting } from '../../../actions/homeActions'

const AddMeeting = ({isAdd, setIsAdd, time, instances, rooms, handleSubmit}) => {
  if (!isAdd) {
    return <ListGroup.Item>
      <Button variant="link" className="p-0 d-flex justify-content-center align-items-center mx-auto"  onClick={() => setIsAdd(true)}>
        <AddIcon/>
      </Button>
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

const enhance = compose(
  connect(null, (dispatch, props) => ({
    handleSubmit: (values) => {props.setIsAdd(false); return dispatch(addMeeting(props.date, props.day, props.time)(values))}
  }))
)

export default enhance(AddMeeting)