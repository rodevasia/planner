import { getEnv } from '@docsploit/espress'
import { compareSync, genSaltSync, hashSync } from 'bcrypt'
import { createTransport } from 'nodemailer'

export function hashPassword(password: string) {
  const salt = genSaltSync(10)
  return hashSync(password, salt)
}
export function comparePassword(password: string, hash: string) {
  return compareSync(password, hash)
}

export function sendMail(message: string, subject: string, email: string) {
  const nodemailer = createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      user: getEnv('EMAIL_USERNAME'),
      pass: getEnv('EMAIL_PASSWORD')
    }
  })
  return new Promise((resolve, reject) => {
    nodemailer.sendMail(
      {
        from: getEnv('EMAIL_USERNAME'),
        to: email,
        subject: subject,
        html: message
      },
      (err, info) => {
        if (err) {
          reject(err)
        } else {
          resolve(info)
        }
      }
    )
  })
}
