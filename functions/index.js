const Sentry = require('@sentry/node')
const functions = require('firebase-functions')

/**
 * Set up Sentry for error reporting
 * Disabled in development
 */
if (functions.config().sentry && functions.config().sentry.dsn) {
  const dsn = functions.config().sentry.dsn
  
  Sentry.init({
    // using === because sometimes it might be a string
    dsn: process.env.FUNCTIONS_EMULATOR === true ?
         null : dsn,
  })
} else {
  console.warn(
    "/!\\ sentry.dsn environment variable not found. Skipping setting up Sentry..."
  )
}

const admin = require('firebase-admin')
admin.initializeApp()

/**
 * Export all the exposed Firebase Functions
 */
exports.auth = require('./auth')
exports.db = require('./db')
exports.upload = require('./upload')
exports.calendar = require('./calendar')
exports.emails = require('./emails')
exports.scheduled = require('./scheduled')
