const functions = require('firebase-functions')
const { sendEmail } = require('./utils/email')
const { dayMap } = require('./utils/constants')
const admin = require('firebase-admin')
const date = require('date-and-time')
const db = admin.firestore()

exports.roomRebooked = functions.https.onCall((data, context) => {
  if (!context.auth.token.admin || !context.auth.token.teacher) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins and teachers can rebook rooms')
  }

  let instance = null
  let by = null
  try {
    instance = data.instance
    by = data.by
  } catch (e) {
    throw new functions.https.HttpsError('invalid-argument', "Must supply instance and by arguments")
  }

  const getUser = db.collection('users').where('id', '==', instance.creator).get().then(doc => {
    if (doc.empty) {
      throw new functions.https.HttpsError('invalid-argument', "Instance creator does not exist")
    }
    if (doc.size > 1) {
      throw new Error("Database has multiple users with the same ID")
    }
    const data = doc.docs[0].data()
    return data
  })

  const getByUser = db.collection('users').where('id', '==', by).get().then(doc => {
    if (doc.empty) {
      throw new functions.https.HttpsError('invalid-argument', "The user rebooking the room does not exist")
    }
    if (doc.size > 1) {
      throw new Error("Database has multiple users with the same ID")
    }
    const data = doc.docs[0].data()
    return data
  })
  
  const getRoom = db.collection('rooms').doc(instance.room).get().then(doc => {
    if (!doc.exists) {
      throw new functions.https.HttpsError('invalid-argument', 'Instance room does not exist')
    }
    return doc.data()
  })

  const getPeriod = db.collection('periods').doc(instance.period).get().then(doc => {
    if (!doc.exists) {
      throw new functions.https.HttpsError('invalid-argument', 'Instance period does not exist')
    }
    return doc.data()
  })

  

  return Promise.all([getUser, getByUser, getRoom, getPeriod]).then(([user, byUser, room, period]) => {
    return sendEmail(user.email, "roomRebooked", {
      roomName: room.name,
      periodName: period.name,
      date: instance.date,
      byName: byUser.name,
    })
  })
})

exports.meetingScheduled = functions.https.onCall((data, context) => {
  if (!context.auth.token.admin || !context.auth.token.teacher) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins and teachers can notify meetings')
  }

  let instanceID = null
  let person = null
  try {
    instanceID = data.instanceID
    person = data.person
  } catch (e) {
    throw new functions.https.HttpsError('invalid-argument', "Must supply instanceID and person arguments")
  }

  const getInstance = db.collection('instances').doc(instanceID).get().then(doc => {
    if (!doc.exists) {
      throw new functions.https.HttpsError('invalid-argument', `Instance ${instanceID} not found`)
    }
    return doc.data()
  })

  const getParticipant = db.collection('userPreset').where('id', '==', person).get().then(doc => {
    if (doc.empty) {
      throw new functions.https.HttpsError('invalid-argument', `Person ${person} not found`)
    }
    if (doc.size > 1) {
      throw new Error("Database has multiple users with the same ID")
    }
    const data = doc.docs[0].data()
    return data
  })

  const getCreator = getInstance.then(instance => {
    return db.collection('userPreset').where('id', '==', instance.creator).get().then(doc => {
      if (doc.empty) {
        throw new functions.https.HttpsError('invalid-argument', `Instance creator, ${instance.creator}, does not exist`)
      }
      if (doc.size > 1) {
        throw new Error("Database has multiple users with the same ID")
      }
      const data = doc.docs[0].data()
      return data
    })
  })
  
  const getPeriod = getInstance.then(instance => {
    return db.collection('periods').doc(instance.period).get().then(doc => {
      if (!doc.exists) {
        throw new Error("Period not found")
      }
      return doc.data()
    })
  })

  const getRoomName = getInstance.then(instance => {
    if (instance.room) {
      return db.collection('rooms').doc(instance.room).get().then(doc => {
        if (!doc.exists) {
          throw new Error("Room not found")
        }
        return doc.data().name
      })
    } else {
      return instance.roomName
    }
  })

  return Promise.all([getInstance, getCreator, getParticipant, getPeriod, getRoomName]).then(([instance, creator, participant, period, roomName]) => {
    return sendEmail(participant.email, 'oneoffMeetingNotify', {
      creatorName: creator.name,
      dayName: dayMap[period.day],
      periodName: period.name,
      dateName: date.format(date.parse(instance.date, 'MM/DD/YYYY'), 'MMMM DD'),
      roomName: roomName,
      name: instance.name,
    })
  })
})

exports.recurringMeetingScheduled = functions.https.onCall(async (data, context) => {
  if (!context.auth.token.admin || !context.auth.token.teacher) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins and teachers can notify meetings')
  }

  let recurringID = null
  let person = null
  try {
    recurringID = data.recurringID
    person = data.person
  } catch (e) {
    throw new functions.https.HttpsError('invalid-argument', "Must supply recurringID and person arguments.")
  }

  const recurring = await db.collection('recurrings').doc(recurringID).get().then(doc => {
    if (!doc.exists) {
      throw new functions.https.HttpsError('invalid-argument', `Recurring ${recurringID} not found.`)
    }
    return doc.data()
  })

  const participant = await db.collection('userPreset').where('id', '==', person).get().then(doc => {
    if (doc.empty) {
      throw new functions.https.HttpsError('invalid-argument', `Person ${person} not found.`)
    }
    if (doc.size > 1) {
      throw new functions.https.HttpsError('internal', "Database has multiple users with the same ID.")
    }
    const data = doc.docs[0].data()
    return data
  })

  const creator = await db.collection('userPreset').where('id', '==', recurring.creator).get().then(doc => {
    if (doc.empty) {
      throw new functions.https.HttpsError('invalid-argument', `Instance creator, ${recurring.creator}, does not exist.`)
    }
    if (doc.size > 1) {
      throw new functions.https.HttpsError('internal', "Database has multiple users with the same ID.")
    }
    const data = doc.docs[0].data()
    return data
  })
  
  const period = await db.collection('periods').doc(recurring.period).get().then(doc => {
    if (!doc.exists) {
      throw new functions.https.HttpsError('internal', "Period pointed by recurring event not found.")
    }
    return doc.data()
  })

  const roomName = recurring.room ?
    await db.collection('rooms').doc(recurring.room).get().then(doc => {
      if (!doc.exists) {
        throw new functions.https.HttpsError('internal', "Room pointed by recurring event not found.")
      }
      return doc.data().name
    }) : recurring.roomName

  return sendEmail(participant.email, 'recurringMeetingNotify', {
    creatorName: creator.name,
    dayName: dayMap[period.day],
    periodName: period.name,
    roomName: roomName,
    name: recurring.name,
  })
})