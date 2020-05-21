import CheckIcon from '@material-ui/icons/Check'
import CloseIcon from '@material-ui/icons/Close'
import React from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import { connect } from 'react-redux'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import { compose } from 'recompose'
import { Field, formValueSelector, reduxForm } from 'redux-form'
import SplashScreen from '../SplashScreen'
import HybridSelect from './components/HybridSelect'
import date from 'date-and-time'
import Exception from './components/Exception'

const OneoffInviteForm = ({pristine, submitting, validated, instance, invitationIDs, handleSubmit, people, exceptions, exceptionKey}) => {
  if (!isLoaded(people)) {
    return <SplashScreen/>
  }
  const filteredPeople = people ? Object.values(people).filter(person => person) : []
  const exception = exceptions ? exceptions[exceptionKey] : null
  return (
  <Form onSubmit={handleSubmit}>
    { exception ? <Exception exception={exception}/> : null}
    <Form.Group>
      <Field 
        name="people"
        valueField='id'
        textField='name'
        data={filteredPeople}
        disabled={[...instance.members, ...invitationIDs]}
        defaultMode='multi'
        component={HybridSelect}
      />
      <Form.Label className="text-muted">Invitations will be sent out by email.</Form.Label>
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



const validate = (instance, selector) => {
  return selector('people') && selector('people').filter(person => !instance.members.includes(person.id)).length
}

const enhance = compose(
  firestoreConnect((props) => [{
    collection: 'userPreset'
  }]),
  connect((state, props) => {
    const form = `oneoff${props.instanceID}InviteForm`
    const selector = (...field) => formValueSelector(form)(state, ...field)
    const invitationIDs = state.firestore.data[`${props.instanceID}Invitations`] ? Object.values(state.firestore.data[`${props.instanceID}Invitations`]).filter(invitation => invitation).map(invitation => invitation.invitee) : []

    return {
      form,
      selector,
      validated: validate(props.instance, selector),
      initialValues: {
        people: [...props.instance.members, ...invitationIDs],
      },
      people: state.firestore.data.userPreset,
      invitationIDs,
      exceptions: state.firestore.data.exceptions,
      exceptionKey: date.format(date.parse(props.instance.date, 'MM/DD/YYYY'), 'MM-DD-YYYY')
    }
  }),
  reduxForm(),
)

export default enhance(OneoffInviteForm)