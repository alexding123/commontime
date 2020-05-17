import { getPeriodTimes } from "../selectors"
import date from 'date-and-time'
import { startSubmit, stopSubmit } from "redux-form"

export const bookRoom = (period, d, room, values) => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const form = `bookRoom${room.id}${d ? date.format(d, 'MM/DD/YYYY') : ''}Form`
    dispatch(startSubmit(form))
    const db = getFirestore()
    const state = getState()

    const userID = state.firebase.profile.id
    const dFormatted = date.format(d, 'MM/DD/YYYY')
    const periodID = `${period.day}-${period.period}`
    const _private = Object.keys(values).includes('private') ? values.private : false
    const { startDate, endDate } = getPeriodTimes(state, d, periodID)
    db.collection('instances').add({
      date: dFormatted,
      period: periodID,
      members: [userID],
      name: values.name,
      room: room,
      type: 'event',
      creator: userID,
      private: _private,
      startDate,
      endDate
    }).then(() => {
      dispatch(stopSubmit(form))
    })
  }
}

export const rebookRoom = (instance, instanceID, values) => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const form = `rebookRoom${instance.room.id}${instance.date}Form`
    dispatch(startSubmit(form))
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
    }).then(() => {
      dispatch(stopSubmit(form))
    })
  }
}