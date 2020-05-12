import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { notificationClosed } from '../../actions/notificationsActions'

const FirstTimeLogin = ({closeNotification}) => {
  return (
    <Modal
      size="lg"
      centered
      show={true}
    >
      <Modal.Body>
        <h5>Looks like it's your first time signing in</h5>
        <p>Over the next minutes, we'll be creating a Google Calendar for your account. It'll contain all your classes and the meetings that you're attending. </p>
        <p>You can simply unsubscribe from this calendar using Google's interface. If you change your mind, you can resubscribe to the Calendar in your profile page. </p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={closeNotification}>Got It</Button>
      </Modal.Footer>
    </Modal>
  )
}

const enhance = compose(
  connect(null, dispatch => ({
    closeNotification: () => dispatch(notificationClosed()),
  }))
)

export default enhance(FirstTimeLogin)