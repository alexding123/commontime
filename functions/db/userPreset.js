const functions = require('firebase-functions')
const admin = require('firebase-admin')
const sentry = require("@sentry/node")
const db = admin.firestore()
const { applyPreset } = require('../utils/preset')
const { getUserByID } = require('../utils/db')


exports.onCreate = functions.firestore.document('userPreset/{id}').onCreate(async (snap, context) => {
  try {
  // apply preset to user (if found) whenever userPreset is created 
  const userID = snap.data().id  
  const user = await getUserByID(userID)

  // if user not found (user is empty Object)
  if (Object.keys(user).length === 0 && user.constructor === Object) {
    return
  }
  
  await applyPreset(user.uid, snap.data())
  } catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
})

exports.onDelete = functions.firestore.document('userPreset/{id}').onDelete(async (snap, context) => {
  try {
  // first thing to do: determine whether this is an upload
  const isUploading = (await db.collection('meta').doc('internal').get()).data().isUploadingUsers

  // skip operations if this is an upload
  if (isUploading) {
    return
  }

  // each user Firebase auth has an associated entry in users/{uid}
  // so we use that to determine if the Firebase auth user exists 
  const user = await getUserByID(snap.data().id)

  // if user not found (user is empty Object), no operation
  if (Object.keys(user).length === 0 && user.constructor === Object) {
    return
  }

  // kill it!
  // the auth onDelete trigger will handle deleting the users/{uid} entry
  await admin.auth().deleteUser(user.uid)
} catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
})

exports.onUpdate = functions.firestore.document('userPreset/{id}').onUpdate(async (snap, context) => {
  try {
  // each user Firebase auth has an associated entry in users/{uid}
  // so we use that to determine if the Firebase auth user exists 
  const user = await getUserByID(context.params.id)

  // if user not found (user is empty Object), no operation
  if (Object.keys(user).length === 0 && user.constructor === Object) {
    return
  }

  // reapply the new presets
  await applyPreset(user.uid, snap.after.data())
  } catch (error) {
    if (!error.code) sentry.captureException(error)
    throw error
  }
})

