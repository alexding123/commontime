import { push } from "connected-react-router"
import { reset, startSubmit, stopSubmit } from "redux-form"
import { getPeriodTimes } from "../selectors"
import { notificationSet } from "./notificationsActions"

export const PAGE_SET = 'PAGE_SET'
/**
 * Navigates to a particular subpage of the meeting form
 * @param {string} value Name of the page to navigate to
 */
export const pageSet = (value) => {
  return {
    type: PAGE_SET,
    data: value,
  }
}

export const SCHEDULE_MEETING_SETUP_SAVED = 'SCHEDULE_MEETING_SETUP_SAVED'
/**
 * Updates the search parameters based on the meeting form values
 * @param {Object} values Meeting form values
 */
export const scheduleMeetingSetupSaved = (values) => ({
  type: SCHEDULE_MEETING_SETUP_SAVED,
  data: values,
})

export const ONEOFF_INSTANCE_SELECTED = 'ONEOFF_INSTANCE_SELECTED'
/**
 * Selects a particular one-off meeting slot and navigates
 * the user to a booking page for that slot
 * @param {Object} instance Object describing the meeting slot
 */
export const oneoffInstanceSelected = (instance) => ({
  type: ONEOFF_INSTANCE_SELECTED,
  data: instance
})

export const PERIOD_SELECTED = 'PERIOD_SELECTED'
/**
 * Selects a particular recurring meeting slot (period) and
 * navigates the user to a booking page for the slot
 * @param {*} period Object describing the period
 */
export const periodSelected = (period) => ({
  type: PERIOD_SELECTED,
  data: period
})

/**
 * Adds a meeting and invites users to it
 * @param {Object} instance Object describing the partiuclar time & room slot of the meeting 
 * @param {Object} values Form values describing the meeting
 */
export const addInstanceAndInvite = (instance, values) => { 
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const form = `bookOneOff${instance.period}${instance.date}Form`
    dispatch(startSubmit(form))
    const state = getState()
    const profile = state.firebase.profile
    // get start and end time corresponding to the particular period
    const { startDate, endDate } = getPeriodTimes(state, instance.date, instance.period)
    const db = getFirestore()
    // add the meeting
    db.collection('instances').add({
      creator: profile.id,
      date: instance.date,
      members: [profile.id],
      startDate,
      endDate,
      name: values.name,
      period: instance.period,
      private: values.private ? values.private : false,
      room: values.useCustomRoom ? '' : values.room.id,
      type: 'event',
      roomName: values.useCustomRoom ? values.customRoomName : null,
    }).then(doc => {
      // invite the members one by one
      const promises = state.meetingPage.people.map(person => {
        if (person.id === profile.id) return Promise.resolve()
        return db.collection('invitations').add({
          instanceID: doc.id,
          creator: profile.id,
          invitee: person.id,
          type: 'oneOff',
        })
      })
      return Promise.all(promises)
    }).then(() => {
      dispatch(notificationSet('bookOneOffInviteSuccess', {
        useCustomRoom: values.useCustomRoom,
        room: values.useCustomRoom ? '' : values.room.id,
        customRoomName: values.customRoomName,
        period: instance.period,
        date: instance.date,
        people: state.meetingPage.people.map(person => person.id),
        name: values.name,
      }))
      // reset the form in case user books again
      dispatch(reset("scheduleMeetingSetupForm"))
      // resets the meeting filters form
      dispatch(pageSet("PEOPLE"))
      dispatch(push("/Meet"))
      dispatch(stopSubmit(form))
    })
  }
}

/**
 * Adds a meeting and notifies its members
 * @param {Object} instance Object describing the room and time slot of the meeting
 * @param {Object[]} people Users to add to the meeting
 * @param {Object} values Form values describing the meeting
 */
