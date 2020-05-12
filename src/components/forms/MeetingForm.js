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


const filterName = (room, value) => {
  return room.name.toLowerCase().indexOf(value.toLowerCase()) === 0
}

let MeetingForm = ({pristine, instance, instances, submitting, rooms, handleSubmit, cancelForm, validated}) => {
  const availableRooms = [...getFreeRooms(rooms, instances), rooms[instance.room]]
  return (
  <Form onSubmit={handleSubmit}>
    <ListGroup.Item>
      <div className="row">
        <div className="col-5">
          <Field 
            name="name"
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
          <Button variant="link" type="submit" disabled={submitting || !validated} className="p-0 d-flex justify-content-center align-items-center">     
            <CheckIcon/>
          </Button>
          <Button variant="link" onClick={cancelForm} className="p-0 d-flex justify-content-center align-items-center">     
            <CloseIcon/>
          </Button>
        </div>
      </div>
    </ListGroup.Item>
    
  </Form>
  )
}

const validate = (state, props) => {
  const selector = formValueSelector(`meeting${props.key}Form`)
  const name = selector(state, 'name')
  const room = selector(state, 'room')
  return name && room && Object.keys(props.rooms).includes(room)
  }

const enhance = compose(
  connect((state, props) => ({
    form: `meeting${props.key}Form`,
    validated: validate(state, props),
    initialValues: {
      name: props.instance.name,
      room: props.instance.room,
    }
  })),
  reduxForm(),
)

export default enhance(MeetingForm)