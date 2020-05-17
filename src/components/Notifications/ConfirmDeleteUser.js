import React from 'react'
import { Button, Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { deleteUser } from '../../actions/administratorActions'
import { notificationClosed } from '../../actions/notificationsActions'

const ConfirmDeleteUser = ({data: {id, user}, confirm, closeNotification}) => {
  return (
    <Modal
      size="lg"
      centered
      show={true}
    >
      <Modal.Body>
        <h5>Are you sure?</h5>
        <p>By confirming, you'll be removing {`${user.name} (ID ${id})`}. You might want to email <Button variant="link" className="inline-link" href={`mailto:${user.email}`}>{`${user.email}`}</Button> to inform them first.</p>
        <p>This will delete the user's Commontime Google Calendar</p>
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
      dispatch(deleteUser(id))
      dispatch(notificationClosed())
    },
  }))
)

export default enhance(ConfirmDeleteUser)