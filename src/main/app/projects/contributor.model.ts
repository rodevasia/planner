import { DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model } from 'sequelize'
import Users, { UserModel } from '../user/user.model'
import Projects, { ProjectsModel } from './projects.model'
import { sequelize } from '../../utils/database'

interface Contributors
  extends Model<InferAttributes<Contributors>, InferCreationAttributes<Contributors>> {
  projectId: ForeignKey<ProjectsModel['id']>
  userId: ForeignKey<UserModel['id']>
  role: 'OWNER' | 'MEMBER'
}

const Contributors = sequelize.define<Contributors>('contributors', {
  projectId: {
    type: DataTypes.UUID,
    references: {
      model: Projects,
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: Users,
      key: 'id'
    }
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'USER'
  }
})

Users.hasMany(Contributors, { onDelete: 'CASCADE' })
Contributors.belongsTo(Users)
Projects.hasMany(Contributors, { onDelete: 'CASCADE' })
Contributors.belongsTo(Projects)
export default Contributors