export const addInstanceAndNotify = (instance, people, values) => { 
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const form = `bookOneOff${instance.period}${instance.date}Form`
    dispatch(startSubmit(form))
    const firebase = getFirebase()
    const state = getState()
    const profile = state.firebase.profile
    // get the start and end time of the meeting
    const { startDate, endDate } = getPeriodTimes(state, instance.date, instance.period)
    const db = getFirestore()
    // add the meeting
    db.collection('instances').add({
      creator: profile.id,
      date: instance.date,
      members: people.map(person => person.id),
      startDate,
      endDate,
      name: values.name,
      period: instance.period,
      private: values.private ? values.private : false,
      room: values.useCustomRoom ? '' : values.room.id,
      type: 'event',
      roomName: values.useCustomRoom ? values.customRoomName : null,
    }).then(doc => {
      // add each member and notify them
      const promises = state.meetingPage.people.map(person => {
        if (person.id === profile.id) return Promise.resolve()
        const emailMeetingScheduled = firebase.functions().httpsCallable('emails-meetingScheduled')
        return emailMeetingScheduled({
          instanceID: doc.id,
          person: person.id,
        })
      })
      return Promise.all(promises)
    }).then(() => {
      // confirm the success
      dispatch(notificationSet('bookOneOffNotifySuccess', {
        useCustomRoom: values.useCustomRoom,
        room: values.useCustomRoom ? '' : values.room.id,
        customRoomName: values.customRoomName,
        period: instance.period,
        date: instance.date,
        people: state.meetingPage.people.map(person => person.id),
        name: values.name,
      }))
      // reset the setup form (to select time and room) so that user can book another
      dispatch(reset("scheduleMeetingSetupForm"))
      dispatch(pageSet("PEOPLE"))
      dispatch(push("/Meet"))

      dispatch(stopSubmit(form))
    })
  }
}

/**
 * Adds a recurring meeting at a particular period and invites its members
 * @param {string} period ID of the recurring meeting's period
 * @param {Object} values Form values describing the meeting
 */
export const addRecurringAndInvite = (period, values) => { 
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const form = `bookRecurring${period}Form`
    dispatch(startSubmit(form))
    const state = getState()
    const profile = state.firebase.profile
    const db = getFirestore()
    // add the recurirng meeting
    db.collection('recurrings').add({
      creator: profile.id,
      members: [profile.id],
      name: values.name,
      period: period,
      private: values.private ? values.private : false,
      room: values.useCustomRoom ? '' : values.room.id,
      roomName: values.useCustomRoom ? values.customRoomName : null,
    }).then(doc => {
      // invite each member  
      const promises = state.meetingPage.people.map(person => {
        if (person.id === profile.id) return Promise.resolve()
        return db.collection('invitations').add({
          recurringID: doc.id,
          creator: profile.id,
          invitee: person.id,
          type: 'recurring',
        })
      })
      return Promise.all(promises)
    }).then(() => {
      // notify the success
      dispatch(notificationSet('bookRecurringInviteSuccess', {
        useCustomRoom: values.useCustomRoom,
        room: values.useCustomRoom ? '' : values.room.id,
        customRoomName: values.customRoomName,
        period: period,
        people: state.meetingPage.people.map(person => person.id),
        name: values.name,
      }))
      // reset the setup form (to filter when and where) so that user can book another
      dispatch(reset("scheduleMeetingSetupForm"))
      dispatch(pageSet("PEOPLE"))
      dispatch(push("/Meet"))

      dispatch(stopSubmit(form))
    })
  }
}

/**
 * Adds a recurring meeting and notifies its members
 * @param {string} period ID of the recurring meeting's period
 * @param {Object[]} people Members of the meeting
 * @param {Object} values Form values describing the meeting
 */
