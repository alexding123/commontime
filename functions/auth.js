/**
 * Firebase Auth triggers and auth-related functions
 */

const functions = require('firebase-functions')
const admin = require('firebase-admin')
const sentry = require("@sentry/node")
const db = admin.firestore()
const { calendar, auth } = require('./utils/calendar')
const { getUserPresetByEmail } = require('./utils/db')

/**
 * Firebase trigger when a new user is created, verifying that the user has an @commschool.org email
 * and is registered on the roster, as well as applying the preset to the user
 */
exports.onCreate = functions.auth.user().onCreate(async (user, context) => {
  try {
  // verify @commschool.org
  if (user.email.split('@')[1] !== 'commschool.org') {
    await admin.auth().deleteUser(user.uid)
    throw new functions.https.HttpsError('invalid-argument', 'User email must be under the commschool.org domain.')
  }

  // verify that the user has an associated userPreset (to weed out non-personal accounts)
  const userPreset = await getUserPresetByEmail(user.email)
  if (Object.keys(userPreset).length === 0 && userPreset.constructor === Object) {
    await admin.auth().deleteUser(user.uid)
    throw new functions.https.HttpsError('not-found', 'User with this email not found in the uploaded users file.')
  }

  // set custom claims (rest of the initialization is done at users.onCreate)
  const customClaims = {
    admin: false,
  }
  await admin.auth().setCustomUserClaims(user.uid, {...customClaims, ...user.customClaims})
  } catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
})

/**
 * Firestore trigger when an user is deleted, removing the associated user profile
 * as well as the associated Google Calendar
 */
exports.onDelete = functions.auth.user().onDelete(async (user, context) => {
  try {
  // delete the associated profile
  const profile = await db.collection('users').doc(user.uid).get()
  await db.collection('users').doc(user.uid).delete()

  // delete the associated Google Calendar, if it exists
  if (!profile.data().calendar) return
  const deleteCalendarPromise = new Promise((resolve, reject) => {
    calendar.calendars.delete({
      calendarId: profile.data().calendar,
      auth: auth,
    }, (err, res) => {
      if (err) {
        reject(err)
      }
      resolve(res)
    })
  }).catch(console.error)
  await deleteCalendarPromise
  } catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
})

/**
 * Firebase Function to list all current admins
 */
exports.listAdmins = functions.https.onCall(async (data, context) => {
  try {
  // limit this right to current admins
  if (!context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can list all admins.')
  }

  // get all Firebase users and filter by custom claims
  const users = (await admin.auth().listUsers()).users

  // find admins!
  const adminUsers = users.filter(user => user.customClaims.admin)
  return adminUsers.map(user => ({
    email: user.email,
    id: user.uid,
    name: user.displayName,
  }))
  } catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
})

/**
 * Firebase Function to turn an existing user into an administrator
 */
exports.addAdmin = functions.https.onCall(async (data, context) => {
  try {
  // limit this to only current admins
  if (!context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can add new admins.')
  }
  const email = data.email
  if (!email) {
    throw new functions.https.HttpsError('invalid-argument', `You must supply argument email.`)
  }
  const docs = await db.collection('users').where('email', '==', email).get()
  if (docs.size > 1) {
    throw new functions.https.HttpsError('internal', "Database has multiple users with the same email.")
  }
  if (docs.empty) {
    throw new functions.https.HttpsError('not-found', `There is no registered user with email ${email}.`)
  }

  const userID = docs.docs[0].id
  const user = await admin.auth().getUser(userID)

  if (user.customClaims.admin) {
    throw new functions.https.HttpsError('already-exists', `The user with email ${email} is already an administrator.`)
  }
  
  await admin.auth().setCustomUserClaims(userID, {
    ...user.customClaims,
    admin: true
  })
  return
  } catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
})

/**
 * Firebase Function to relinquish the user's administrator rights
 */
exports.relinquishAdmin = functions.https.onCall(async (data, context) => {
  try {
  if (!context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can relinquish their own privileges.')
  }
  const user = await admin.auth().getUser(context.auth.uid)

  await admin.auth().setCustomUserClaims(user.uid, {
    ...user.customClaims,
    admin: false
  })
  return
  } catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
})