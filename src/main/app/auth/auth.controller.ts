import {
  Controller,
  Get,
  Post,
  ValidationSchema,
  getEnv,
  sendErrorResponse,
  sendSuccessResponse
} from '@docsploit/espress'
import validate from '@docsploit/espress/lib/schemaValidator'
import type { Response, Request, NextFunction } from 'express'
import Users, { UserModel } from '../user/user.model'
import { hashPassword, sendMail } from '../../utils/wrapper'
import passport from 'passport'
import signupTemplate from '../../utils/email_templates/signup.template'
import { sign, verify } from 'jsonwebtoken'
import forgotPasswordTemplate from '../../utils/email_templates/forgotPassword.template'
import { registerSchema } from './auth.model'

/**
 * @name Authentication
 * @desc "Login, Signup, auth workflows"
 */
@Controller('/auth')
export default class Auth {
  /**
   * @name Login
   * @desc login with email and password
   * @param req
   * @param res
   * @param next
   * @returns
   */
  @Post('/login')
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      return passport.authenticate('local', (err, user, info) => {
        if (err) {
          return next(err)
        }

        if (!user) {
          return res.status(401).json({ message: info.message })
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(err)
          }
          let user = req.user as UserModel
          user = user.toJSON()
          return sendSuccessResponse('success', { name: user.name, id: user.id }, res)
        })
      })(req, res, next)
    } catch (error) {
      console.log(error)
      return sendErrorResponse(500, 'Internal Server Error', res)
    }
  }
  /**
   * @name Signup
   * @desc Register new user
   */
  @Post('/signup', { schema: registerSchema })
  async signup(req: Request, res: Response) {
    const user = req.body
    try {
      user.password = hashPassword(user.password)
      const response = await Users.create({ ...user, verified: false })
      const verificationTOken = sign(response.id, getEnv('VERIFICATION_SECRET'))
      await sendMail(
        signupTemplate(
          response.name,
          getEnv('DOMAIN') + 'redirect?url=planner://verifyAccount=' + verificationTOken
        ),
        'Verify your email',
        response.email
      )
      return sendSuccessResponse('success', { id: response.id }, res)
    } catch (error: any) {
      console.log(error)
      if (error.name === 'SequelizeUniqueConstraintError') {
        return sendErrorResponse(400, { message: 'User already exists' }, res)
      }
      return sendErrorResponse(500, 'Internal Server Error', res)
    }
  }

  /**
   * @name Forgot Password
   * @desc Allows to reset password a forgot password mail will be sent
   * @param req
   * @param res
   * @returns
   */
  @Post('/forgot-password')
  async forgotPassword(req: Request, res: Response) {
    const schema: ValidationSchema<{ email: string }> = {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' }
      },
      required: ['email']
    }
    const valid = validate(schema, req.body)
    if (valid === true) {
      const { email } = req.body
      try {
        const user = await Users.findOne({ where: { email, verified: true } })
        if (user) {
          const user_json = user.toJSON()
          const verificationTOken = sign({ id: user_json.id }, getEnv('VERIFICATION_SECRET'), {
            expiresIn: '5m'
          })
          await sendMail(
            forgotPasswordTemplate(
              user.name,
              getEnv('DOMAIN') + 'redirect?url=planner://forgotPassword=' + verificationTOken
            ),
            'Reset Password',
            user.email
          )
          return sendSuccessResponse('success', { status: 'SEND' }, res)
        } else {
          return sendErrorResponse(
            400,
            { message: 'No user exist with this email / Account is not verified yet' },
            res
          )
        }
      } catch (error: any) {
        sendErrorResponse(500, 'Internal Server Error', res)
        throw error
      }
    } else {
      return sendErrorResponse(400, { ...valid }, res)
    }
  }
  /**
   * @name Change Password
   * @param req
   * @param res
   * @returns
   */
  @Post('/reset-password')
  async resetPassword(req: Request, res: Response) {
    const schema: ValidationSchema<{ password: string }> = {
      type: 'object',
      properties: {
        password: { type: 'string' }
      },
      required: ['password']
    }
    const valid = validate(schema, req.body)
    if (valid === true) {
      const { password, token } = req.body
      try {
        const { id } = verify(token, getEnv('VERIFICATION_SECRET')) as any
        const user = await Users.findOne({ where: { id } })
        if (user) {
          const hash = hashPassword(password)
          Users.update({ password: hash }, { where: { id } })
          return sendSuccessResponse('success', { status: 'RESET' }, res)
        } else {
          return sendErrorResponse(400, { message: 'Invalid Token' }, res)
        }
      } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
          return sendErrorResponse(400, { message: 'Session Expired' }, res)
        }
        sendErrorResponse(500, 'Internal Server Error', res)
        throw error
      }
    } else {
      return sendErrorResponse(400, { ...valid }, res)
    }
  }
  /**
   * @name logout
   * @param req
   * @param res
   * @returns
   */
  @Get('/logout')
  async logout(req: Request, res: Response) {
    try {
      req.logOut({ keepSessionInfo: false }, (err) => {
        if (err) {
          console.log(err)
          return sendErrorResponse(500, 'Internal Server Error', res)
        }
        return sendSuccessResponse('success', Date.now, res)
      })
    } catch (error) {
      console.log(error)
      return sendErrorResponse(500, 'Internal Server Error', res)
    }
  }
}
