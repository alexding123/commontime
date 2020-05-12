const functions = require('firebase-functions')
const admin = require('firebase-admin')
const db = admin.firestore()
const { applyPreset } = require('./utils/preset') 

const applyUsers = (data) => {
  let dataMap = {}
  data.forEach(datum => {
    dataMap[datum.email] = datum
  })
  return db.collection('users').get().then((docs) => {
    const promises = docs.docs.map(doc => {
      const data = doc.data()
      const presetData = dataMap[data.email]
      if (presetData) {
        return applyPreset(doc, presetData)
      } else {
        return Promise.resolve()
      }
    })
    return Promise.all(promises)
  })
}

exports.users = functions.https.onCall((data, context) => {
  if (!context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can upload assets')
  }
  const deletePromise = db.collection('userPreset').get().then(docs => {
    const promises = docs.docs.map(doc => {
      return doc.ref.delete()
    })
    return Promise.all(promises)
  })
  
  return deletePromise.then(() => {
    const userData = data.data
    const promises = userData.map(data => {
      return db.collection('userPreset').doc(data.email.toLowerCase()).set(data)
    })
    return Promise.all(promises).then(() => {
      return applyUsers(userData)
    }).catch(e => {throw e})
  }).catch(e => {throw e})
})

exports.periods = functions.https.onCall((data, context) => {
  if (!context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can upload periods')
  }
  const deletePromise = db.collection('periods').get().then(docs => {
    const promises = docs.docs.map(doc => {
      return doc.ref.delete()
    })
    return Promise.all(promises)
  })
  
  return deletePromise.then(() => {
    const periods = data.data
    const promises = periods.map(data => {
      const id = `${data.day}-${data.period}`
      return db.collection('periods').doc(id).set(data)
    })
    return Promise.all(promises)
  }).then(() => {
    return db.collection('courses').get()
  }).then(docs => {
    const promises = docs.docs.map(doc => {
      return doc.ref.delete().then(() => {
        return doc.ref.set(doc.data())
      })
    })
    return Promise.all(promises)
  }).catch(e => {throw e})
})

exports.rooms = functions.https.onCall((data, context) => {
  if (!context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can upload rooms')
  }
  const deletePromise = db.collection('rooms').get().then(docs => {
    const promises = docs.docs.map(doc => {
      return doc.ref.delete()
    })
    return Promise.all(promises)
  })
  
  return deletePromise.then(() => {
    const periods = data.data
    const promises = periods.map(data => {
      const id = data.id
      return db.collection('rooms').doc(id).set(data)
    })
    return Promise.all(promises)
  }).catch(e => {throw e})
})

exports.courses = functions.https.onCall(async (data, context) => {
  if (!context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can upload rooms')
  }

  // mark that an upload is happening
  await db.collection('meta').doc('internal').update({
    isUploading: true,
  })

  // delete all existing courses
  await db.collection('courses').get().then(docs => {
    const promises = docs.docs.map(doc => {
      return doc.ref.delete()
    })
    return Promise.all(promises)
  })

  // set meta
  const handleDate = (d) => {
    const newD = new Date(Date.parse(d))
    return new Date(newD.toDateString())
  }
  await db.collection('meta').doc('terms').set({
    fallStart: handleDate(data.terms.fallStart),
    fallEnd: handleDate(data.terms.fallEnd),
    winterStart: handleDate(data.terms.winterStart),
    winterEnd: handleDate(data.terms.winterEnd),
    springStart: handleDate(data.terms.springStart),
    springEnd: handleDate(data.terms.springEnd),
    daylightEnd: handleDate(data.terms.daylightEnd),
    daylightStart: handleDate(data.terms.daylightStart),
  })

  const courses = data.data
  const promises = courses.map(course => {
    return db.collection('courses').doc(course.id).set(course)
  })
  await Promise.all(promises)


  await db.collection('users').get().then(docs => {
    const promises = docs.docs.map(doc => {
      return doc.ref.update({
        shouldPopulateCourses: true,
      })
    })
    return Promise.all(promises)
  })

  const sleep = async (time) => {
    await new Promise(resolve => setTimeout(resolve, time))
  }

  await sleep(1000 * 15)

  await db.collection('meta').doc('internal').update({
    isUploading: false,
  })
})