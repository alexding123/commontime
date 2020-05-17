const functions = require('firebase-functions')
const admin = require('firebase-admin')
const sentry = require("@sentry/node")
const db = admin.firestore()
const { sendEmail } = require('../utils/email')
const { dayMap } = require('../utils/constants')
const { getUserPresetByID, getInstance, getRecurring, getPeriod, getRoom } = require('../utils/db')
const date = require('date-and-time')
exports.onCreate = functions.firestore.document('invitations/{invitationID}').onCreate(async (snap, context) => {
  try {
  const creator = await getUserPresetByID(snap.data().creator)
  const invitee = await getUserPresetByID(snap.data().invitee)
  const instance = snap.data().type === 'oneOff' ?
    await getInstance(snap.data().instanceID) :
    await getRecurring(snap.data().recurringID)
  const period = await getPeriod(instance.period)
  const roomName = instance.room ?
    (await getRoom(instance.room)).name :
    instance.roomName

  if (snap.data().type === 'oneOff') {
    await sendEmail(invitee.email, 'oneoffMeetingInvited', {
      creatorName: creator.name,
      dayName: dayMap[period.day],
      periodName: period.name,
      dateName: date.format(date.parse(instance.date, 'MM/DD/YYYY'), 'MMMM DD'),
      roomName: roomName,
      name: instance.name,
      invitationID: context.params.invitationID
    })
  } else if (snap.data().type === 'recurring') {
    await sendEmail(invitee.email, 'recurringMeetingInvited', {
      creatorName: creator.name,
      dayName: dayMap[period.day],
      periodName: period.name,
      roomName: roomName,
      name: instance.name,
      invitationID: context.params.invitationID
    })
  }
  } catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
})