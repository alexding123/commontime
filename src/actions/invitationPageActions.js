import { notificationSet } from './notificationsActions'
import { push } from 'connected-react-router'

/**
 * Accepts a one-off invitation by ID, adding the invitee as a member
 * of the event and removing the invitation
 * @param {string} id ID of the invitation to be accepted
 */
export const acceptInvitation = (id) => {
  return (dispatch, getState, {getFirestore}) => {
    const db = getFirestore()
    const state = getState()
    const invitation = state.firestore.data.invitations[id]
    // delete invitation
    db.collection('invitations').doc(id).delete().then(() => {
      // have to reroute to homepage first so that the notification will
      // show on the homepage
      dispatch(push('/'))
      // add invitee as member of the instance
      return db.collection('instances').doc(invitation.instanceID).update({
        members: db.FieldValue.arrayUnion(invitation.invitee),
      })
    }).then(() => {
      dispatch(notificationSet('invitationAccepted'))
    })
  }
}

/**
 * Declines a one-off invitation by ID
 * @param {string} id ID of the invitation
 */
export const declineInvitation = (id) => {
  return (dispatch, getState, {getFirestore}) => {
    const db = getFirestore()
    // reroute to homepage
    dispatch(push('/'))
    db.collection('invitations').doc(id).delete().then(() => {
      dispatch(notificationSet('invitationDeclined'))
    })
  }
}

/**
 * Accepts a recurring invitation by ID, adding the invitee
 * as a member of the recurring meeting and removing the invitation
 * @param {string} id ID of the invitation 
 */
export const acceptRecurringInvitation = (id) => {
  return (dispatch, getState, {getFirestore}) => {
    const db = getFirestore()
    const state = getState()
    const invitation = state.firestore.data.invitations[id]
    // delete invitation
    db.collection('invitations').doc(id).delete().then(() => {
      // have to push first so that notification displays on homepage
      dispatch(push('/'))
      // add user as member of the recurring meeting
      return db.collection('recurrings').doc(invitation.recurringID).update({
        members: db.FieldValue.arrayUnion(invitation.invitee),
      })
    }).then(() => {
      dispatch(notificationSet('recurringInvitationAccepted'))
    })
  }
}

/**
 * Declines an invitation by ID
 * @param {string} id Id of the invitation
 */
export const declineRecurringInvitation = (id) => {
  return (dispatch, getState, {getFirestore}) => {
    const db = getFirestore()
    // push to homepage after invitation is deleted
    dispatch(push('/'))
    db.collection('invitations').doc(id).delete().then(() => {
      dispatch(notificationSet('recurringInvitationDeclined'))
    })
  }
}