import React, { lazy } from 'react'
import { connect } from 'react-redux'
import { firestoreConnect, isEmpty, isLoaded } from 'react-redux-firebase'
import { withRouter } from 'react-router-dom'
import { compose } from 'recompose'
import SplashScreen from '../SplashScreen'

const InstanceInvitation = lazy(() => import('./InstanceInvitation'))
const RecurringInvitation = lazy(() => import('./RecurringInvitation'))
const NotFoundPage = lazy(() => import('../NotFoundPage'))

const InvitationPage = ({invitations, users, invitationID, profile}) => {
  if (!isLoaded(invitations) || !isLoaded(users) || !isLoaded(profile)) {
    return <SplashScreen/>
  }

  if (isEmpty(invitations) || !invitations[invitationID]) {
    return <NotFoundPage/>
  }

  const invitation = invitations[invitationID]
  users = !isEmpty(users) ? Object.values(users) : []
  
  const creator = users.filter(user => user.id === invitation.creator)[0]
  const invitee = users.filter(user => user.id === invitation.invitee)[0]
  if (profile.id !== invitee.id) {
    return <NotFoundPage/>
  }

  if (invitation.type === 'oneOff') {
    return <InstanceInvitation creator={creator} invitee={invitee} invitationID={invitationID} instanceID={invitation.instanceID}/>
  } else {
    return <RecurringInvitation creator={creator} invitee={invitee} invitationID={invitationID} recurringID={invitation.recurringID}/>
  }
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