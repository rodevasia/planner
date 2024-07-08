import { network } from './configuration'

export async function login(data: { email: string; password: string }) {
  return network.post('/auth/login', JSON.stringify(data))
}

export async function register(body: any) {
  const { data } = await network.post('/auth/signup', JSON.stringify(body))
  return data
}

export async function forgot(body: any) {
  const { data } = await network.post('/auth/forgot-password', JSON.stringify(body))
  return data
}

export async function resetPassword(body: any) {
  const { data } = await network.post('/auth/reset-password', JSON.stringify(body))
  return data
}

export async function createConnection(body: any) {
  window.electron.ipcRenderer.send('create-connection', body)
}