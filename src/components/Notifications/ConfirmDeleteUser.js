import React from 'react'
import { Button, Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { deleteUser } from '../../actions/administratorActions'
import { notificationClosed } from '../../actions/notificationsActions'
import PropTypes from 'prop-types'

/**
 * Notificaiton prompting the user to confirm deleting a user record
 */
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

ConfirmDeleteUser.propTypes = {
  /** Data to use for the notification */
  data: PropTypes.shape({
    id: PropTypes.string.isRequired,
    user: PropTypes.shape({
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  /** Handler to confirm deleting the user */
  confirm: PropTypes.func.isRequired,
  /** Handler to cancel deleting the user and close the notification */
  closeNotification: PropTypes.func.isRequired,
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