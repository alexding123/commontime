import React from 'react'
import { Button, Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { deleteException } from '../../actions/administratorActions'
import { notificationClosed } from '../../actions/notificationsActions'
import date from 'date-and-time'

const ConfirmDeleteException = ({data: {id, exception}, confirm, closeNotification}) => {
  return (
    <Modal
      size="lg"
      centered
      show={true}
    >
      <Modal.Body>
        <h5>Are you sure?</h5>
        <p>By confirming, you'll be deleting an exception on {`${date.format(date.parse(exception.date, 'MM/DD/YYYY'), 'MMMM DD, YYYY')}: ${exception.summary}`}.</p>
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
      dispatch(deleteException(id))
      dispatch(notificationClosed())
    },
  }))
)

export default enhance(ConfirmDeleteException)