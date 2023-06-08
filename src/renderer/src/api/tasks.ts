import { Issues, TaskStatus } from '@renderer/models/Tasks'
import { network } from './configuration'

export async function getTasks(
  projectId: string,
  sprintId?: string,
  page?: number
): Promise<{ rows: Issues[]; count: number }> {
  const { data } = await network.get('/tasks', { params: { projectId, sprintId, page } })
  return data
}

export async function getTasksForGen(
  projectId: string,
  sprintId?: string,
  page?: number
): Promise<{ rows: Issues[]; count: number }> {
  const { data } = await network.get('/tasks', {
    params: { projectId, sprintId, page, status: TaskStatus.DONE, billed: false }
  })
  return data
}

export async function createTask(body: any): Promise<Issues> {
  const { data } = await network.post('/tasks', body)
  return data
}

export async function getTask(id: string): Promise<Issues> {
  const { data } = await network.get(`/tasks/${id}`)
  return data
}

export async function updateTask(
  body: Partial<Issues>,
  id: string,
  action: 'status' | 'pause' | 'stop' | 'first_stop' | 'first_pause'
) {
  const { data } = await network.put(`/tasks/${id}`, JSON.stringify(body), { params: { action } })
  return data
}

export async function deleteTask(
  id: string,
  query: { projectId: string; status: string; code: string }
) {
  return network.delete<Issues>(`/tasks/${id}`, { params: query })
}
