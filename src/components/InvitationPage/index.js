import React, { lazy } from 'react'
import { connect } from 'react-redux'
import { firestoreConnect, isEmpty, isLoaded } from 'react-redux-firebase'
import { withRouter } from 'react-router-dom'
import { compose } from 'recompose'
import SplashScreen from '../SplashScreen'
import PropTypes from 'prop-types'

const InstanceInvitation = lazy(() => import('./InstanceInvitation'))
const RecurringInvitation = lazy(() => import('./RecurringInvitation'))
const NotFoundPage = lazy(() => import('../NotFoundPage'))

/**
 * Page to display a given invitation, allowing the current user
 * to accept or decline it
 */
const InvitationPage = ({invitations, users, invitationID, profile}) => {
  if (!isLoaded(invitations) || !isLoaded(users) || !isLoaded(profile)) {
    return <SplashScreen/>
  }

  // if the invitationID is invalid, display 404
  if (isEmpty(invitations) || !invitations[invitationID]) {
    return <NotFoundPage/>
  }

  const invitation = invitations[invitationID]
  const allUsers = !isEmpty(users) ? Object.values(users) : []
  
  const creator = allUsers.filter(user => user.id === invitation.creator)[0]
  const invitee = allUsers.filter(user => user.id === invitation.invitee)[0]

  // if current user is not the invitee, display 404
  if (profile.id !== invitee.id) {
    return <NotFoundPage/>
  }

  // display one-off or recurring invitation as the type dictates
  if (invitation.type === 'oneOff') {
    return <InstanceInvitation creator={creator} invitee={invitee} invitationID={invitationID} instanceID={invitation.instanceID}/>
  } else {
    return <RecurringInvitation creator={creator} invitee={invitee} invitationID={invitationID} recurringID={invitation.recurringID}/>
  }
}

InvitationPage.propTypes = {
  invitations: PropTypes.object,
  users: PropTypes.object,
  /** ID of the invitation, provided in the URL */
  invitationID: PropTypes.string.isRequired,
  profile: PropTypes.object,
}

const enhance = compose(
  withRouter,
  connect((state, props) => ({
    profile: state.firebase.profile,
    users: state.firestore.data.userPreset,
    invitations: state.firestore.data.invitations,
    invitationID: props.match.params.id,
  }), dispatch => ({
  })),
  firestoreConnect(props => [
    { collection: 'userPreset' },
    { collection: 'invitations', doc: props.invitationID },
  ]),
)

export default enhance(InvitationPage)