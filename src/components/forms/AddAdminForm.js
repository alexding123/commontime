
import React from 'react'
import { Button } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import { Field, formValueSelector, reduxForm } from 'redux-form'
import { compose } from 'redux'
import Control from './components/Control'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

/**
 * Form to add a new administrator
 */
const AddAdminForm = ({pristine, submitting, validated, handleSubmit}) => {
  return (
  <Form onSubmit={handleSubmit}>
    <Form.Group>
      <Form.Label>Email</Form.Label>
      <Field name="email" component={Control} type="email" placeholder="example@commschool.org"/>
    </Form.Group>
    <Button variant="primary" type="submit" disabled={pristine || submitting || !validated}>Add Administrator</Button>
  </Form>
  )
}

AddAdminForm.propTypes = {
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
  return Boolean(
    selector('email') && 
    selector('email').endsWith('@commschool.org')
  )
}

const enhance = compose(
  connect(state => {
    const form = `addAdminForm`
    const selector = (...field) => formValueSelector(form)(state, ...field)
    const validated = validate(selector)
    return {
      form,
      validated,
    }
  }),
  reduxForm(),
)

export default enhance(AddAdminForm)