import React from 'react'
import { Button, ButtonGroup } from 'react-bootstrap'
import { connect } from 'react-redux'
import { firestoreConnect, isEmpty, isLoaded } from 'react-redux-firebase'
import { compose } from 'recompose'
import { acceptRecurringInvitation, declineRecurringInvitation } from '../../actions/invitationPageActions'
import { dayMap } from '../../utils'
import NotFoundPage from '../NotFoundPage'
import SplashScreen from '../SplashScreen'
import PropTypes from 'prop-types'

/**
 * Component to display an invitation to a recurring meeting
 */
const RecurringInvitation = ({creator, invitee, recurringID, periods, rooms, recurrings, handleAccept, handleDecline}) => {
  if (!isLoaded(periods) || !isLoaded(rooms) || !isLoaded(recurrings)) {
    return <SplashScreen/>
  }

  // if the meeting pointed to by the invitation is not found, display 404
  if (isEmpty(recurrings) || !recurrings[recurringID]) {
    return <NotFoundPage/>
  }

  const recurring = recurrings[recurringID]
  const period = periods[recurring.period] ? periods[recurring.period] : {}
  const room = recurring.room ?
    (rooms[recurring.room] ? rooms[recurring.room] : {}) :
    { name: recurring.roomName }
  return (<div className="main text-center">
    <h3>Invitation</h3>
    <p>{`${creator.name} has invited you, ${invitee.name}, to a weekly meeting on ${dayMap[period.day]} ${period.name}${
      room.name ? `, in ${room.name}` : null
    }, for ${recurring.name}.`}</p>
    <ButtonGroup>
      <Button onClick={handleAccept} variant="success">Accept</Button>
      <Button onClick={handleDecline} variant="danger">Decline</Button>
    </ButtonGroup>
  </div>)
}

RecurringInvitation.propTypes = {
  /** Creator of the invitation */
  creator: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  /** User invited to the meeting */
  invitee: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired,
  /** ID of the recurring meeting pointed to by the invitation */
  recurringID: PropTypes.string.isRequired,
  periods: PropTypes.object,
  rooms: PropTypes.object,
  recurrings: PropTypes.object,
  /** Handler for accepting the invitation */
  handleAccept: PropTypes.func.isRequired,
  /** Handler for declining the invitation */
  handleDecline: PropTypes.func.isRequired,
}

const enhance = compose(
  connect((state, props) => ({
    periods: state.firestore.data.periods,
    rooms: state.firestore.data.rooms,
    recurrings: state.firestore.data.recurrings,
  }), (dispatch, props) => ({
    handleAccept: () => dispatch(acceptRecurringInvitation(props.invitationID)),
    handleDecline: () => dispatch(declineRecurringInvitation(props.invitationID)),
  })),
  firestoreConnect(props => [
    { collection: 'periods' },
    { collection: 'rooms '},
    { collection: 'recurrings', doc: props.recurringID },
  ]),
)

export default enhance(RecurringInvitation)