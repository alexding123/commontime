const functions = require('firebase-functions')
const admin = require('firebase-admin')
const db = admin.firestore()
const { applyPreset, initializeNewUser } = require('../utils/preset')
const { sendEmail } = require('../utils/email')
const { getUserPresetByEmail } = require('../utils/db')

exports.onCreate = functions.firestore.document('users/{id}').onCreate(async (snap, context) => {
  if (snap.data().email.split('@')[1] !== 'commschool.org') {
    await db.collection('users').doc(context.params.id).delete()
    return
  }

  const userPreset = await getUserPresetByEmail(snap.data().email)
  // if not found
  if (Object.keys(userPreset).length === 0 && userPreset.constructor === Object) {
    throw new functions.https.HttpsError('not-found', 'User preset incomplete or not uploaded yet.')
  }

  await applyPreset(context.params.id, userPreset)
  await initializeNewUser(snap)
  await sendEmail(snap.data().email, 'welcome', {
    name: userPreset.name,
  })
})