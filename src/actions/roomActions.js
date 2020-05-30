import { getPeriodTimes } from "../selectors"
import date from 'date-and-time'
import { startSubmit, stopSubmit } from "redux-form"

/**
 * Books a meeting in the current room
 * @param {Object} period Object describing the period of the meeting
 * @param {Date} d Selected date of the meeting
 * @param {Object} room Room of the meeting
 * @param {Object} values Form values describing the meeting
 */
export const bookRoom = (period, d, room, values) => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const form = `bookRoom${room.id}${d ? date.format(d, 'MM/DD/YYYY') : ''}Form`
    dispatch(startSubmit(form))
    const db = getFirestore()
    const state = getState()

    const userID = state.firebase.profile.id
    const dFormatted = date.format(d, 'MM/DD/YYYY')
    const periodID = `${period.day}-${period.period}`
    const private_ = Object.keys(values).includes('private') ? values.private : false
    // get the start and end times of the selected period
    const { startDate, endDate } = getPeriodTimes(state, dFormatted, periodID)
    // Cloud Firestore operatioon to add the meeting
    db.collection('instances').add({
      date: dFormatted,
      period: periodID,
      members: [userID],
      name: values.name,
      room: room,
      type: 'event',
      creator: userID,
      private: private_,
      startDate,
      endDate
    }).then(() => {
      dispatch(stopSubmit(form))
    })
  }
}

/**
 * Overrides a current booking with a new meeting.
 * Only available to teachers and admins
 * @param {Object} instance Current meeting
 * @param {string} instanceID ID of the current meeting
 * @param {Object} values Form values describing the new meeting
 */
export const rebookRoom = (instance, instanceID, values) => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const form = `rebookRoom${instance.room.id}${instance.date}Form`
    dispatch(startSubmit(form))
    const firebase = getFirebase()
    const db = getFirestore()
    const state = getState()
    
    const userID = state.firebase.profile.id
    // delete current meeting
    db.collection('instances').doc(instanceID).delete().then(() => {
      // add the new meeting
      return db.collection('instances').add({
        ...instance,
        members: [userID],
        name: values.name,
        creator: userID,
        private: values.private,
      })
    }).then(() => {
      // notify the original booker of the room of the override
      const sendEmail = firebase.functions().httpsCallable('emails-roomRebooked')
      sendEmail({
        instance: instance,
        by: userID,
      })
    }).then(() => {
      dispatch(stopSubmit(form))
    })
  }
}