import CheckIcon from '@material-ui/icons/Check'
import CloseIcon from '@material-ui/icons/Close'
import date from 'date-and-time'
import React from 'react'
import { Button, Col, Row, Alert } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import { connect } from 'react-redux'
import "react-toggle/style.css"
import { compose } from 'recompose'
import { Field, formValueSelector, reduxForm } from 'redux-form'
import Control from './components/Control'
import Toggle from './components/Toggle'
import Exception from './components/Exception'

let BookRoomForm = ({pristine, submitting, canBookPrivate, handleSubmit, cancelForm, validated, selector, exceptions, exceptionKey}) => {
  const exception = exceptions ? exceptions[exceptionKey] : null
  return (
  <Form onSubmit={handleSubmit}>
    { exception ? 
      <Exception exception={exception}/> : null
    }
    <Form.Group>
      <Field 
        name="name"
        placeholder="Purpose"
        component={Control}
      />
    </Form.Group>
    { canBookPrivate ? 
      <Form.Group>
        <Field 
          name="private"
          trueText="Private"
          falseText="Public"
          component={Toggle}
        />
        {
          selector('private') ?
          <p className='text-muted'>Other teachers can still see the meeting.</p>
          : null
        }
      </Form.Group> :
      null
    }
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



const validate = (selector) => {
  return selector('name')
}

const enhance = compose(
  connect((state, props) => {
    const form = `bookRoom${props.room.id}${props.date ? date.format(props.date, 'MM/DD/YYYY') : ''}Form`
    const selector = (...field) => formValueSelector(form)(state, ...field)

    return {
      form,
      exceptionKey: props.date ? date.format(props.date, 'MM-DD-YYYY') : null,
      exceptions: state.firestore.data.exceptions,
      validated: validate(selector),
      selector,
      initialValues: {
        private: false,
      }
    }
  }),
  reduxForm(),
)

export default enhance(BookRoomForm)