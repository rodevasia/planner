import { DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize'
import { v4 } from 'uuid'
import { sequelize } from '../../utils/database'
import Clients from '../clients/clients.model'

export interface Project {
  name: string
  description: string
  code: string
  status: string
  clientId: string
}
// Any model related works should be done here.

export interface ProjectsModel
  extends Model<InferAttributes<ProjectsModel>, InferCreationAttributes<ProjectsModel>>,
    Project {
  id: string
}

const Projects = sequelize!.define<ProjectsModel>('projects', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: () => v4()
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Clients,
      key: 'id'
    }
  }
})
Clients.hasMany(Projects)
Projects.belongsTo(Clients)
export default Projects
