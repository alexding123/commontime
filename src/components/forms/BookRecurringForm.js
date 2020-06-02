import React from 'react'
import { Button, ButtonGroup } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import { connect } from 'react-redux'
import "react-toggle/style.css"
import { compose } from 'recompose'
import { Field, formValueSelector, reduxForm } from 'redux-form'
import { pageSet } from '../../actions/meetingPageActions'
import { defaultExcludeRooms, getFreeRecurringRooms } from '../../utils'
import Control from './components/Control'
import HybridSelect from './components/HybridSelect'
import Toggle from './components/Toggle'
import PropTypes from 'prop-types'

/**
 * Form to book a weekly, recurring meeting
 */
const BookRecurringForm = ({pristine, submitting, validated, period, isInvite, rooms, courses, recurrings, canBookPrivate, selector, handleSubmit, goDisplayPage}) => {
  // get all free weekly time slots
  const freeRooms = getFreeRecurringRooms(rooms, courses, recurrings, period)
  // sort rooms by ID
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
  return (
  <Form onSubmit={handleSubmit}>
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


BookRecurringForm.propTypes = {
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
  /** ID of the selected period for this weekly meeting */
  period: PropTypes.string.isRequired,
  /** Whether submitting the form invites the other members or simply notifies them */
  isInvite: PropTypes.bool.isRequired,
  /** All the available rooms */
  rooms: PropTypes.object.isRequired,
  /** All the courses of the school */
  courses: PropTypes.object.isRequired,
  /** All the preexisting recurring weekly meetings */
  recurrings: PropTypes.object,
  /** Whether the user is allowed to book a private meeting */
  canBookPrivate: PropTypes.bool.isRequired,
  /** Handler to navigate the user to the display page */
  goDisplayPage: PropTypes.func.isRequired,
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
    const form = `bookRecurring${props.period}Form`
    const selector = (...field) => formValueSelector(form)(state, ...field)
    const validated = validate(selector)
    return {
      form,
      selector,
      validated,
      rooms: state.firestore.data.rooms,
      courses: state.firestore.data.courses,
      recurrings: state.firestore.data.recurrings,
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

export default enhance(BookRecurringForm)