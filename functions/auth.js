const functions = require('firebase-functions')
const admin = require('firebase-admin')
const db = admin.firestore()
const { calendar, auth } = require('./utils/calendar')
const { getUserPresetByEmail } = require('./utils/db')

exports.onCreate = functions.auth.user().onCreate(async (user, context) => {
  if (user.email.split('@')[1] !== 'commschool.org') {
    await admin.auth().deleteUser(user.uid)
    throw new functions.https.HttpsError('invalid-argument', 'User email must be under the commschool.org domain.')
  }

  const userPreset = await 
  getUserPresetByEmail(user.email)
  if (Object.keys(userPreset).length === 0 && userPreset.constructor === Object) {
    await admin.auth().deleteUser(user.uid)
    throw new functions.https.HttpsError('not-found', 'User with this email not found in the uploaded users file.')
  }

  const customClaims = {
    admin: false,
  }
  await admin.auth().setCustomUserClaims(user.uid, {...user.customClaims, ...customClaims})
})

exports.onDelete = functions.auth.user().onDelete(async (user, context) => {
  const profile = await db.collection('users').doc(user.uid).get()
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
  await db.collection('users').doc(user.uid).delete()
})

exports.listAdmins = functions.https.onCall(async (data, context) => {
  if (!context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can list all admins.')
  }

  const users = (await admin.auth().listUsers()).users

  const adminUsers = users.filter(user => user.customClaims.admin)
  return adminUsers.map(user => ({
    email: user.email,
    id: user.uid,
    name: user.displayName,
  }))
})

exports.addAdmin = functions.https.onCall(async (data, context) => {
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
})

exports.relinquishAdmin = functions.https.onCall(async (data, context) => {
  if (!context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can relinquish their own privileges.')
  }
  const user = await admin.auth().getUser(context.auth.uid)

  await admin.auth().setCustomUserClaims(user.uid, {
    ...user.customClaims,
    admin: false
  })
  return
})