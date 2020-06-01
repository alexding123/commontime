import React from 'react'
import { Button, ButtonGroup } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import { connect } from 'react-redux'
import "react-toggle/style.css"
import { compose } from 'recompose'
import { Field, formValueSelector, reduxForm } from 'redux-form'
import { pageSet } from '../../actions/meetingPageActions'
import { defaultExcludeRooms, getFreeRooms } from '../../utils'
import Control from './components/Control'
import HybridSelect from './components/HybridSelect'
import Toggle from './components/Toggle'
import date from 'date-and-time'
import Exception from './components/Exception'
import PropTypes from 'prop-types'

/**
 * Form to book a one-off meeting
 */
const BookOneOffForm = ({pristine, submitting, validated, isInvite, rooms, instances, canBookPrivate, selector, handleSubmit, goDisplayPage, exceptions, exceptionKey}) => {
  const freeRooms = getFreeRooms(rooms, instances)
  
  // sort rooms by id
  const roomsSorted = freeRooms.sort((a, b) => {
    if (defaultExcludeRooms.includes(a.id) && defaultExcludeRooms.includes(b.id)) {
      return 0
    }
    if (defaultExcludeRooms.includes(a.id)) {
      return 1
    }
    if (defaultExcludeRooms.includes(b.id)) {
      return -1
    }
    return 0
  })

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
      <Field 
        name="useCustomRoom"
        component={Toggle}
        trueText="Custom Room"
        falseText="Classroom"
      />
      { selector('useCustomRoom') ? 
        <Field
          name="customRoomName"
          placeholder="(Optional) custom location name (i.e., Mr. Barsi's office)"
          component={Control}
        /> :
        <Field
          name="room"
          valueField='id'
          textField='name'
          data={roomsSorted}
          groupBy={room => (defaultExcludeRooms.includes(room.id) ?
            'Rare' : 'Common')
          }
          defaultMode='single'
          placeholder='Select a classroom'
          component={HybridSelect}
        />
      }
    </Form.Group>
    <Form.Group>
    
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
    <p className='text-muted'>
      { 
      isInvite ? 
      'An invitation will be sent to each attendee suggesting them to meet' :
      'An email will be sent to each attendee informing them of this meeting'
      }
    </p>
    <ButtonGroup>
      <Button disabled={pristine || submitting || !validated} type='submit'>Submit</Button>
      <Button onClick={goDisplayPage}>Return</Button>
    </ButtonGroup>
  </Form>
  )
}

BookOneOffForm.propTypes = {
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
  /** Whether submitting this form results in invitations being sent or simple notifications */
  isInvite: PropTypes.bool.isRequired,
  /** All possible rooms */
  rooms: PropTypes.object.isRequired,
  /** Any preexisting instances in the time range selected for this booking */
  instances: PropTypes.object.isRequired,
  /** Whether the user can book the meeting privately */
  canBookPrivate: PropTypes.bool.isRequired,
  /** Handler to navigate to the display page */
  goDisplayPage: PropTypes.func.isRequired,
  /** All exceptions this school year */
  exceptions: PropTypes.object,
  /** Access key to the exception in the time range selected for this booking (could map to null) */
  exceptionKey: PropTypes.string.isRequired,
}

/**
 * Validates the values of the form
 * @param {function} selector Selector of the forms
 */
const validate = (selector) => {
  if (!selector('name')) {
    return false
  }
  if (!selector('useCustomRoom')) {
    return Boolean(selector('room'))
  } else {
    return true
  }
}

const enhance = compose(
  connect((state, props) => {
    const form = `bookOneOff${props.instance.period}${props.instance.date}Form`
    const selector = (...field) => formValueSelector(form)(state, ...field)
    const validated = validate(selector)
    return {
      form,
      selector,
      validated,
      exceptions: state.firestore.data.exceptions,
      exceptionKey: date.format(date.parse(props.instance.date, 'MM/DD/YYYY'), 'MM-DD-YYYY'),
      rooms: state.firestore.data.rooms,
      instances: state.firestore.data[`bookOneOff${props.instance.period}${props.instance.date}Instances`],
    }
  }, dispatch => ({
    goDisplayPage: () => dispatch(pageSet('DISPLAY')),
  })),
  reduxForm({
    initialValues: {
      useCustomRoom: false,
      name: '',
      customRoomName: '',
      private: false,
    }
  }),
)

export default enhance(BookOneOffForm)