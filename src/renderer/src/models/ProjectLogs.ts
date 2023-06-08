export interface ProjectLogs {
  id: string
  log: Log
  projectId: string
  userId: string
  createdAt: Date
  updatedAt: Date
  user: User
}

export interface Log {
  action: string
  id: string
  code: string
  item: string
  status?: string
}

export interface User {
  name: string
}
