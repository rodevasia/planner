import { project } from '@renderer/store'
import { network } from './configuration'
import { Sprint } from '@renderer/models/Sprint'

export async function getSprints() {
  const { data } = await network.get('/sprints', { params: { projectId: project.id } })
  return data
}

export async function createSprints(body: Partial<Sprint>) {
  await network.post('/sprints', JSON.stringify(body))
}
