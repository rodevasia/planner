export interface Issues {
  duration: string
  id: string
  issue: string
  description: string
  attachments: string[]
  status: string
  points: string
  code: string
  sprintId: string
  projectId: string
  createdAt: string
  updatedAt: string
}

export enum TaskStatus {
  TODO = 'TODO',
  INPROGRESS = 'INPROGRESS',
  DONE = 'DONE'
}
