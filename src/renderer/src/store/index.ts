import { IProject } from '@renderer/models/Project'
import { createStore } from 'solid-js/store'

export const [user, setUser] = createStore<{ name?: string; id?: string }>()

export const [project, setProject] = createStore<IProject>({
  clientId: '',
  code: '',
  contributors: [],
  count: {
    completed: 0,
    inprogress: 0,
    todo: 0,
    total: 0
  },
  createdAt: '',
  currentSprint: {
    end: '',
    goals: [],
    id: '',
    name: '',
    start: ''
  },
  description: '',
  hasActiveSprint: false,
  id: '',
  name: '',
  percentile: 0,
  status: '',
  updatedAt: ''
})
