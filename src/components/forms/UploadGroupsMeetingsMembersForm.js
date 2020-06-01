import React from 'react'
import { Button } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import { Field, formValueSelector, reduxForm } from 'redux-form'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import DatePicker from './components/DatePicker'
import FileInput from './components/FileInput'
import PropTypes from 'prop-types'

/**
 * Form to submit a year's course files
 */
const UploadGroupsMeetingsMembersForm = ({pristine, submitting, validated, handleSubmit}) => {
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

UploadGroupsMeetingsMembersForm.propTypes = {
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
    selector('groupsFile') && 
    selector('meetingsFile') && 
    selector('membersFile') && 
    selector('fallStart') && 
    selector('fallEnd') && 
    selector('winterStart') &&
    selector('winterEnd') &&
    selector('springStart') &&
    selector('springEnd') &&
    selector('daylightStart') &&
    selector('daylightEnd')
  )
}

const enhance = compose(
  connect(state => {
    const form = 'uploadGroupsMeetingsMembersForm'
    const selector = (...field) => formValueSelector(form)(state, ...field)
    return {
      validated: validate(selector),
      form,
    }
    
  }),
  reduxForm()
)

export default enhance(UploadGroupsMeetingsMembersForm)