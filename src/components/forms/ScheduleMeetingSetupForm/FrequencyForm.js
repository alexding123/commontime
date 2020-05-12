
import React from 'react'
import { Button, ButtonGroup } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import { connect } from 'react-redux'
import { Field, formValueSelector, reduxForm } from 'redux-form'
import { compose } from 'recompose'
import renderButtonGroup from '../components/ButtonGroup'
import DateRangePicker from '../components/DateRangePicker'
import { pageSet } from '../../../actions/meetingPageActions'

const form = 'scheduleMeetingSetupForm'

const FrequencyForm = ({pristine, submitting, validated, people, profile, handleSubmit, previousPage, nextPage, selector}) => {
  const frequency = selector('frequency')
  return (
  <Form onSubmit={handleSubmit}>
    <h5>What kind of meeting is this?</h5>
    <Form.Group>
      <Field
        name="frequency"
        options={[{
          id: 'recurring',
          text: 'Recurring',
        }, {
          id: 'oneOff',
          text: 'One Off',
        }]}
        valueField='id'
        textField='text'
        component={renderButtonGroup}
      />
      
      <p className="text-muted">{
        frequency === 'oneOff' ? "We will compare your schedules during the selected date range and find common periods where all members have indicated no other commitment (i.e., classes, clubs, or meetings)" : "We will compare your weekly schedules to find common free periods, but depending on the week, you might have other one-off commitments during these periods"
      }</p>
    </Form.Group>
    { frequency === 'oneOff' ?
      <Form.Group>
        <Field
          name='dateRange'
          component={DateRangePicker} 
          key={form}
        />
      </Form.Group> : null
    }
    <ButtonGroup>
      <Button onClick={previousPage}>Previous</Button>
      <Button onClick={nextPage}>Next</Button>
    </ButtonGroup>
  </Form>
  )
}


const enhance = compose(
  connect((state, props) => ({
    selector: (...values) => formValueSelector(form)(state, ...values),
  }), (dispatch) => ({
    previousPage: () => dispatch(pageSet("PEOPLE")),
    nextPage: () => dispatch(pageSet('PERIODS')),
  })),
  reduxForm({
    form,
    destroyOnUnmount: false,
  }), 
  
)

export default enhance(FrequencyForm)