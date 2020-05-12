const admin = require('firebase-admin')

exports.applyPreset = (doc, presetData) => {
  const customClaims = {
    teacher: presetData.teacher,
  }
  const authPromise = admin.auth().getUser(doc.id).then(user => {
    return admin.auth().setCustomUserClaims(doc.id, {...user.customClaims, ...customClaims})
  })
  const updatePromise = doc.ref.update({
    grade: presetData.grade,
    id: presetData.id,
  })
  return Promise.all([authPromise, updatePromise])
}

exports.initializeNewUser = (doc) => {
  return doc.ref.update({
    shouldPopulateCourses: false,
    allowEmail: true,
  })
}