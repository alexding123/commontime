
import React from 'react'
import { Button } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import { connect } from 'react-redux'
import { Field, formValueSelector, reduxForm } from 'redux-form'
import Check from './components/Check'
import { compose } from 'recompose'
import PropTypes from 'prop-types'

/**
 * Form to update the user settings
 */
const ProfileForm = ({pristine, submitting, handleSubmit}) => {
  return (
  <Form onSubmit={handleSubmit}>
    <Form.Group>
      <Field name="email" component={Check} type="checkbox" label="Send me email notifications (such as new meetings I'm added to)"/>
    </Form.Group>
    <Button variant="primary" type="submit" disabled={pristine || submitting}>Update Profile</Button>
  </Form>
  )
}

ProfileForm.propTypes = {
  /** Whether the form has been touched */
  pristine: PropTypes.bool.isRequired,
  /** Whether the form is currently being submitted */
  submitting: PropTypes.bool.isRequired,
  /** Handler for form submission */
  handleSubmit: PropTypes.func.isRequired,
}

const enhance = compose(
  connect((state, props) => {
    const form = `profileForm`
    const selector = (...field) => formValueSelector(form)(state, ...field)

    return {
      form,
      selector,
      enableReinitialize: true,
    }
  }),
  reduxForm(),
)

export default enhance(ProfileForm)