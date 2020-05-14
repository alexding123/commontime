
import React from 'react'
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import { Field, formValueSelector, reduxForm } from 'redux-form'
import { compose } from 'redux'
import Control from './components/Control'
import { connect } from 'react-redux'
import Check from './components/Check'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import HybridSelect from './components/HybridSelect'

const AddCourseForm = ({courses, periods, rooms, users, pristine, submitting, validated, handleSubmit}) => {
  users = users ? Object.values(users) : []
  const teachers = users.filter(user => user && user.teacher)
  return (
  <Form onSubmit={handleSubmit}>
    <Form.Group>
      <Form.Label>Course Name</Form.Label>
      <Field name="name" component={Control}/>
    </Form.Group>
    <Form.Group>
      <Form.Label>
        Course ID
        <OverlayTrigger
          placement="right"
          overlay={
            <Tooltip>
              This is the unique ID identifying the course (but not the section). For example, English 9's ID is 101. 
            </Tooltip>
          }
        >
          <Button variant="link" className="inline-icon ml-1"><HelpOutlineIcon fontSize="small"/></Button>
        </OverlayTrigger>
      </Form.Label>
      <Field name="course" component={Control}/>
    </Form.Group>
    <Form.Group>
      <Form.Label>
        Section Number
        <OverlayTrigger
          placement="right"
          overlay={
            <Tooltip>
              This is the unique number identifying the course section. For example, English 9 can have 3 sections, and this might be section 2. 
            </Tooltip>
          }
        >
          <Button variant="link" className="inline-icon ml-1"><HelpOutlineIcon fontSize="small"/></Button>
        </OverlayTrigger>
      </Form.Label>
      <Field name="section" component={Control}/>
    </Form.Group>
    <Form.Group>
      <Form.Label>Department (optional)</Form.Label>
      <Field name="department" component={Control}/>
    </Form.Group>
    <Form.Group>
      <Form.Label>Academic Quarters during which the Course Meets:</Form.Label>
      <Field name="fallTerm" component={Check} type="checkbox" label="Fall"/>
      <Field name="winterTerm" component={Check} type="checkbox" label="Winter"/>
      <Field name="springTerm" component={Check} type="checkbox" label="Spring"/>
    </Form.Group>
    <Form.Group>
      <Form.Label>Teacher</Form.Label>
      <Field
        name="teacher"
        valueField='id'
        textField='name'
        data={teachers}
        defaultMode='single'
        placeholder='Select a teacher'
        component={HybridSelect}
      />
    </Form.Group>
    
    <Button variant="primary" type="submit" disabled={pristine || submitting || !validated}>Add Administrator</Button>
  </Form>
  )
}

const validate = (selector) => {
  return selector('email') && selector('email').endsWith('@commschool.org')
}

const enhance = compose(
  connect(state => {
    const form = `addCourseForm`
    const selector = (...field) => formValueSelector(form)(state, ...field)
    const validated = validate(selector)
    return {
      form,
      validated,
      courses: state.firestore.data.courses,
      periods: state.firestore.data.periods,
      rooms: state.firestore.data.rooms,
      users: state.firestore.data.userPreset,
      initialValues: {
        name: "",
        course: "",
        section: "",
        department: "",
        fallTerm: true,
        winterTerm: true,
        springTerm: true,
      }
    }
  }),
  reduxForm(),
)

export default enhance(AddCourseForm)