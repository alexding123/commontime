import React from 'react'
import { Button, Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { deleteCourse } from '../../actions/administratorActions'
import { notificationClosed } from '../../actions/notificationsActions'
import PropTypes from 'prop-types'

/**
 * Notification prompting the user to confirm deleting a course
 */
const ConfirmDeleteCourse = ({data: {id, course}, confirm, closeNotification}) => {
  return (
    <Modal
      size="lg"
      centered
      show={true}
    >
      <Modal.Body>
        <h5>Are you sure?</h5>
        <p>By confirming, you'll be deleting {`${course.name} Section ${course.section} (ID ${id}).`}.</p>
        <p>This will remove all associated Google Calendar events for the course members.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={confirm(id)}>Confirm</Button>
        <Button onClick={closeNotification}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  )
}


ConfirmDeleteCourse.propTypes = {
  /** Data to use for the notification */
  data: PropTypes.shape({
    id: PropTypes.string.isRequired,
    course: PropTypes.shape({
      name: PropTypes.string.isRequired,
      section: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  /** Handler to confirm deleting the course */
  confirm: PropTypes.func.isRequired,
  /** Handler to cancel deleting the course and close the notification */
  closeNotification: PropTypes.func.isRequired,
}

const enhance = compose(
  connect(state => ({
    data: state.notifications.data,
  }), (dispatch, props) => ({
    closeNotification: () => dispatch(notificationClosed()),
    confirm: (id) => () => {
      dispatch(deleteCourse(id))
      dispatch(notificationClosed())
    },
  }))
)

export default enhance(ConfirmDeleteCourse)