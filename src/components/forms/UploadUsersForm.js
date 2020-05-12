import React from 'react'
import { Button } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import { Field, reduxForm } from 'redux-form'

import FileInput from './components/FileInput'

let UploadUsersForm = ({pristine, submitting, handleSubmit}) => {
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
    <Button variant="primary" type="submit" disabled={pristine || submitting}>Upload</Button>
  </Form>
  )
}

UploadUsersForm = reduxForm({
  form: 'uploadUsersForm',
})(UploadUsersForm)

export default UploadUsersForm