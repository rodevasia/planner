
import { app, shell, BrowserWindow, dialog, screen } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { existsSync, mkdirSync } from 'fs'
let mainWindow: BrowserWindow

process.env.DATABASE =
  'postgresql://postgres:ytUTobmZzMnc7vVj@db.svqaxlmmnnxzxyxsnpaw.supabase.co:5432/postgres'
process.env.VERIFICATION_SECRET = 'c9a2fb272ac1417de942b3d5d5336748e09d863f06c9237577692289ac3e02a452c97f3100e46b5979e398c474'
process.env.DOMAIN = 'http://localhost:6453/'
process.env.EMAIL_PASSWORD = 'thflfirfzujgyogc'
process.env.EMAIL_USERNAME = 'robertdevasia64@gmail.com'
process.env.PORT = '6453'
const acutalcw = process.cwd;
process.cwd = () => (is.dev ? acutalcw() : __dirname)


import('./server')


export const documentsPath = app.getPath('documents')

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('planner', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('planner')
}

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
      const url = commandLine?.pop()!.slice(0, -1)
      if (url) {
        const param = url?.split('planner://')[1]
        const key = param?.split('=')[0]
        const value = param?.split('=')[1]
        handleDeeplinks(key, value)
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
    resizable:false,
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
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
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
  process.env.VERIFICATION_SECRET = 'c9a2fb272ac1417de942b3d5d5336748e09d863f06c9237577692289ac3e02a452c97f3100e46b5979e398c474'
  const param = url.split('planner://')[1]
  const key = param.split('=')[0]
  const value = param.split('=')[1]
  handleDeeplinks(key, value)
})

async function handleDeeplinks(key: string, value: string) {
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
