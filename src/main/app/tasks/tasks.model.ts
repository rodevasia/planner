import { Model, InferAttributes, InferCreationAttributes, DataTypes } from 'sequelize'
import { v4 } from 'uuid'
import { sequelize } from '../../utils/database'
import Projects from '../projects/projects.model'
import Sprints from '../sprints/sprints.model'

export interface Task {
  issue: string
  description: string
  code: string
  attachments: string[]
  duration: string
  status: TaskStatus
  billed: boolean
}

export enum TaskStatus {
  TODO = 'TODO',
  INPROGRESS = 'INPROGRESS',
  DONE = 'DONE'
}

export interface TaskModel
  extends Model<InferAttributes<TaskModel>, InferCreationAttributes<TaskModel>>,
    Task {
  id: string
  sprintId: string
  projectId: string
}

const Tasks = sequelize.define<TaskModel>('task', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: () => v4()
  },
  issue: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING
  },
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  duration: {
    type: DataTypes.STRING
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  billed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sprintId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'sprints',
      key: 'id'
    }
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  }
})

Sprints.hasMany(Tasks, { onDelete: 'CASCADE' })
Projects.hasMany(Tasks, { onDelete: 'CASCADE' })

export default Tasks

export const getTaskQuerySchema: any = {
  type: 'object',
  required: [],
  properties: {
    billed: {
      type: 'string'
    },
    code: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    duration: {
      type: 'string'
    },
    issue: {
      type: 'string'
    },
    status: {
      type: 'string'
    },
    page: {
      type: 'string'
    },

  }
}
