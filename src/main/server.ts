import { Server, getEnv, sendErrorResponse, sendSuccessResponse } from '@docsploit/espress'
import sessionStore from 'connect-session-sequelize'
import session from 'express-session'
import passport from 'passport'
import { sequelize } from './utils/database'
import { app as eapp } from 'electron'
import { downloadFromBucket } from './utils/uploader'
import { UserModel } from './app/user/user.model'
import { dialog } from 'electron'
import { existsSync, writeFileSync } from 'fs'
import path from 'path'

import { authenticated } from './utils/auth'
import('./app/auth/auth.controller')
import('./app/user/user.controller')
import('./app/clients/clients.controller')
import('./app/projects/projects.controller')
import('./app/sprints/sprints.controller')
import('./app/tasks/tasks.controller')
import('./app/project_logs/project_logs.controller')
import('./app/invoice/invoice.controller')

const server = new Server('Planner', {
  cors: {
    origin: ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'OPTIONS', 'DELETE']
  }
})

const { app } = server
const SequelizeStore: any = sessionStore(session.Store)

if (sequelize) {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'secret',
      resave: false,
      saveUninitialized: false,
      store: new SequelizeStore({ db: sequelize }),
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hour
        httpOnly: false,
        secure: false,
        sameSite: 'lax'
      }
    })
  )
  if (!existsSync(path.join(eapp.getPath('userData'), '_Session.completed'))) {
    sequelize.sync({ alter: true }).then(() => {
      writeFileSync(
        path.join(eapp.getPath('userData'), '_Session.completed'),
        Math.random().toString()
      )
    })
  }
}

app.use(passport.initialize())
app.use(passport.session())
//register controllers here eg: server.register(ExampleController)

// server.register(Auth)
// server.register(Client)
// server.register(Projects)
// server.register(Sprints)
// server.register(Tasks)
// server.register(Project_logs)
// server.register(Invoice)
app.use('/assets', server.express.static(path.join(__dirname, '..', 'renderer', 'assets')))
app.get('/app', async (req, res) => {
  try {
    return res.sendFile(path.join(__dirname, '..', 'renderer', 'index.html'))
  } catch (error) {
    console.log(error)
    return sendErrorResponse(500, 'Internal Server Error', res)
  }
})

app.get('/', (req, res) => {
  try {
    if (req.user) {
      const user = (req.user as UserModel).toJSON()
      sendSuccessResponse(
        'success',
        { path: '/user/projects', user: { name: user.name, id: user.id } },
        res
      )
    } else {
      sendSuccessResponse('success', { path: '/auth/login' }, res)
    }
  } catch (error) {
    console.log(error)
    return sendErrorResponse(500, 'internal Error', res)
  }
})

app.get('/redirect/', (req, res) => {
  if (req.query.url) {
    return res.redirect(req.query.url as string)
  }
  return res.end('don')
})
app.get('/uploads/:id', async (req, res) => {
  try {
    const blob = await downloadFromBucket(req.params.id.split('_')[0], req.params.id)
    res.set('Content-Type', blob.type)
    const arrBuff = await blob.arrayBuffer()
    return res.end(Buffer.from(arrBuff))
  } catch (error) {
    console.log(error)
    return sendErrorResponse(500, 'Internal Server Error', res)
  }
})

app.get('/invoices/:id', [authenticated], async (req, res) => {
  try {
    const blob = await downloadFromBucket('invoices', req.params.id)
    const dialogResp = await dialog.showSaveDialog({
      defaultPath: `${req.params.id}.pdf`
    })
    if (dialogResp.canceled) {
      return sendErrorResponse(400, 'Canceled by User', res)
    }
    if (!dialogResp.canceled && dialogResp.filePath) {
      const buffer = Buffer.from(await blob.arrayBuffer())
      writeFileSync(dialogResp.filePath!, buffer)
      return sendSuccessResponse('success', null, res)
    }
    return sendErrorResponse(400, 'Something went wrong', res)
  } catch (error) {
    console.log(error)
    return sendErrorResponse(500, 'Internal Server Error', res)
  }
})
// add code here

server.run({ port: getEnv('PORT'), apiDocs: false })
