const { execSync } = require('child_process')
const os = require('os')
const platform = os.platform()
const sourceFile = '.espressive'
const destination = platform === 'win32' ? 'out\\\\main\\\\' : 'out/main/'
const command =
  platform === 'win32' ? `copy ${sourceFile} ${destination}` : `cp ${sourceFile} ${destination}`
execSync(command)
console.log('File copied successfully')
