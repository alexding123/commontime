const admin = require('firebase-admin')
const db = admin.firestore()

exports.getRoom = id => {
  if (!id) return Promise.resolve({})
  return db.collection('rooms').doc(id).get().then(snap => {
    if (!snap.exists) {
      return Promise.resolve({})
    }
    return snap.data()
  })
}

exports.getPeriod = id => {
  if (!id) return Promise.resolve({})
  return db.collection('periods').doc(id).get().then(snap => {
    if (!snap.exists) {
      return Promise.resolve({})
    }
    return snap.data()
  })
}

exports.getPeriods = () => {
  return db.collection('periods').get().then(docs => {
    const map = {}
    docs.forEach(snap => {
      map[snap.id] = snap.data()
    })
    return map
  })
}

exports.getInstance = (id) => {
  if (!id) return Promise.resolve({})
  return db.collection('instances').doc(id).get().then(snap => {
    if (!snap.exists) {
      return Promise.resolve({})
    }
    return snap.data()
  })
}

exports.getRecurring = (id) => {
  if (!id) return Promise.resolve({})
  return db.collection('recurrings').doc(id).get().then(snap => {
    if (!snap.exists) {
      return Promise.resolve({})
    }
    return snap.data()
  })
}


exports.getTerms = () => db.collection('meta').doc('terms').get().then(snap => snap.data())

exports.getUsers = () => {
  return db.collection('users').get().then(docs => {
    const map = {}
    docs.forEach(snap => {
      map[snap.id] = snap.data()
    })
    return map
  })
}

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

exports.deleteInstanceInvitations = (id) => {
  if (!id) return Promise.resolve()
  return db.collection('invitations').where('instanceID', '==', id).get().then(docs => {
    return Promise.all(docs.docs.map(doc => {
      return doc.ref.delete()
    }))
  })
}

exports.deleteRecurringInvitations = (id) => {
  if (!id) return Promise.resolve()
  return db.collection('invitations').where('recurringID', '==', id).get().then(docs => {
    return Promise.all(docs.docs.map(doc => {
      return doc.ref.delete()
    }))
  })
}

exports.deleteRecurringInstances = (id) => {
  return db.collection('recurrings').doc(id).collection('instances').get().then(docs => {
    const promises = docs.docs.map(doc => {
      return doc.ref.delete()
    })
    return Promise.all(promises)
  })
}
