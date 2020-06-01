
import React from 'react'
import { Button, ButtonGroup } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import { Field, formValueSelector, reduxForm } from 'redux-form'
import { compose } from 'redux'
import Control from './components/Control'
import { connect } from 'react-redux'
import date from 'date-and-time'
import PropTypes from 'prop-types'

/**
 * Form to edit an exception
 */
const EditExcpetionForm = ({pristine, submitting, validated, handleSubmit}) => {
  return (
  <Form onSubmit={handleSubmit}>
    <Form.Group>
      <Form.Label>Date</Form.Label>
      <Field name="date" component={Control} disabled={true}/>
    </Form.Group>
    <Form.Group>
      <Form.Label>One-Line Summary</Form.Label>
      <Field name="summary" component={Control}/>
    </Form.Group>
    <Form.Group>
      <Form.Label>
        Description
      </Form.Label>
      <Field name="description" as="textarea" rows="16" component={Control}/>
    </Form.Group>
    
    <ButtonGroup>
      <Button variant="primary" type="submit" disabled={pristine || submitting || !validated}>Save</Button>
      <Button variant="primary" href="/Administrator/Exceptions">Cancel</Button>
    </ButtonGroup>
  </Form>
  )
}

EditExcpetionForm.propTypes = {
  /** Whether the form has been touched */
  pristine: PropTypes.bool.isRequired,
  /** Whether the form is currently being submitted */
  submitting: PropTypes.bool.isRequired,
  /** Whether the form values are validated */
  validated: PropTypes.bool.isRequired,
  /** Handler for form submission */
  handleSubmit: PropTypes.func.isRequired,
}

/**
 * Validates the values of the form
 * @param {function} selector Selector of the forms
 */
const validate = (selector) => {
  return Boolean(selector('date') && 
  selector('summary') &&
  selector('description'))
}

const enhance = compose(
  connect((state, props) => {
    const form = `editExcpetionForm`
    const selector = (...field) => formValueSelector(form)(state, ...field)
    const validated = validate(selector)
    return {
      form,
      validated,
      initialValues: {
        ...props.exception,
        date: date.format(date.parse(props.exception.date, 'MM/DD/YYYY'), 'MMMM DD, YYYY'),
      }
    }
  }),
  reduxForm(),
)

export default enhance(EditExcpetionForm)