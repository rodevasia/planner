export interface Contributor {
  id: number
  projectId: string
  userId: string
  role: string
  createdAt: string
  updatedAt: string
  project: _Project
  user: User
}

interface _Project {
  id: string
  name: string
  description: string
  estimatedTaskTime: string
  code: string
  status: string
  client: {
    name: string
  }
  createdAt: string
}

interface User {
  id: string
  name: string
  email: string
}
export interface IProject {
  id: string
  name: string
  description: string
  code: string
  status: string
  createdAt: string
  updatedAt: string
  hasActiveSprint: boolean
  currentSprint: CurrentSprint
  percentile: number
  count: Count
  contributors: number[]
  clientId: string
}

interface Count {
  inprogress: number
  completed: number
  todo: number
  total: number
}

interface CurrentSprint {
  id: string
  name: string
  start: string
  end: string
  goals: string[]
}
