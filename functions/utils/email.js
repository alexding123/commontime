const Email = require('email-templates')
const nodemailer = require('nodemailer')
const functions = require('firebase-functions')
const { getUserByEmail } = require('./db')

const mailTransport = nodemailer.createTransport({
  host: "in-v3.mailjet.com",
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

const email = new Email({
  message: {
    from: functions.config().mail.email,
  },
  send: true,
  transport: mailTransport,
})

const sendEmail = (recipientEmail, template, locals) => {
  return getUserByEmail(recipientEmail.toLowerCase()).then(user => {
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