import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { notificationClosed } from '../../actions/notificationsActions'
import PropTypes from 'prop-types'

/**
 * Notification that a new course upload has been made and that
 * the user's calendar will be populated with new events
 */
const CoursesPopulated = ({closeNotification}) => {
  return (
    <Modal
      size="lg"
      centered
      show={true}
    >
      <Modal.Body>
        <h5>New year, new calendar</h5>
        <p>An administrator has updated the course catalog. Usually, this means that we're starting a new year of school! Over the next few minutes, we'll populate your Commontime Google Calendar with the courses that you're enrolled in.</p>
        <p>You can simply unsubscribe from this calendar using Google's interface. If you change your mind, you can resubscribe to the Calendar in your profile page. </p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={closeNotification}>Got It</Button>
      </Modal.Footer>
    </Modal>
  )
}

CoursesPopulated.propTypes = {
  /** Handler to cancel deleting the exception and close the notification */
  closeNotification: PropTypes.func.isRequired,
}

const enhance = compose(
  connect(null, dispatch => ({
    closeNotification: () => dispatch(notificationClosed()),
  }))
)

export default enhance(CoursesPopulated)