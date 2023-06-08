import { verify } from 'jsonwebtoken'
import Users from '../user/user.model'
import { getEnv } from '@docsploit/espress'

export async function verifyAccount(token: string) {
  try {
    const id = verify(token, getEnv('VERIFICATION_SECRET'))
    const user = await Users.findOne({ where: { id } })
    if (user) {
      user.verified = true
      await user.save()
      return { verify: true, email: user.email }
    } else {
      return false
    }
  } catch (error: any) {
    console.log(error)

    return false
  }
}

export async function verifyForgotPasswordToken(token) {
  try {
    const { id } = verify(token, getEnv('VERIFICATION_SECRET')) as { id: string }
    const user = await Users.findOne({ where: { id } })
    if (user) {
      return { token }
    } else {
      return 'Failed to Verify'
    }
  } catch (error: any) {
    console.log(error)

    if (error.name === 'TokenExpiredError') {
      return 'Expired'
    } else return 'Failed to Verify'
  }
}
