import React from 'react'
import { Button, ListGroup } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import { Field, formValueSelector, reduxForm } from 'redux-form'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import ComboBox from './components/ComboBox'
import CheckIcon from '@material-ui/icons/Check'
import CloseIcon from '@material-ui/icons/Close'
import { getFreeRooms } from '../../utils'
import Control from './components/Control'
import PropTypes from 'prop-types'

/**
 * Helper function to filter choices as the user enters values
 * (check if name starts with the user-entered value)
 * @param {Object} room Candidate room name
 * @param {string} value User-entered value
 */
const filterName = (room, value) => {
  return room.name.toLowerCase().indexOf(value.toLowerCase()) === 0
}

/**
 * Form to add a new meeting
 */
const AddMeetingForm = ({pristine, submitting, rooms, handleSubmit, cancelForm, validated, instances}) => {
  const availableRooms = getFreeRooms(rooms, instances)
  return (
  <Form onSubmit={handleSubmit}>
    <ListGroup.Item>
      <div className="row">
        <div className="col-5">
          <Field 
            name="name"
            placeholder="Event name"
            component={Control}
          />
        </div>
        <div className="col-5">
          <Field 
            name="room"
            data={availableRooms}
            textField="name"
            valueField="id"
            component={ComboBox}
            filter={filterName}
          />
        </div>
        <div className="col-2 d-flex justify-content-center align-items-center">
          <Button variant="link" type="submit" disabled={pristine || submitting || !validated} className="center-button">     
            <CheckIcon/>
          </Button>
          <Button variant="link" onClick={cancelForm} className="center-button">     
            <CloseIcon/>
          </Button>
        </div>
      </div>
    </ListGroup.Item>
  </Form>
  )
}

AddMeetingForm.propTypes = {
  rooms: PropTypes.object,
  /** Whether the form has been touched */
  pristine: PropTypes.bool.isRequired,
  /** Whether the form is currently being submitted */
  submitting: PropTypes.bool.isRequired,
  /** Whether the form values are validated */
  validated: PropTypes.bool.isRequired,
  /** Handler for form submission */
  handleSubmit: PropTypes.func.isRequired,
  /** Handler for closing the form */
  cancelForm: PropTypes.func.isRequired,
  /** Optional list of preexisting meetings */
  instances: PropTypes.arrayOf(PropTypes.string),
}

/**
 * Validates the values of the form
 * @param {function} selector Selector of the forms
 * @param {function} rooms All available rooms
 */
const validate = (selector, rooms) => {
  const name = selector('name')
  const room = selector('room')
  return Boolean(
    name && room && Object.keys(rooms).includes(room)
  )
}

const enhance = compose(
  connect((state, props) => {
    const form = `addMeetingForm`
    const selector = (...field) => formValueSelector(form)(state, ...field)
    const validated = validate(selector, props.rooms)
    return {
      form: `addMeetingForm${props.time}`,
      validated,
    }
  }),
  reduxForm(),
)

export default enhance(AddMeetingForm)