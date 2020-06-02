const functions = require('firebase-functions')
const admin = require('firebase-admin')
const sentry = require("@sentry/node")
const db = admin.firestore()
const { applyPreset, initializeNewUser } = require('../utils/preset')
const { sendEmail } = require('../utils/email')
const { getUserPresetByEmail } = require('../utils/db')

/**
 * Firestore Trigger when a new user is created, checking the validity of their email
 * and looking up the associated userPreset record to apply settings
 */
exports.onCreate = functions.firestore.document('users/{id}').onCreate(async (snap, context) => {
  try {
  // if user email is not from @commschool.org, delete
  if (snap.data().email.split('@')[1] !== 'commschool.org') {
    await db.collection('users').doc(context.params.id).delete()
    return
  }

  const userPreset = await getUserPresetByEmail(snap.data().email)
  // if not found
  if (Object.keys(userPreset).length === 0 && userPreset.constructor === Object) {
    throw new functions.https.HttpsError('not-found', 'User preset incomplete or not uploaded yet.')
  }
  
  // apply the preset information to supplement the user profile
  await applyPreset(context.params.id, userPreset)
  // create standard user profile information
  await initializeNewUser(snap)
  // send a welcome email
  await sendEmail(snap.data().email, 'welcome', {
    name: userPreset.name,
  })
  } catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
})