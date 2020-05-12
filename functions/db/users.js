const functions = require('firebase-functions')
const admin = require('firebase-admin')
const db = admin.firestore()
const { applyPreset, initializeNewUser } = require('../utils/preset')

exports.onCreate = functions.firestore.document('users/{id}').onCreate((snap, context) => {
  const email = snap.data().email  
  if (email.split('@')[1] !== 'commschool.org') {
    return db.collection('users').doc(context.params.id).delete()
  }
  return db.collection('userPreset').doc(email).get().then(presetSnap => {
    if (!presetSnap.exists) {
      throw Error("User preset not incomplete or not uploaded yet")
    }
    const presetData = presetSnap.data()
    return Promise.all([applyPreset(snap, presetData), initializeNewUser(snap)])
  })
})