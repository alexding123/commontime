/**
 * Helper functions to setting up the user profile
 */

const admin = require('firebase-admin')
const db = admin.firestore()

/**
 * Modifies a user's profile to reflect the data in the user's associated userPreset
 * @param {string} userID ID of the user
 * @param {string} presetData The presetData object linked with the user
 * @returns {Promise}
 */
exports.applyPreset = (userID, presetData) => {
  // set custom claims based on preset
  const customClaims = {
    teacher: presetData.teacher,
  }
  const authPromise = admin.auth().getUser(userID).then(user => {
    return admin.auth().setCustomUserClaims(userID, {...user.customClaims, ...customClaims})
  })

  // set profile based on userPreset
  const updatePromise = db.collection('users').doc(userID).update({
    grade: presetData.grade,
    id: presetData.id,
    name: presetData.name,
    firstName: presetData.firstName,
    lastName: presetData.lastName,
    teacher: presetData.teacher,
  })
  return Promise.all([authPromise, updatePromise])
}

/**
 * Populate a new user's profile with some default data
 * @param {Object} doc Firestore doc object of the new user
 * @returns {Promise}
 */
exports.initializeNewUser = (doc) => {
  return doc.ref.update({
    shouldPopulateCourses: false,
    allowEmail: true,
    uid: doc.id,
  })
}