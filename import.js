const firestoreService = require('@crapougnax/firestore-export-import')
const path = require('path')

// list of JSON files generated with the export service
// Must be in the same folder as this script
const collections = ['courses', 'instances', 'invitations', 'meta', 'periods', 'recurrings', 'rooms', 'userPreset', 'users']

// Start your firestore emulator for (at least) firestore
// firebase emulators:start --only firestore

// Initiate Firebase Test App
const db = firestoreService.initializeTestApp('test', {
   uid: 'TUIrTRZ6bfbLnhniuHrFBKYfFrm1',
   email: 'alding@commschool.org',
})

// Start importing your data
let promises = []
try {
   collections.map(collection =>
      promises.push(
         firestoreService.fixtures(
            path.resolve(__dirname, `.test/${collection}.json`),
            [],
            [],
            db,
         ),
      ),
   )
   Promise.all(promises).then(process.exit)
} catch (err) {
   console.error(err)
}