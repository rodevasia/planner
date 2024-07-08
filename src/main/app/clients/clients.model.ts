import { DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model } from 'sequelize'
import { sequelize } from '../../utils/database'
import Users from '../user/user.model'
import { ValidationSchema } from '@docsploit/espress'
import { v4 } from 'uuid'

export type ClientsType = {
  name: string
  company: string
  address: string
  pincode: string
  country: string
  city: string
  email: string
  phone: string
}

export interface ClientModel
  extends Model<InferAttributes<ClientModel>, InferCreationAttributes<ClientModel>>,
    ClientsType {
  id: string
  userId: ForeignKey<string>
}
// Any model related works should be done here.
const Clients = sequelize!.define<ClientModel>('client', {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: () => v4()
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: Users,
      key: 'id'
    }
  }
})
export default Clients
Clients.belongsTo(Users, { foreignKey: 'userId' })
Users.hasMany(Clients, { foreignKey: 'userId' })

export const clientSchema: ValidationSchema<ClientsType> = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    company: { type: 'string' },
    address: { type: 'string' },
    pincode: { type: 'string' },
    country: { type: 'string' },
    city: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' }
  },
  additionalProperties: false,
  required: ['name', 'company', 'address', 'pincode', 'country', 'city', 'email', 'phone']
}
