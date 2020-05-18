const Sentry = require('@sentry/node')
const functions = require('firebase-functions')

/**
 * Set up Sentry for error reporting
 */
if (functions.config().sentry && functions.config().sentry.dsn) {
  Sentry.init({ dsn: functions.config().sentry.dsn })
} else {
  console.warn(
    "/!\\ sentry.dsn environment variable not found. Skipping setting up Sentry..."
  );
}

const admin = require('firebase-admin')
admin.initializeApp()


exports.auth = require('./auth')
exports.db = require('./db')
exports.upload = require('./upload')
exports.calendar = require('./calendar')
exports.emails = require('./emails')