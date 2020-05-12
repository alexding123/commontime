import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { notificationClosed } from '../../actions/notificationsActions'

const RecurringInvitationAccepted = ({closeNotification}) => {
  return (
    <Modal
      size="lg"
      centered
      show={true}
    >
      <Modal.Body>
        <h5>Accepted</h5>
        <p>You have accepted the invitation. Events will be created in your Google Calendar to mark the weekly meeting.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={closeNotification}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}

const enhance = compose(
  connect(null, dispatch => ({
    closeNotification: () => dispatch(notificationClosed()),
  }))
)

export default enhance(RecurringInvitationAccepted)