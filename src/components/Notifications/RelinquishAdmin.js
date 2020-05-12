import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { notificationClosed } from '../../actions/notificationsActions'
import { relinquishAdmin } from '../../actions/administratorActions'

const RelinquishAdmin = ({confirm, closeNotification}) => {
  return (
    <Modal
      size="lg"
      centered
      show={true}
    >
      <Modal.Body>
        <h5>Are you sure?</h5>
        <p>All your administrator privileges will be removed from the system, including access to this particular webpage. Only another administrator may restore them. </p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={confirm}>Confirm</Button>
        <Button onClick={closeNotification}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}

const enhance = compose(
  connect(null, dispatch => ({
    confirm: () => {
      dispatch(relinquishAdmin())
      dispatch(notificationClosed())
    },
    closeNotification: () => dispatch(notificationClosed()),
  }))
)

export default enhance(RelinquishAdmin)