export const addRecurringAndNotify = (period, people, values) => { 
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const form = `bookRecurring${period}Form`
    dispatch(startSubmit(form))
    const firebase = getFirebase()
    const state = getState()
    const profile = state.firebase.profile
    const db = getFirestore()
    // add the recurring meeting
    db.collection('recurrings').add({
      creator: profile.id,
      members: people.map(person => person.id),
      name: values.name,
      period: period,
      private: values.private ? values.private : false,
      room: values.useCustomRoom ? '' : values.room.id,
      roomName: values.useCustomRoom ? values.customRoomName : null,
    }).then(doc => {
      // notify each member of the meeting
      const promises = state.meetingPage.people.map(person => {
        if (person.id === profile.id) return Promise.resolve()
        const emailRecurringMeetingScheduled = firebase.functions().httpsCallable('emails-recurringMeetingScheduled')
        return emailRecurringMeetingScheduled({
          recurringID: doc.id,
          person: person.id,
        })
      })
      return Promise.all(promises)
    }).then(() => {
      // notify the success
      dispatch(notificationSet('bookRecurringNotifySuccess', {
        useCustomRoom: values.useCustomRoom,
        room: values.useCustomRoom ? '' : values.room.id,
        customRoomName: values.customRoomName,
        period: period,
        people: state.meetingPage.people.map(person => person.id),
        name: values.name,
      }))
      // reset the setup form to allow user to book another
      dispatch(reset("scheduleMeetingSetupForm"))
      dispatch(pageSet("PEOPLE"))
      dispatch(push("/Meet"))

      dispatch(stopSubmit(form))
    })
  }
}

/**
 * Removes a user from a meeting
 * @param {string} id ID of the meeting
 * @param {string} userID ID of the user
 */
export const unsubscribeOneOffMeeting = (id, userID) => { 
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const db = getFirestore()
    db.collection('instances').doc(id).update({
      members: db.FieldValue.arrayRemove(userID),
    })
  }
}

/**
 * Deletes a one-off meeting
 * @param {string} id ID of the meeting
 */
export const deleteOneOffMeeting = (id) => { 
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const db = getFirestore()
    db.collection('instances').doc(id).delete()
  }
}

/**
 * Notifies new members added to a one-off meeting
 * @param {Object} values Form values of new members
 * @param {Object} instance Original instance describing the meeting
 * @param {string} instanceID ID of the meeting
 */
export const notifyOneOffMeeting = (values, instance, instanceID) => { 
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const form = `oneoff${instanceID}InviteForm`
    dispatch(startSubmit(form))

    const firebase = getFirebase()
    const db = getFirestore()
    
    const ids = values.people.map(person => person.id)
    const newMembers = ids.filter(member => !instance.members.includes(member))
    // updates the instance
    db.collection('instances').doc(instanceID).update({
      members: ids,
    }).then(() => {
      // notify new members
      const emailMeetingScheduled = firebase.functions().httpsCallable('emails-meetingScheduled')
        
      const promises = newMembers.map(member => 
        emailMeetingScheduled({
          instanceID,
          person: member,
        })
      )
      return Promise.all(promises)
    }).then(() => {
      dispatch(stopSubmit(form))
    })
  }
}

/**
 * Invites new members added to a one-off meeting
 * @param {Object} values Form values describing the new members of the meeting
 * @param {Object} instance Object describing the meeting
 * @param {string} instanceID ID of the meeting
 * @param {string} userID ID of the current user (and creator of meeting)
 */
export const inviteOneOffMeeting = (values, instance, instanceID, userID) => { 
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const form = `oneoff${instanceID}NotifyForm`
    dispatch(startSubmit(form))
    const db = getFirestore()
    // find the added members and invite them
    const ids = values.people.map(person => person.id).filter(id => !instance.members.includes(id))
    
    ids.forEach(id => {
      db.collection('invitations').add({
        type: 'oneOff',
        instanceID,
        creator: userID,
        invitee: id,
      })
    })
    dispatch(stopSubmit(form))
  }
}

/**
 * Remove the current user from a recurring meeting
 * @param {string} id ID of the meeting
 * @param {string} userID ID of the current user
 */
