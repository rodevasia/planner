import { ValidationSchema } from '@docsploit/espress'
import Clients, { ClientsType } from '../clients/clients.model'
import { Task } from '../tasks/tasks.model'
import { InvoiceAdditions } from './invoicePdf'
import { sequelize } from '../../utils/database'
import { DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model } from 'sequelize'
import Users from '../user/user.model'
import Projects from '../projects/projects.model'

export type InvoiceType = {
  client: ClientsType
  tasks: Task[]
}

// Any model related works should be done here.
interface InvoiceModel
  extends Model<InferAttributes<InvoiceModel>, InferCreationAttributes<InvoiceModel>> {
  name: string
  userId: ForeignKey<string>
  clientId: ForeignKey<string>
  projectId: ForeignKey<string>
}
export const InvoiceModel = sequelize!.define<InvoiceModel>('invoice', {
  name: {
    type: DataTypes.STRING
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: Users,
      key: 'id'
    }
  },
  clientId: {
    type: DataTypes.UUID,
    references: {
      model: Clients,
      key: 'id'
    }
  },
  projectId: {
    type: DataTypes.UUID,
    references: {
      model: Projects,
      key: 'id'
    }
  }
})
InvoiceModel.belongsTo(Users)
InvoiceModel.belongsTo(Projects)
InvoiceModel.belongsTo(Clients)
Users.hasMany(InvoiceModel)
Projects.hasMany(InvoiceModel)
Clients.hasMany(InvoiceModel)

export const invoicePostSchema: ValidationSchema<{
  accountDetails: string
  clientId: string
  projectId: string
  due: string
  additionalFields: InvoiceAdditions[]
  tasks: string[]
}> = {
  type: 'object',
  properties: {
    accountDetails: {
      type: 'string'
    },
    clientId: {
      type: 'string'
    },
    due: {
      type: 'string'
    },
    projectId: {
      type: 'string'
    },
    tasks: { type: 'array', items: { type: 'string' } },
    additionalFields: {
      type: 'array',
      items: {
        required: ['field', 'type', 'value'],
        properties: {
          field: { type: 'string' },
          type: { type: 'string' },
          value: { type: 'string' }
        },
        type: 'object'
      }
    }
  },
  required: ['accountDetails', 'clientId', 'due', 'projectId']
}

export const getInvoiceSchema: ValidationSchema<{ clientId: string; projectId: string }> = {
  required: [],
  type: 'object',
  properties: {
    clientId: {
      type: 'string'
    },
    projectId: {
      type: 'string'
    }
  }
}
