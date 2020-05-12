
import React from 'react'
import Form from 'react-bootstrap/Form'
import { compose } from 'redux'
import { Field, reduxForm, submit } from 'redux-form'
import DateRangePicker from './components/DateRangePicker'
import HybridSelect from './components/HybridSelect'
import Toggle from './components/Toggle'

const form = 'scheduleRoomForm'

const ScheduleRoomForm = ({pristine, submitting, validated, handleSubmit, rooms, periods, users, canRebook}) => {
  return (
  <Form onSubmit={handleSubmit}>
    <Form.Group>
      <Form.Label>Date Range</Form.Label>
      <Field name="dateRange" component={DateRangePicker} key={form}/>
    </Form.Group>
    <Form.Group>
      <Form.Label>Periods</Form.Label>
      <Field
        name="periods"
        component={HybridSelect}
        valueField='period'
        textField='name'
        defaultMode='multi'
        filter='contains'
        data={periods}
      />
    </Form.Group>
    <Form.Group>
      <Form.Label>Rooms</Form.Label>
      <Field
        name="rooms"
        component={HybridSelect}
        valueField='id'
        textField='name'
        defaultMode='multi'
        filter='contains'
        data={rooms}
      />
    </Form.Group>
    { canRebook ? 
      <Form.Group>
        <Field 
          name="allowRebook"
          trueText="Show Booked"
          falseText="Hide Booked"
          component={Toggle}
        />
      </Form.Group> :
      null
    }
    
  </Form>
  )
}

const enhance = compose(
  reduxForm({
    form,
    onChange: (values, dispatch) => {
      dispatch(submit(form))
    },
  })
)

export default enhance(ScheduleRoomForm)