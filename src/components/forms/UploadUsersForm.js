import React from 'react'
import { Button } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import { Field, reduxForm, formValueSelector } from 'redux-form'
import FileInput from './components/FileInput'
import PropTypes from 'prop-types'
import { compose } from 'recompose'
import { connect } from 'react-redux'

/**
 * Form to submit a year's users files
 */
const UploadUsersForm = ({pristine, submitting, validated, handleSubmit}) => {
  return (
  <Form onSubmit={handleSubmit}>
    <Form.Group controlId="uploadUsersForm.file">
      <Form.Label>Upload generated users file</Form.Label>
      <Field 
        name="file" 
        type="file"
        component={FileInput}
      />
    </Form.Group>
    <Button variant="primary" type="submit" disabled={pristine || submitting || !validated}>Upload</Button>
  </Form>
  )
}

UploadUsersForm.propTypes = {
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
    selector('file')
  )
}

const enhance = compose(
  connect(state => {
    const form = 'uploadUsersForm'
    const selector = (...field) => formValueSelector(form)(state, ...field)
    return {
      validated: validate(selector),
      form,
    }
    
  }),
  reduxForm()
)

export default enhance(UploadUsersForm)