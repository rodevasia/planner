import { app, shell, BrowserWindow, dialog, screen, ipcMain } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { getEnv, sendSuccessResponse, Server } from '@docsploit/espress'
import { connect } from 'http2'
import { connectDatabase, sequelize } from './utils/database'
let mainWindow: BrowserWindow

const existStorage = existsSync(path.join(app.getPath('userData'), 'storage.json'))
if (existStorage) {
  const store = JSON.parse(
    readFileSync(path.join(app.getPath('userData'), 'storage.json')).toString()
  )
  process.env.EMAIL_PASSWORD = store.mailerPassword
  process.env.EMAIL_USERNAME = store.email
}
process.env.VERIFICATION_SECRET =
  'c9a2fb272ac1417de942b3d5d5336748e09d863f06c9237577692289ac3e02a452c97f3100e46b5979e398c474'
process.env.DOMAIN = 'http://localhost:6453/'

process.env.PORT = '6453'
const acutalcw = process.cwd
process.cwd = () => (is.dev ? acutalcw() : __dirname)

if (existStorage) {
  connectDatabase().then((res) => {
    if (res) {
      import('./server')
    } else {
      dialog.showMessageBox({ message: 'Failed to connect to the database' })
      app.exit(1)
    }
  })
} else {
  const server = new Server('Syplans', {
    cors: {
      origin: ['http://localhost:5173'],
      credentials: true,
      methods: ['GET']
    }
  })
  server.app.get('/', (req, res) => {
    return sendSuccessResponse('success', { path: '/auth/connection' }, res)
  })

  server.run({ port: getEnv('PORT') })
}

export const documentsPath = app.getPath('documents')

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('planner', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('planner')
}

ipcMain.on('create-connection', async (event, arg) => {
  writeFileSync(path.join(app.getPath('userData'), 'storage.json'), JSON.stringify(arg))
  try {
    const c = await connectDatabase(true)
    if (c) {
      if (sequelize) {
        await import('./app/auth/auth.controller')
        await import('./app/user/user.controller')
        await import('./app/clients/clients.controller')
        await import('./app/projects/projects.controller')
        await import('./app/sprints/sprints.controller')
        await import('./app/tasks/tasks.controller')
        await import('./app/project_logs/project_logs.controller')
        await import('./app/invoice/invoice.controller')
        await sequelize?.sync({ alter: true });
        app.relaunch()
        app.exit(1)
      }
    } else {
      dialog.showMessageBox({ message: 'Failed to connect to the database' })
    }
  } catch (error) {
    console.log(error)
    dialog.showMessageBox({ message: 'Failed to connect to the database' })
  }
})

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
  process.exit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    try {
      // Someone tried to run a second instance, we should focus our window.
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
      // the commandLine is array of strings in which last element is deep link url
      // the url str ends with /
      const lastArg = commandLine[commandLine.length - 1]
      if (lastArg.startsWith('planner://')) {
        if (lastArg) {
          let param = lastArg?.split('planner://')[1]
          param = process.platform === 'win32' ? param.slice(0, param.length - 1) : param
          console.log(param)

          const key = param?.split('=')[0]
          const value = param?.split('=')[1]
          handleDeeplinks(key, value)
        }
      }
    } catch (error) {
      console.log(error)
      process.exit()
    }
  })

  createInvoicesFolder()
  // Create mainWindow, load the rest of the app, etc...
  app.whenReady().then(() => {
    createWindow()
  })
}

function createInvoicesFolder() {
  if (existsSync(path.join(documentsPath, 'Planner'))) {
    if (existsSync(path.join(documentsPath, 'Planner', 'Invoices'))) return
    else {
      mkdirSync(path.join(documentsPath, 'Planner', 'Invoices'))
      return
    }
  } else {
    mkdirSync(path.join(documentsPath, 'Planner'))
    createInvoicesFolder()
  }
}

function createWindow(): void {
  // Create the browser window.
  const display = screen.getPrimaryDisplay()
  const maxiSize = display.workAreaSize
  mainWindow = new BrowserWindow({
    width: maxiSize.width,
    height: maxiSize.height,
    resizable: false,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    if (existStorage) {
      mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/auth/connection')
    }
  } else {
    mainWindow.loadURL('http://localhost:6453/app')
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('io.github.docsploit.planner')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

app.on('open-url', (event, url) => {
  event.preventDefault()
  const param = url.split('planner://')[1]
  const key = param.split('=')[0]
  const value = param.split('=')[1]
  handleDeeplinks(key, value)
})

async function handleDeeplinks(key: string, value: string) {
  process.env.VERIFICATION_SECRET =
    'c9a2fb272ac1417de942b3d5d5336748e09d863f06c9237577692289ac3e02a452c97f3100e46b5979e398c474'

  if (key === 'verifyAccount') {
    const { verifyAccount } = await import('./app/auth/auth.deeplinks')
    const val = await verifyAccount(value)
    if (val) {
      dialog.showMessageBox({ message: `User ${val?.email} has been verified` })
    } else {
      dialog.showMessageBox({ message: 'Failed to verify account' })
    }
  }
  if (key === 'forgotPassword') {
    const { verifyForgotPasswordToken } = await import('./app/auth/auth.deeplinks')
    const res = await verifyForgotPasswordToken(value)
    if (typeof res === 'object') {
      if (mainWindow !== undefined) {
        mainWindow.webContents.send('forgot-password', { path: '/auth/reset', token: res.token })
      }
    } else {
      dialog.showMessageBox({ message: res })
    }
  }
}
