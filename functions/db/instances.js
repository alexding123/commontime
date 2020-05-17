/* eslint-disable no-await-in-loop */
/* eslint-disable no-loop-func */

const functions = require('firebase-functions')
const admin = require('firebase-admin')
const sentry = require("@sentry/node")
const db = admin.firestore()
const date = require('date-and-time')
const { addInstance, insert, calendar, auth, getAuth, list, listEvents, delete_, deleteEvent } = require('../utils/calendar')
const { getUserByID, deleteInstanceInvitations } = require('../utils/db')

const onCreateFunc = async (snap, context) => {
  try {
  const instanceID = context.params.instanceID
  const members = snap.data().members
  for (let member of members) {
    const calendarID = (await getUserByID(member)).calendar
    if (!calendarID) {
      continue
    }
    const data = snap.data()
    const setup = await addInstance(calendarID, data, auth, instanceID)
    await insert(setup)
  }
  } catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
}

exports.onCreateFunc = onCreateFunc

exports.onCreate = functions.firestore.document('instances/{instanceID}').onCreate(onCreateFunc)

const onDeleteFunc = async (snap, context) => {
  try {
  // delete invitations
  const instanceID = context.params.instanceID
  await deleteInstanceInvitations(instanceID)
  
  const members = snap.data().members
  for (let member of members) {
    const calendarID = (await getUserByID(member)).calendar
    if (!calendarID) {
      return
    }
    
    const items = await list(await listEvents(calendarID, auth, 'instanceID', instanceID))
    if (items.length === 0) {
      return
    }
    for (let item of items) {
      const setup = await deleteEvent(calendarID, auth, item.id)
      await delete_(setup)
    }
  }
  } catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
}
exports.onDeleteFunc = onDeleteFunc

exports.onDelete = functions.firestore.document('instances/{instanceID}').onDelete(onDeleteFunc)

const onUpdateFunc = async (snap, context) => {
  try {
  const instanceID = context.params.instanceID
  const deleteMember = async (member) => {
    const calendarID = (await getUserByID(member)).calendar
    
    if (!calendarID) return null

    const setup = await listEvents(calendarID, auth, 'instanceID', instanceID)
    const items = await list(setup)
    
    for (let item of items) {
      const deleteSetup = await deleteEvent(calendarID, auth, item.id)
      await delete_(deleteSetup).catch(console.error)
    }
    return null
  }

  const addMember = async (member) => {
    const calendarID = (await getUserByID(member)).calendar
    if (!calendarID) return null

    const data = snap.before.data()
    const setup = await addInstance(calendarID, data, auth, instanceID)
    return await insert(setup).catch(console.error)
  }

  // compare members from before and after
  const beforeMembers = snap.before.data().members
  const afterMembers = snap.after.data().members

  if (beforeMembers.length > afterMembers.length) {
    // member deleted
    const diff = beforeMembers.filter(member => !afterMembers.includes(member))
    for (let member of diff) {
      await deleteMember(member)
    }
  } else {
    // member added
    const diff = afterMembers.filter(member => !beforeMembers.includes(member))
    for (let member of diff) {
      await addMember(member)
    }
  }
  } catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
}

exports.onUpdateFunc = onUpdateFunc

exports.onUpdate = functions.firestore.document('instances/{instanceID}').onUpdate(onUpdateFunc)