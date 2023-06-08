export interface Sprint {
  id: string
  name: string
  startDate: Date
  endDate: Date
  status: string
  goals: string[] | string
  projectId: string
  createdAt: Date
  updatedAt: Date
}

export enum SprintStatus {
  COMPLETED = 'COMPLETED',
  INPROGRESS = 'INPROGRESS',
  NOT_STARTED = 'NOT STARTED',
  OVERDUE = 'OVERDUE'
}
