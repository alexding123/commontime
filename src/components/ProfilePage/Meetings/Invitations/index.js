import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import SplashScreen from '../../../SplashScreen'
import InstanceDisplay from './InstanceDisplay'
import RecurringDisplay from './RecurringDisplay'
import ErrorBoundary from '../../../ErrorBoundary'
import PropTypes from 'prop-types'

/**
 * Component to display all the pending invitations the user has
 */
const Invitations = ({invitations}) => {
  if (!isLoaded(invitations)) {
    return <SplashScreen/>
  }
  // avoid null values
  const filteredInvitations = invitations ? 
    Object.entries(invitations).filter(([key, invitation]) => invitation) :
    []
  // if no invitation, say so
  if (!filteredInvitations.length) {
    return <div className="mt-2">
      <p>You have no pending invitation.</p>
    </div>
  }
  return (<div className="mt-2">
    <ErrorBoundary>
    { filteredInvitations.map(([key, invitation]) => 
      invitation.type === 'recurring' ?
      <RecurringDisplay invitation={invitation} invitationID={key} key={key}/> :
      <InstanceDisplay invitation={invitation} invitationID={key} key={key}/>
    )}
    </ErrorBoundary>
  </div>)
}

Invitations.propTypes = {
  invitations: PropTypes.object,
}

const enhance = compose(
  firestoreConnect(props => [{
    collection: 'invitations',
    where: [
      ['invitee', '==', props.userId],
    ],
  }]),
  connect(state => ({
    invitations: state.firestore.data.invitations,
  })),
)

export default enhance(Invitations)