export const unsubscribeRecurringMeeting = (id, userID) => { 
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const db = getFirestore()
    db.collection('recurrings').doc(id).update({
      members: db.FieldValue.arrayRemove(userID),
    })
  }
}

/**
 * Delete a recurring meeting by ID
 * @param {string} id ID of the recurring meeting
 */
export const deleteRecurringMeeting = (id) => { 
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const db = getFirestore()
    db.collection('recurrings').doc(id).delete()
  }
}

/**
 * Notifies new members added to a recurring meeting
 * @param {Object} values Form values of new members
 * @param {Object} recurring Object describing the original recurring meeting
 * @param {*} recurringID ID of the recurring meeting
 */
export const notifyRecurringMeeting = (values, recurring, recurringID) => { 
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const form = `recurring${recurringID}NotifyForm`
    dispatch(startSubmit(form))

    const firebase = getFirebase()
    const db = getFirestore()

    const ids = values.people.map(person => person.id)
    // compute the new members
    const newMembers = ids.filter(member => !recurring.members.includes(member))

    // update the meeting
    db.collection('recurrings').doc(recurringID).update({
      members: ids,
    }).then(() => {
      // notify each new member
      const emailRecurringMeetingScheduled = firebase.functions().httpsCallable('emails-recurringMeetingScheduled')
      const promises = newMembers.map(member => 
        emailRecurringMeetingScheduled({
          recurringID,
          person: member,
        })
      )
      return Promise.all(promises)
    }).then(() => {
      dispatch(stopSubmit(form))
    })
  }
}

/**
 * Invites new members added to a recurring meeting
 * @param {Object} values Form values describing the new members of the meeting
 * @param {Object} recurring Object describing the meeting
 * @param {string} recurringID ID of the meeting
 * @param {string} userID ID of the current user (and creator of meeting)
 */
export const inviteRecurringMeeting = (values, recurring, recurringID, userID) => { 
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const form = `recurring${recurringID}InviteForm`
    dispatch(startSubmit(form))
    const db = getFirestore()
    // get the new members
    const ids = values.people.map(person => person.id).filter(id => !recurring.members.includes(id))
    // invite them
    ids.forEach(id => {
      db.collection('invitations').add({
        type: 'recurring',
        recurringID,
        creator: userID,
        invitee: id,
      })
    })
    dispatch(stopSubmit(form))
  }
}

/**
 * Accepts an invitation and adds the current user as a new member,
 * removing the invitation after
 * @param {string} invitationID ID of the invitation
 * @param {Object} invitation The invitation to accept
 */
export const acceptInstanceInvitation = (invitationID, invitation) => {
  return (dispatch, getState, {getFirestore}) => {
    const db = getFirestore()

    db.collection('instances').doc(invitation.instanceID).update({
      members: db.FieldValue.arrayUnion(invitation.invitee),
    }).then(() => {
      db.collection('invitations').doc(invitationID).delete()
    })
  }
}

/**
 * Accepts an invitation to a recurring meeting and adds the current
 * user as a new member, removing the invitation after
 * @param {string} invitationID ID of the invitation
 * @param {Object} invitation Invitation of the recurring meeting
 */
export const acceptRecurringInvitation = (invitationID, invitation) => {
  return (dispatch, getState, {getFirestore}) => {
    const db = getFirestore()

    db.collection('recurrings').doc(invitation.recurringID).update({
      members: db.FieldValue.arrayUnion(invitation.invitee),
    }).then(() => {
      db.collection('invitations').doc(invitationID).delete()
    })
  }
}

/**
 * Declines an invitation, removing it from the database
 * @param {string} invitationID ID of the invitation
 */
export const declineInvitation = (invitationID) => {
  return (dispatch, getState, {getFirestore}) => {
    const db = getFirestore()
    db.collection('invitations').doc(invitationID).delete()
  }
}