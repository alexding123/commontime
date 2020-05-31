import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { notificationClosed } from '../../actions/notificationsActions'
import PropTypes from 'prop-types'

/**
 * Notification confirming that the invitation to a one-off meeting
 * has been declined 
 */
const InvitationDeclined = ({closeNotification}) => {
  return (
    <Modal
      size="lg"
      centered
      show={true}
    >
      <Modal.Body>
        <h5>Declined</h5>
        <p>You have successfully declined the invitation.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={closeNotification}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}

InvitationDeclined.propTypes ={
  /** Handler to close the notification */
  closeNotification: PropTypes.func.isRequired,
}

const enhance = compose(
  connect(null, dispatch => ({
    closeNotification: () => dispatch(notificationClosed()),
  }))
)

export default enhance(InvitationDeclined)