import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { notificationClosed } from '../../actions/notificationsActions'
import PropTypes from 'prop-types'

/**
 * Notification confirming that the invitation to a recurring meeting
 * has been accepted
 */
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

RecurringInvitationAccepted.propTypes = {
  /** Handler to close the notification */
  closeNotification: PropTypes.func.isRequired,
}

const enhance = compose(
  connect(null, dispatch => ({
    closeNotification: () => dispatch(notificationClosed()),
  }))
)

export default enhance(RecurringInvitationAccepted)