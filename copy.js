const { execSync } = require('child_process')
const os = require('os')
const path = require('path')
const fse = require('fs-extra')

const srcDir = path.resolve('src/main/static')
const destDir = path.resolve('out/main/static')

const src = path.resolve('.espressive')
const dest = path.resolve('out/main/.espressive')

fse.copySync(src, dest)
fse.copySync(srcDir, destDir)
console.log('File copied successfully')
