import { getPeriodTimes } from '../selectors'
import { notificationSet } from './notificationsActions'

export const updateMeeting = (instanceID) => (values) => {
  return (dispatch, getState, {getFirestore}) => {
    const db = getFirestore()
    db.collection('instances').doc(instanceID).update({
      name: values.name,
      room: values.room,
    })
  }
}

export const deleteMeeting = (instanceID) => {
  return (dispatch, getState, {getFirestore}) => {
    const db = getFirestore()
    db.collection('instances').doc(instanceID).delete()
  }
}

export const attendMeeting = (instanceID) => {
  return (dispatch, getState, {getFirestore}) => {
    const db = getFirestore()
    const state = getState()
    db.collection('instances').doc(instanceID).update({
      members: db.FieldValue.arrayUnion(state.firebase.profile.id),
    })
  }
}

export const unattendMeeting = (instanceID) => {
  return (dispatch, getState, {getFirestore}) => {
    const db = getFirestore()
    const state = getState()
    db.collection('instances').doc(instanceID).update({
      members: db.FieldValue.arrayRemove(state.firebase.profile.id),
    })
  }
}

export const addMeeting = (date, day, time) => (values) => {
  return (dispatch, getState, {getFirestore}) => {
    const db = getFirestore()
    const state = getState()
    const userID = state.firebase.profile.id
    const {startDate, endDate } = getPeriodTimes(state, date, `${day}-${time}`)
    db.collection('instances').add({
      date: date,
      period: `${day}-${time}`,
      members: [],
      name: values.name,
      room: values.room,
      type: 'event',
      creator: userID,
      private: false,
      startDate,
      endDate
    })
  }
}

export const bookRoom = (date, period, room) => (values) => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const db = getFirestore()
    const state = getState()

    const userID = state.firebase.profile.id
    const _private = Object.keys(values).includes('private') ? values.private : false
    const { startDate, endDate } = getPeriodTimes(state, date, period)
    db.collection('instances').add({
      date: date,
      period: period,
      members: [userID],
      name: values.name,
      room: room,
      type: 'event',
      creator: userID,
      private: _private,
      startDate,
      endDate
    }).then(() => {
      dispatch(notificationSet('bookRoomSuccess', {
        room,
        period,
        name: values.name,
        date,
      }))
    })

  }
}

export const rebookRoom = (instance, instanceID) => (values) => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const db = getFirestore()
    const state = getState()

    const firebase = getFirebase()

    const userID = state.firebase.profile.id
    const getInstance = db.collection('instances').doc(instanceID).get().then(doc => {
      const data = doc.data()
      return data
    })

    const deleteInstance = getInstance.then(() => {
      return db.collection('instances').doc(instanceID).delete()
    })

    Promise.all([getInstance, deleteInstance]).then(([data, _]) => {
      return db.collection('instances').doc(instanceID).set({
        ...data,
        members: [userID],
        name: values.name,
        creator: userID,
        private: values.private,
      })
    })

    const sendEmail = firebase.functions().httpsCallable('emails-roomRebooked')
    sendEmail({
      instance: instance,
      by: userID,
    })
  }
}

export const cancelBooking = (instanceID) => {
  return (dispatch, getState, {getFirestore}) => {
    const db = getFirestore()

    db.collection('instances').doc(instanceID).delete()
  }
}