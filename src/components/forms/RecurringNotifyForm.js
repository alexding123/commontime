import CheckIcon from '@material-ui/icons/Check'
import CloseIcon from '@material-ui/icons/Close'
import React from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Field, formValueSelector, reduxForm } from 'redux-form'
import HybridSelect from './components/HybridSelect'
import PropTypes from 'prop-types'

/**
 * Sort an array of users by first name then last name
 * @param {Object[]} instances Array of instances to sort
 */
const sortPeople = (people) => {
  people.sort((a, b) => {
    if (a.name > b.name) return -1
    if (a.name === b.name) return 0
    return 1
  })
  return people
}

/**
 * Form to add more users to a preexisting recurring meeting and notify them
 */
const RecurringNotifyForm = ({pristine, submitting, validated, instance, invitationIDs, handleSubmit, people}) => {
  // filter null values
  const filteredPeople = people ? Object.values(people).filter(person => person) : []
  const sortedPeople = sortPeople(filteredPeople)
  return (
  <Form onSubmit={handleSubmit}>
    <Form.Group>
      <Field 
        name="people"
        valueField='id'
        textField='name'
        data={sortedPeople}
        disabled={[...instance.members, ...invitationIDs]}
        defaultMode='multi'
        component={HybridSelect}
      />
      <Form.Label className="text-muted">New members will be notified by email.</Form.Label>
    </Form.Group>
    <Row>
      <Col className="d-flex justify-content-center">
        <Button variant="link" type="submit" disabled={pristine || submitting || !validated}>
          <CheckIcon/>
        </Button>
      </Col>
      <Col className="d-flex justify-content-center">
        <Button variant="link" onClick={() => document.body.click()}>
          <CloseIcon/>
        </Button>
      </Col>
    </Row>
  </Form>
  )
}


RecurringNotifyForm.propTypes = {
  /** Whether the form has been touched */
  pristine: PropTypes.bool.isRequired,
  /** Whether the form is currently being submitted */
  submitting: PropTypes.bool.isRequired,
  /** Whether the form values are validated */
  validated: PropTypes.bool.isRequired,
  /** Handler for form submission */
  handleSubmit: PropTypes.func.isRequired,
  /** Object describing the current recurring meeting */
  instance: PropTypes.object.isRequired,
  /** All pending invitations for this meeting */
  invitationIDs: PropTypes.arrayOf(PropTypes.string).isRequired,
  /** All users in the school */
  people: PropTypes.object.isRequired,
}

/**
 * Validates the values of the form
 * @param {function} selector Selector of the forms
 * @param {Object} instance The current meeting
 */
const validate = (selector, instance) => {
  return Boolean(
    selector('people') && selector('people').filter(person => !instance.members.includes(person.id)).length
  )
}

const enhance = compose(
  connect((state, props) => {
    const form = `recurring${props.instanceID}NotifyForm`
    const selector = (...field) => formValueSelector(form)(state, ...field)
    const invitationIDs = state.firestore.data[`${props.instanceID}Invitations`] ? Object.values(state.firestore.data[`${props.instanceID}Invitations`]).filter(invitation => invitation).map(invitation => invitation.invitee) : []

    return {
      form,
      selector,
      validated: validate(selector, props.instance),
      initialValues: {
        people: [...props.instance.members, ...invitationIDs],
      },
      people: state.firestore.data.userPreset,
      invitationIDs,
    }
  }),
  reduxForm(),
)

export default enhance(RecurringNotifyForm)