import CheckIcon from '@material-ui/icons/Check'
import CloseIcon from '@material-ui/icons/Close'
import date from 'date-and-time'
import React from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import { connect } from 'react-redux'
import "react-toggle/style.css"
import { compose } from 'recompose'
import { Field, formValueSelector, reduxForm } from 'redux-form'
import Control from './components/Control'
import Toggle from './components/Toggle'
import Exception from './components/Exception'
import PropTypes from 'prop-types'

/**
 * Form to override a current meeting and book another
 */
const RebookRoomForm = ({pristine, submitting, handleSubmit, selector, cancelForm, validated, exceptions, exceptionKey}) => {
  // find the exception today, if there is one
  const exception = exceptions ? exceptions[exceptionKey] : null
  return (
  <Form onSubmit={handleSubmit}>
    { exception ? <Exception exception={exception}/> : null }
    <Form.Group>
      <Field 
        name="name"
        placeholder="Purpose"
        component={Control}
      />
    </Form.Group>
    <Form.Group>
      <Form.Label>
        <Field 
          name="private"
          trueText="Private"
          falseText="Public"
          component={Toggle}
        />
      </Form.Label>
      {
        selector('private') ?
        <p className='text-muted'>Other teachers can still see the meeting.</p>
        : null
      }
    </Form.Group>
    <Row>
      <Col className="d-flex justify-content-center">
        <Button variant="link" type="submit" disabled={pristine || submitting || !validated}>
          <CheckIcon/>
        </Button>
      </Col>
      <Col className="d-flex justify-content-center">
        <Button variant="link" onClick={cancelForm}>
          <CloseIcon/>
        </Button>
      </Col>
    </Row>
  </Form>
  )
}

RebookRoomForm.propTypes = {
  /** Whether the form has been touched */
  pristine: PropTypes.bool.isRequired,
  /** Whether the form is currently being submitted */
  submitting: PropTypes.bool.isRequired,
  /** Whether the form values are validated */
  validated: PropTypes.bool.isRequired,
  /** Handler for form submission */
  handleSubmit: PropTypes.func.isRequired,
  /** Selector of current form values */
  selector: PropTypes.func.isRequired,
  /** Handler to leave the form and cancel the attempt */
  cancelForm: PropTypes.func.isRequired,
  /** All exceptions this school year */
  exceptions: PropTypes.object,
  /** Access key to the exception in the time range selected for this booking (could map to null) */
  exceptionKey: PropTypes.string.isRequired,
}

const validate = (selector) => {
  return Boolean(selector('name'))
}

const enhance = compose(
  connect((state, props) => {
    const form = `rebookRoom${props.room.id}${props.date ? date.format(props.date, 'MM/DD/YYYY') : ''}Form`
    const selector = (...field) => formValueSelector(form)(state, ...field)

    return {
      form,
      exceptionKey: props.date ? date.format(props.date, 'MM-DD-YYYY') : null,
      exceptions: state.firestore.data.exceptions,
      selector,
      validated: validate(selector),
      initialValues: {
        private: false,
      }
    }
  }),
  reduxForm(),
)

export default enhance(RebookRoomForm)