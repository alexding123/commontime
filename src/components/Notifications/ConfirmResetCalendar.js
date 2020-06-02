import React from 'react'
import { Button, Modal } from 'react-bootstrap'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { notificationClosed } from '../../actions/notificationsActions'
import { resetCalendar } from '../../actions/profilePageActions'
import PropTypes from 'prop-types'

/**
 * Notificaiton prompting the user to confirm resetting their calendar
 */
const ConfirmResetCalendar = ({confirm, closeNotification}) => {
  return (
    <Modal
      size="lg"
      centered
      show={true}
    >
      <Modal.Body>
        <h5>Are you sure?</h5>
        This will:
        <ol>
        <li>Delete your current Commontime calendar, if it exists</li>
        <li>Initialize a new Commontime calendar for you</li>
        </ol>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={confirm}>Confirm</Button>
        <Button onClick={closeNotification}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  )
}

ConfirmResetCalendar.propTypes = {
  /** Data to use for the notification */
  data: PropTypes.shape({
  }).isRequired,
  /** Handler to confirm resetting the calendar */
  confirm: PropTypes.func.isRequired,
  /** Handler to cancel resetting the calendar and close the notification */
  closeNotification: PropTypes.func.isRequired,
}

const enhance = compose(
  connect(state => ({
    data: state.notifications.data,
  }), (dispatch, props) => ({
    closeNotification: () => dispatch(notificationClosed()),
    confirm: () => {
      dispatch(resetCalendar())
      dispatch(notificationClosed())
    },
  }))
)

export default enhance(ConfirmResetCalendar)