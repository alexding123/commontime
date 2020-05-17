import React from 'react'
import { Button, Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { deleteCourse } from '../../actions/administratorActions'
import { notificationClosed } from '../../actions/notificationsActions'

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