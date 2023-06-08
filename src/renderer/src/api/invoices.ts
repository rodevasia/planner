import { network } from './configuration'

export async function getInvoices({ projectId, clientId }) {
  const { data } = await network.get('/invoice', { params: { projectId, clientId } })
  return data
}

export async function generateInvoice(body: any) {
  const { data } = await network.post<{ name: string }>('invoice/generate', JSON.stringify(body))
  return data
}
