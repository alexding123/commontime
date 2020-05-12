const admin = require('firebase-admin')
const functions = require('firebase-functions')
admin.initializeApp()

exports.auth = require('./auth')
exports.db = require('./db')
exports.upload = require('./upload')
exports.calendar = require('./calendar')
exports.emails = require('./emails')