import { network } from './configuration'

export async function getClients() {
  const { data } = await network.get('/clients')
  return data
}

export async function getClient(id: string) {
  return await network.get<{ name: string; id: string; company: string }>(`clients/${id}`)
}
export async function createClient(body: Partial<{ name: string; company: string }>) {
  const { data } = await network.post('clients', JSON.stringify(body))
  return data
}
export async function updateClient(data: Partial<any>) {
  const body = { ...data }
  delete body.id
  delete body.createdAt
  delete body.updatedAt
  delete body.userId
  return await network.put(`clients/${data.id}`, JSON.stringify(body))
}
export async function deleteClient(id: string) {
  return await network.delete(`clients/${id}`)
}
