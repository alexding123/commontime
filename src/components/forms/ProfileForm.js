
import React from 'react'
import { Button } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import { connect } from 'react-redux'
import { Field, formValueSelector, reduxForm } from 'redux-form'
import Check from './components/Check'

let ProfileForm = ({pristine, submitting, validated, handleSubmit}) => {
  return (
  <Form onSubmit={handleSubmit}>
    <Form.Group>
      <Field name="email" component={Check} type="checkbox" label="Send me email notifications (such as new meetings I'm added to)"/>
    </Form.Group>
    <Button variant="primary" type="submit" disabled={pristine || submitting || !validated}>Update Profile</Button>
  </Form>
  )
}

ProfileForm = reduxForm({
  form: 'profileForm',
})(ProfileForm)

const selector = formValueSelector('profileForm') // <-- same as form name
ProfileForm = connect((state, props) => {
  // can select values individually
  const email = selector(state, 'email')
  const validated = email !== props.isNewsletterSubscribe
  return {
    validated,
    enableReinitialize: true,
  }
})(ProfileForm)

export default ProfileForm