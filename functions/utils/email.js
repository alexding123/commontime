/**
 * Helper functions and objects for sending emails
 */

const Email = require('email-templates')
const nodemailer = require('nodemailer')
const functions = require('firebase-functions')
const { getUserByEmail } = require('./db')

/**
 * Mail transport object
 */
const mailTransport = nodemailer.createTransport({
  host: "in-v3.mailjet.com", // using mailjet
  port: 587,
  auth: {
    user: functions.config().mail.username,
    pass: functions.config().mail.password,
  }
})

// verify mail connection
try {
mailTransport.verify((error, success) => {
  if (error) {
    throw error
  }
})
} catch (error) {
  if (!error.code) sentry.captureException(error)
  throw error
}

/** 
 * email-templates object
 */
const email = new Email({
  message: {
    from: functions.config().mail.email,
  },
  send: true,
  transport: mailTransport,
})

/**
 * Sends an email of a particular template (populated with supplied values)
 * to an user, if the user's setting allows for emails to be sent
 * @param {string} recipientEmail Email address of the recipient
 * @param {string} template Name of the email template ot use
 * @param {Object} locals Values to populate the variables in the template
 * @returns {Promise}
 */
const sendEmail = (recipientEmail, template, locals) => {
  return getUserByEmail(recipientEmail.toLowerCase()).then(user => {
    // send only if user setting allows
    if (user.allowEmail) {
      return email.send({
        template: template,
        message: {
          to: recipientEmail,
        },
        send: true,
        locals: {
          baseUrl: functions.config().app.url,
          ...locals,
        }
      })
    }
    return Promise.resolve()
  }).catch(console.error)
}

exports.email = email
exports.sendEmail = sendEmail