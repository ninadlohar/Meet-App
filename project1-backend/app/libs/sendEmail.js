const nodemailer = require('nodemailer')

let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: 'ninad.lohar94@gmail.com',
    pass: 'fmuxehrmosrmkpmd'
  }
})

let mailOptions = {
  from: 'admin@kovacs.in',
  to: '',
  html: ''
}

let sendEmail = (email, content) => {
  mailOptions.to = email
  mailOptions.html = content
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Email Sent' + info.response);
    }
  })
}

module.exports = {
  sendEmail: sendEmail
}