import { startSubmit, stopSubmit } from 'redux-form'
import { getPeriodTimes } from '../selectors'
import { notificationSet } from './notificationsActions'

/**
 * Updates a club meeting instance by ID
 * @param {string} instanceID ID of the instance to be updated
 * @param {Object} values Form values describing the edit
 */
export const updateMeeting = (instanceID) => (values) => {
  return (dispatch, getState, {getFirestore}) => {
    const form = `meeting${instanceID}Form`
    dispatch(startSubmit(form))
    const db = getFirestore()
    // can only update name and room
    db.collection('instances').doc(instanceID).update({
      name: values.name,
      room: values.room,
    }).then(() => {
      dispatch(stopSubmit(form))
    })
  }
}

/**
 * Deletes a club meeting instance by ID
 * @param {string} instanceID ID of the instance to be deleted
 */
export const deleteMeeting = (instanceID) => {
  return (dispatch, getState, {getFirestore}) => {
    const db = getFirestore()
    db.collection('instances').doc(instanceID).delete()
  }
}

/**
 * Indicates the user's attendance of a club meeting
 * @param {} instanceID ID of the instance user is attending
 */
export const attendMeeting = (instanceID) => {
  return (dispatch, getState, {getFirestore}) => {
    const db = getFirestore()
    const state = getState()
    db.collection('instances').doc(instanceID).update({
      members: db.FieldValue.arrayUnion(state.firebase.profile.id),
    })
  }
}

/**
 * Indicates the user's unattending of a club meeting
 * @param {string} instanceID ID of the instance user is no longer attending
 */
export const unattendMeeting = (instanceID) => {
  return (dispatch, getState, {getFirestore}) => {
    const db = getFirestore()
    const state = getState()
    db.collection('instances').doc(instanceID).update({
      members: db.FieldValue.arrayRemove(state.firebase.profile.id),
    })
  }
}

/**
 * Adds a new club meeting
 * @param {Date} date Date of the meeting
 * @param {number} day Day of the meeting
 * @param {string} time Period of the day of the meeting
 */
export const addMeeting = (date, day, time) => (values) => {
  return (dispatch, getState, {getFirestore}) => {
    dispatch(startSubmit(`addMeetingForm${time}`))
    const db = getFirestore()
    const state = getState()
    const userID = state.firebase.profile.id
    // get start and end time of the period on day-time
    const { startDate, endDate } = getPeriodTimes(state, date, `${day}-${time}`)
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
    }).then(() => {
      dispatch(stopSubmit(`addMeetingForm${time}`))
    })
  }
}

/**
 * Add a meeting at a given time and place
 * @param {string} date Date of the booked meeting, formatted as MM/DD/YYYY
 * @param {string} period Period ID of the meeting
 * @param {string} room Room ID of the meeting
 * @param {Object} values Form values describing the meeting
 */
export const bookRoom = (date, period, room) => (values) => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const form = `bookRoom${room.id}${date}Form`
    dispatch(startSubmit(form))
    const db = getFirestore()
    const state = getState()

    const userID = state.firebase.profile.id
    // if not a teacher, form might not even have the private field
    // defaults to false
    const private_ = Object.keys(values).includes('private') ? values.private : false
    // get start and end time of the period
    const { startDate, endDate } = getPeriodTimes(state, date, period)
    db.collection('instances').add({
      date,
      period,
      members: [userID], // creator is by default a member
      name: values.name,
      room,
      type: 'event',
      creator: userID, // current user as creator
      private: private_,
      startDate,
      endDate
    }).then(() => {
      // display the success message
      dispatch(notificationSet('bookRoomSuccess', {
        room,
        period,
        name: values.name,
        date,
      }))
      dispatch(stopSubmit(form))
    })

  }
}

/**
 * Overwrites a current booking with a different meeting
 * Only teachers can do so 
 * @param {Object} instance Instance object describing the original meeting
 * @param {string} instanceID Instance ID of the original meeting
 * @param {Object} values Form values describing the new meeting
 */
export const rebookRoom = (instance, instanceID) => (values) => {
  return (dispatch, getState, {getFirebase, getFirestore}) => {
    const form = `rebookRoom${instance.room.id}${instance.date}Form`
    dispatch(startSubmit(form))
    const state = getState()
    const firebase = getFirebase()
    const db = getFirestore()
    const userID = state.firebase.profile.id

    // delete original instance
    db.collection('instances').doc(instanceID).delete().then(() => {
      // then create a new instance
      return db.collection('instances').add({
        ...instance,
        members: [userID],
        name: values.name,
        creator: userID,
        private: values.private,
      })
    }).then(() => {
      // notify original creator of meeting's deletion
      const sendEmail = firebase.functions().httpsCallable('emails-roomRebooked')
      sendEmail({
        instance,
        by: userID,
      })
    }).then(() => {
      dispatch(stopSubmit(form))
    })
  }
}

/**
 * Deletes an existing meeting by ID
 * @param {string} instanceID ID of the meeting instance to be deleted
 */
export const cancelBooking = (instanceID) => {
  return (dispatch, getState, {getFirestore}) => {
    const db = getFirestore()

    db.collection('instances').doc(instanceID).delete()
  }
}