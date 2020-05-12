import React from 'react'
import { Button } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import { Field, formValueSelector, reduxForm } from 'redux-form'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import DatePicker from './components/DatePicker'
import FileInput from './components/FileInput'

let UploadGroupsMeetingsMembersForm = ({pristine, submitting, validated, handleSubmit}) => {
  return (
  <Form style={{maxWidth: '500px'}} onSubmit={handleSubmit}>
    <Form.Group>
      <Form.Label>Upload generated groups file</Form.Label>
      <Field 
        name="groupsFile" 
        type="file"
        component={FileInput}
      />
    </Form.Group>
    <Form.Group>
      <Form.Label>Upload generated meetings file</Form.Label>
      <Field 
        name="meetingsFile" 
        type="file"
        component={FileInput}
      />
    </Form.Group>
    <Form.Group>
      <Form.Label>Upload generated members file</Form.Label>
      <Field 
        name="membersFile" 
        type="file"
        component={FileInput}
      />
    </Form.Group>
    <Form.Group>
      <Form.Label>Fall Quarter (start - end)</Form.Label>
      <Field
        name="fallStart"
        showTime={false}
        component={DatePicker}
      />
      <Field
        name="fallEnd"
        showTime={false}
        component={DatePicker}
      />
    </Form.Group>
    <Form.Group>
      <Form.Label>Winter Quarter (start - end)</Form.Label>
      <Field
        name="winterStart"
        showTime={false}
        component={DatePicker}
      />
      <Field
        name="winterEnd"
        showTime={false}
        component={DatePicker}
      />
    </Form.Group>

    <Form.Group>
      <Form.Label>Spring Quarter (start - end)</Form.Label>
      <Field
        name="springStart"
        showTime={false}
        component={DatePicker}
      />
      <Field
        name="springEnd"
        showTime={false}
        component={DatePicker}
      />
    </Form.Group>

    <Form.Group>
      <Form.Label>This Year's Daylight Saving Time End Date</Form.Label>
      <Field
        name="daylightEnd"
        showTime={false}
        component={DatePicker}
      />
    </Form.Group>

    <Form.Group>
      <Form.Label>Next Year's Daylight Saving Time Start Date</Form.Label>
      <Field
        name="daylightStart"
        showTime={false}
        component={DatePicker}
      />
    </Form.Group>
    
    <Button variant="primary" type="submit" disabled={pristine || submitting || !validated}>Upload</Button>
  </Form>
  )
}

UploadGroupsMeetingsMembersForm = reduxForm({
  form: 'uploadGroupsMeetingsMembersForm',
})(UploadGroupsMeetingsMembersForm)

const selector = formValueSelector('uploadGroupsMeetingsMembersForm')

const validate = (state) => {
  const groupsFile = selector(state, 'groupsFile')
  const meetingsFile = selector(state, 'meetingsFile')
  const membersFile = selector(state, 'membersFile')
  const fallStart = selector(state, 'fallStart')
  const fallEnd = selector(state, 'fallEnd')
  const winterStart = selector(state, 'winterStart')
  const winterEnd = selector(state, 'winterEnd')
  const springStart = selector(state, 'springStart')
  const springEnd = selector(state, 'springEnd')
  const daylightStart = selector(state, 'daylightStart')
  const daylightEnd = selector(state, 'daylightEnd')
  return groupsFile && meetingsFile && membersFile && 
    fallStart && fallEnd && winterStart && winterEnd && springStart && springEnd &&
    daylightStart && daylightEnd
  }

const enhance = compose(
  connect(state => ({
    validated: validate(state),
  }))
)

export default enhance(UploadGroupsMeetingsMembersForm)