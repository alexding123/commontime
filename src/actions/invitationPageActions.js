import { notificationSet } from './notificationsActions'
import { push } from 'connected-react-router'

export const acceptInvitation = (id) => {
  return (dispatch, getState, {getFirestore}) => {
    const db = getFirestore()
    const state = getState()
    const invitation = state.firestore.data.invitations[id]
    db.collection('invitations').doc(id).delete().then(() => {
      dispatch(push('/'))
      return db.collection('instances').doc(invitation.instanceID).update({
        members: db.FieldValue.arrayUnion(invitation.invitee),
      })
    }).then(() => {
      dispatch(notificationSet('invitationAccepted'))
    })
  }
}

export const declineInvitation = (id) => {
  return (dispatch, getState, {getFirestore}) => {
    const db = getFirestore()
    dispatch(push('/'))
    db.collection('invitations').doc(id).delete().then(() => {
      dispatch(notificationSet('invitationDeclined'))
    })
  }
}

export const acceptRecurringInvitation = (id) => {
  return (dispatch, getState, {getFirestore}) => {
    const db = getFirestore()
    const state = getState()
    const invitation = state.firestore.data.invitations[id]
    db.collection('invitations').doc(id).delete().then(() => {
      dispatch(push('/'))
      return db.collection('recurrings').doc(invitation.recurringID).update({
        members: db.FieldValue.arrayUnion(invitation.invitee),
      })
    }).then(() => {
      dispatch(notificationSet('recurringInvitationAccepted'))
    })
  }
}

export const declineRecurringInvitation = (id) => {
  return (dispatch, getState, {getFirestore}) => {
    const db = getFirestore()
    dispatch(push('/'))
    db.collection('invitations').doc(id).delete().then(() => {
      dispatch(notificationSet('recurringInvitationDeclined'))
    })
  }
}