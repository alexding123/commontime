import { push } from "connected-react-router"
import { reset } from "redux-form"
import { getPeriodTimes } from "../selectors"
import { notificationSet } from "./notificationsActions"

export const PAGE_SET = 'PAGE_SET'
export const pageSet = (value) => {
  return {
    type: PAGE_SET,
    data: value,
  }
}

export const SCHEDULE_MEETING_SETUP_SAVED = 'SCHEDULE_MEETING_SETUP_SAVED'
export const scheduleMeetingSetupSaved = (values) => ({
  type: SCHEDULE_MEETING_SETUP_SAVED,
  data: values,
})

export const TOGGLE_SHOW_MEETING_FILTERS = 'TOGGLE_SHOW_MEETING_FILTERS'
export const toggleShowMeetingFilters = () => ({
  type: TOGGLE_SHOW_MEETING_FILTERS,
})


export const ONEOFF_INSTANCE_SELECTED = 'ONEOFF_INSTANCE_SELECTED'
export const oneoffInstanceSelected = (instance) => ({
  type: ONEOFF_INSTANCE_SELECTED,
  data: instance
})

export const PERIOD_SELECTED = 'PERIOD_SELECTED'
export const periodSelected = (period) => ({
  type: PERIOD_SELECTED,
  data: period
})

export const addInstanceAndInvite = (instance, values) => { 
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const state = getState()
    const profile = state.firebase.profile
    const { startDate, endDate } = getPeriodTimes(state, new Date(instance.date), instance.period)
    const db = getFirestore()
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
      dispatch(reset("scheduleMeetingSetupForm"))
      dispatch(pageSet("PEOPLE"))
      dispatch(push("/Meet"))
    })
  }
}

export const addInstanceAndNotify = (instance, people, values) => { 
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const firebase = getFirebase()
    const state = getState()
    const profile = state.firebase.profile
    const { startDate, endDate } = getPeriodTimes(state, instance.date, instance.period)
    const db = getFirestore()
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
      dispatch(notificationSet('bookOneOffNotifySuccess', {
        useCustomRoom: values.useCustomRoom,
        room: values.useCustomRoom ? '' : values.room.id,
        customRoomName: values.customRoomName,
        period: instance.period,
        date: instance.date,
        people: state.meetingPage.people.map(person => person.id),
        name: values.name,
      }))
      dispatch(reset("scheduleMeetingSetupForm"))
      dispatch(pageSet("PEOPLE"))
      dispatch(push("/Meet"))
    })
  }
}

export const addRecurringAndInvite = (period, values) => { 
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const state = getState()
    const profile = state.firebase.profile
    const db = getFirestore()
    db.collection('recurrings').add({
      creator: profile.id,
      members: [profile.id],
      name: values.name,
      period: period,
      private: values.private ? values.private : false,
      room: values.useCustomRoom ? '' : values.room.id,
      roomName: values.useCustomRoom ? values.customRoomName : null,
    }).then(doc => {
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
      dispatch(notificationSet('bookRecurringInviteSuccess', {
        useCustomRoom: values.useCustomRoom,
        room: values.useCustomRoom ? '' : values.room.id,
        customRoomName: values.customRoomName,
        period: period,
        people: state.meetingPage.people.map(person => person.id),
        name: values.name,
      }))
      dispatch(reset("scheduleMeetingSetupForm"))
      dispatch(pageSet("PEOPLE"))
      dispatch(push("/Meet"))
    })
  }
}

export const addRecurringAndNotify = (period, people, values) => { 
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const firebase = getFirebase()
    const state = getState()
    const profile = state.firebase.profile
    const db = getFirestore()
    db.collection('recurrings').add({
      creator: profile.id,
      members: people.map(person => person.id),
      name: values.name,
      period: period,
      private: values.private ? values.private : false,
      room: values.useCustomRoom ? '' : values.room.id,
      roomName: values.useCustomRoom ? values.customRoomName : null,
    }).then(doc => {
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
      dispatch(notificationSet('bookRecurringNotifySuccess', {
        useCustomRoom: values.useCustomRoom,
        room: values.useCustomRoom ? '' : values.room.id,
        customRoomName: values.customRoomName,
        period: period,
        people: state.meetingPage.people.map(person => person.id),
        name: values.name,
      }))
      dispatch(reset("scheduleMeetingSetupForm"))
      dispatch(pageSet("PEOPLE"))
      dispatch(push("/Meet"))
    })
  }
}

export const unsubscribeOneOffMeeting = (id, userID) => { 
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const db = getFirestore()
    db.collection('instances').doc(id).update({
      members: db.FieldValue.arrayRemove(userID),
    })
  }
}

export const deleteOneOffMeeting = (id, userID) => { 
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const db = getFirestore()
    db.collection('instances').doc(id).delete()
  }
}

export const notifyOneOffMeeting = (values, instanceID) => { 
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const db = getFirestore()
    const ids = values.people.map(person => person.id)
    
    db.collection('instances').doc(instanceID).update({
      members: ids,
    })
  }
}

export const inviteOneOffMeeting = (values, instance, instanceID, userID) => { 
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const db = getFirestore()
    const ids = values.people.map(person => person.id).filter(id => !instance.members.includes(id))
    
    ids.forEach(id => {
      db.collection('invitations').add({
        type: 'oneOff',
        instanceID,
        creator: userID,
        invitee: id,
      })
    })
  }
}

export const unsubscribeRecurringMeeting = (id, userID) => { 
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const db = getFirestore()
    db.collection('recurrings').doc(id).update({
      members: db.FieldValue.arrayRemove(userID),
    })
  }
}

export const deleteRecurringMeeting = (id, userID) => { 
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const db = getFirestore()
    db.collection('recurrings').doc(id).delete()
  }
}

export const notifyRecurringMeeting = (values, recurringID) => { 
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const db = getFirestore()
    const ids = values.people.map(person => person.id)
    
    db.collection('recurrings').doc(recurringID).update({
      members: ids,
    })
  }
}

export const inviteRecurringMeeting = (values, recurring, recurringID, userID) => { 
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const db = getFirestore()
    const ids = values.people.map(person => person.id).filter(id => !recurring.members.includes(id))
    
    ids.forEach(id => {
      db.collection('invitations').add({
        type: 'recurring',
        recurringID,
        creator: userID,
        invitee: id,
      })
    })
  }
}

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

export const declineInvitation = (invitationID) => {
  return (dispatch, getState, {getFirestore}) => {
    const db = getFirestore()
    db.collection('invitations').doc(invitationID).delete()
  }
}