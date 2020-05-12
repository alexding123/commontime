const Email = require('email-templates')
const nodemailer = require('nodemailer')
const functions = require('firebase-functions')
const { getUserByEmail } = require('./db')

const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().mail.email,
    pass: functions.config().mail.password,
  }
})

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