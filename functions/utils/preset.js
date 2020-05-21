const admin = require('firebase-admin')
const db = admin.firestore()

exports.applyPreset = (userID, presetData) => {
  const customClaims = {
    teacher: presetData.teacher,
  }
  const authPromise = admin.auth().getUser(userID).then(user => {
    return admin.auth().setCustomUserClaims(userID, {...user.customClaims, ...customClaims})
  })
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

exports.initializeNewUser = (doc) => {
  return doc.ref.update({
    shouldPopulateCourses: false,
    allowEmail: true,
    uid: doc.id,
  })
}