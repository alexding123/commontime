
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import React from 'react'
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import { connect } from 'react-redux'
import Toggle from './components/Toggle'
import { compose } from 'redux'
import { Field, formValueSelector, reduxForm } from 'redux-form'
import Control from './components/Control'

const AddUserForm = ({pristine, submitting, validated, handleSubmit, selector}) => {
  return (
  <Form onSubmit={handleSubmit}>
    <Form.Group>
      <Form.Label>
        User ID
        <OverlayTrigger
          placement="right"
          overlay={
            <Tooltip>
              This is the unique number identifying the user used by the school's internal database. Student IDs are "S123456", and teacher IDs are "T123". If you're adding a system account, please use the pattern "A12". 
            </Tooltip>
          }
        >
          <Button variant="link" className="inline-icon ml-1"><HelpOutlineIcon fontSize="small"/></Button>
        </OverlayTrigger>
      </Form.Label>
      <Field name="id" component={Control}/>
    </Form.Group>
    <Form.Group>
      <Form.Label>First Name</Form.Label>
      <Field name="firstName" component={Control}/>
    </Form.Group>
    <Form.Group>
      <Form.Label>Last Name</Form.Label>
      <Field name="lastName" component={Control}/>
    </Form.Group>
    <Form.Group>
      <Form.Label>Email</Form.Label>
      <Field name="email" component={Control}/>
    </Form.Group>
    <Form.Group>
      <Form.Label>User Type</Form.Label>
      <Field 
        name="teacher" 
        component={Toggle}
        trueText="Teacher"
        falseText="Student"
      />
    </Form.Group>
    {
      !selector('teacher') ? 
      <Form.Group>
        <Form.Label>Graduation Year</Form.Label>
        <Field name="grade" component={Control} placeholder="e.g., 2021"/>
      </Form.Group>
      : null
    }
    <Button variant="primary" type="submit" disabled={pristine || submitting || !validated}>Add User</Button>
  </Form>
  )
}

const validate = (selector) => {
  return (selector('firstName') && 
  selector('id') &&
  (selector('email') && selector('email').endsWith('@commschool.org')) &&
  (selector('teacher') || (!selector('teacher') && selector('grade'))))
}

const enhance = compose(
  connect(state => {
    const form = `addUserForm`
    const selector = (...field) => formValueSelector(form)(state, ...field)
    const validated = validate(selector)
    return {
      form,
      validated,
      initialValues: {
        email: "",
        firstName: "",
        lastName: "",
        grade: "",
        id: "",
        teacher: false,
      },
      selector,
    }
  }),
  reduxForm(),
)

export default enhance(AddUserForm)