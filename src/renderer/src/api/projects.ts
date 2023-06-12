import { Contributor, IProject } from '@renderer/models/Project'
import { network } from './configuration'

export async function getProjects(): Promise<Contributor[]> {
  const { data } = await network.get('/projects')
  return data
}
export async function getProject(id: string): Promise<IProject> {
  const { data } = await network.get(`projects/${id}`, { params: { status: true } })
  return data
}
export async function getProjectLogs(projectId) {
  const { data } = await network.get('/logs', { params: { projectId: projectId } })
  console.log(data)

  return data
}

export async function createProject(body:any) {
  const {data} = await network.post('/projects',JSON.stringify(body));
  return data;
}