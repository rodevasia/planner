import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { compare } from 'bcrypt'
import { Request, Response, NextFunction } from 'express'
import Users from '../app/user/user.model'
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const user = await Users.findOne({ where: { email } })

        if (!user) {
          return done(null, false, { message: 'Incorrect email or password.' })
        }
        if (!user.verified) {
          return done(null, false, { message: 'Account is not verified' })
        }
        const isPasswordValid = await compare(password, user.password)

        if (!isPasswordValid) {
          return done(null, false, { message: 'Incorrect email or password.' })
        }

        return done(null, user)
      } catch (error) {
        console.log(error)

        return done(error)
      }
    }
  )
)

passport.serializeUser((user: any, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await Users.findByPk(id)
    done(null, user)
  } catch (error) {
    done(error)
  }
})

export const authenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.status(401).json({ message: 'You are not authenticated!' })
}
