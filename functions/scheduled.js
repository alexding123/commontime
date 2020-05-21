/* eslint-disable no-await-in-loop */
/* eslint-disable no-loop-func */
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const sentry = require("@sentry/node")
const date = require('date-and-time')
const { getPeriod, getRoom, getUserPresetByID } = require('./utils/db')
const { sendEmail } = require('./utils/email')
const db = admin.firestore()

exports.scheduledFunctionCrontab = functions.pubsub.schedule('7 30 * * *')
  .timeZone('America/New_York')
  .onRun(async (context) => {
  // run everyday on 7:30 AM
  try {
    const today = date.format(new Date(), 'MM/DD/YYYY')
    const exceptionDoc = (await db.collection('exceptions').where('date', '==', today).get())
    // no exception today
    if (exceptionDoc.empty) {
      return
    }
    if (exceptionDoc.size > 1) {
      throw new Error('Multiple exceptions on the same day')
    }
  
    const exception = exceptionDoc.docs[0].data()
    const eventsDocs = (await db.collectionGroup('instances').where('type', '==', 'event').where('date', '==', today).get())
    
    for (let eventDoc of eventsDocs.docs) {
      const event = eventDoc.data()
      const period = await getPeriod(event.period)
      const roomName = event.room ? (await getRoom(event.room)).name : event.roomName
      for (let member of event.members) {
        const user = await getUserPresetByID(member)
        sendEmail(user.email, 'exceptionMeeting', {
          roomName,
          periodName: period.name,
          name: event.name,
          summary: exception.summary,
          description: exception.description,
        })
      }
    }
    } catch (error) {
      if (!error.code) sentry.captureException(error)
      throw error
    }
})