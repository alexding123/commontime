import React from 'react'
import { Button, Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { deleteException } from '../../actions/administratorActions'
import { notificationClosed } from '../../actions/notificationsActions'
import date from 'date-and-time'
import PropTypes from 'prop-types'

/** 
 * Notification prompting the user to confirm deleting an exception
 */
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

ConfirmDeleteException.propTypes = {
  /** Data to use for the notification */
  data: PropTypes.shape({
    id: PropTypes.string.isRequired,
    course: PropTypes.shape({
      date: PropTypes.string.isRequired,
      summary: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  /** Handler to confirm deleting the exception */
  confirm: PropTypes.func.isRequired,
  /** Handler to cancel deleting the exception and close the notification */
  closeNotification: PropTypes.func.isRequired,
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