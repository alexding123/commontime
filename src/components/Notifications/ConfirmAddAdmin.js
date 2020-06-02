import React from 'react'
import { Button, Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { confirmAddAdmin } from '../../actions/administratorActions'
import { notificationClosed } from '../../actions/notificationsActions'
import PropTypes from 'prop-types'

/**
 * Notification prompting the user to confirm adding another admin
 */
const ConfirmAddAdmin = ({data: {email}, confirm, closeNotification}) => {
  return (
    <Modal
      size="lg"
      centered
      show={true}
    >
      <Modal.Body>
        <h5>Are you sure?</h5>
        <p>By confirming, you'll be adding <Button variant="link" className="inline-link" href={`mailto:${email}`}>{email}</Button> as an administrator.</p>
        <p><b>This cannot be undone.</b></p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={confirm(email)}>Confirm</Button>
        <Button onClick={closeNotification}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  )
}


ConfirmAddAdmin.propTypes = {
  /** Data to use for the notification */
  data: PropTypes.shape({
    email: PropTypes.string.isRequired,
  }).isRequired,
  /** Handler to confirm adding the admin */
  confirm: PropTypes.func.isRequired,
  /** Handler to cancel adding the admin and close the notification */
  closeNotification: PropTypes.func.isRequired,
}

const enhance = compose(
  connect(state => ({
    data: state.notifications.data,
  }), dispatch => ({
    closeNotification: () => dispatch(notificationClosed()),
    confirm: (email) => () => dispatch(confirmAddAdmin(email))
  }))
)

export default enhance(ConfirmAddAdmin)