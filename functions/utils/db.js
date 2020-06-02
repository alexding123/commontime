/**
 * Helper functions for Cloud Firestore operations
 */

const admin = require('firebase-admin')
const db = admin.firestore()

/**
 * Helper function to get a room by ID, returning an empty object if not found
 * @param {string} id ID of the room
 * @returns {Promise}
 */
exports.getRoom = id => {
  if (!id) return Promise.resolve({})
  return db.collection('rooms').doc(id).get().then(snap => {
    if (!snap.exists) {
      return Promise.resolve({})
    }
    return snap.data()
  })
}

/**
 * Helper function to get a period by ID, returning an empty object if not found
 * @param {string} id ID of the period
 * @returns {Promise}
 */
exports.getPeriod = id => {
  if (!id) return Promise.resolve({})
  return db.collection('periods').doc(id).get().then(snap => {
    if (!snap.exists) {
      return Promise.resolve({})
    }
    return snap.data()
  })
}

/**
 * Helper function to get all periods in the system
 * @returns {Promise}
 */
exports.getPeriods = () => {
  return db.collection('periods').get().then(docs => {
    const map = {}
    docs.forEach(snap => {
      map[snap.id] = snap.data()
    })
    return map
  })
}

/**
 * Helper function to get an instance by ID, returning an empty object if not found
 * @param {string} id ID of the instance
 * @returns {Promise}
 */
exports.getInstance = (id) => {
  if (!id) return Promise.resolve({})
  return db.collection('instances').doc(id).get().then(snap => {
    if (!snap.exists) {
      return Promise.resolve({})
    }
    return snap.data()
  })
}

/**
 * Helper function to get a recurring meeting by ID, returning an empty object if not found
 * @param {string} id ID of the recurring meeting
 * @returns {Promise}
 */
exports.getRecurring = (id) => {
  if (!id) return Promise.resolve({})
  return db.collection('recurrings').doc(id).get().then(snap => {
    if (!snap.exists) {
      return Promise.resolve({})
    }
    return snap.data()
  })
}

/**
 * Helper function to get all the terms values
 * @returns {Promise}
 */
exports.getTerms = () => db.collection('meta').doc('terms').get().then(snap => snap.data())

/**
 * Helper function to get all users
 * @returns {Promise}
 */
exports.getUsers = () => {
  return db.collection('users').get().then(docs => {
    const map = {}
    docs.forEach(snap => {
      map[snap.id] = snap.data()
    })
    return map
  })
}

/**
 * Helper function to get an user by ID, returning an empty object if not found
 * @param {string} id ID of the user
 * @returns {Promise}
 */
exports.getUserByID = (id) => {
  if (!id) return Promise.resolve({})
  return db.collection('users').where('id', '==', id).get().then(docs => {
    if (docs.size > 1) {
      return Promise.resolve({})
    }
    if (docs.empty) {
      return Promise.resolve({})
    }
    return docs.docs[0].data()
  })
}

/**
 * Helper function to get an user by email, returning an empty object if not found
 * @param {string} email Email of the user
 * @returns {Promise}
 */
exports.getUserByEmail = (email) => {
  if (!email) return Promise.resolve({})
  return db.collection('users').where('email', '==', email).get().then(docs => {
    if (docs.size > 1) {
      return Promise.resolve({})
    }
    if (docs.empty) {
      return Promise.resolve({})
    }
    return docs.docs[0].data()
  })
}

/**
 * Helper function to get a userPreset by ID, returning an empty object if not found
 * @param {string} id ID of the userPreset
 * @returns {Promise}
 */
exports.getUserPresetByID = (id) => {
  if (!id) return Promise.resolve({})
  return db.collection('userPreset').where('id', '==', id).get().then(docs => {
    if (docs.size > 1) {
      return Promise.resolve({})
    }
    if (docs.empty) {
      return Promise.resolve({})
    }
    return docs.docs[0].data()
  })
}

/**
 * Helper function to get a userPreset by email, returning an empty object if not found
 * @param {string} email Email of the userPreset
 * @returns {Promise}
 */
exports.getUserPresetByEmail = (email) => {
  if (!email) return Promise.resolve({})
  return db.collection('userPreset').where('email', '==', email).get().then(docs => {
    if (docs.size > 1) {
      return Promise.resolve({})
    }
    if (docs.empty) {
      return Promise.resolve({})
    }
    return docs.docs[0].data()
  })
}

/**
 * Helper function to delete all invitations associated with an instance
 * @param {string} id ID of the instance
 * @returns {Promise}
 */
exports.deleteInstanceInvitations = (id) => {
  if (!id) return Promise.resolve()
  return db.collection('invitations').where('instanceID', '==', id).get().then(docs => {
    return Promise.all(docs.docs.map(doc => {
      return doc.ref.delete()
    }))
  })
}

/**
 * Helper function to delete all invitations associated with a recurring meeting
 * @param {string} id ID of the recurring meeting
 * @returns {Promise}
 */
exports.deleteRecurringInvitations = (id) => {
  if (!id) return Promise.resolve()
  return db.collection('invitations').where('recurringID', '==', id).get().then(docs => {
    return Promise.all(docs.docs.map(doc => {
      return doc.ref.delete()
    }))
  })
}

/**
 * Helper function to delete all instances of a recurring meeting
 * @param {string} id ID of the recurring meeting
 * @returns {Promise}
 */
exports.deleteRecurringInstances = (id) => {
  return db.collection('recurrings').doc(id).collection('instances').get().then(docs => {
    const promises = docs.docs.map(doc => {
      return doc.ref.delete()
    })
    return Promise.all(promises)
  })
}
