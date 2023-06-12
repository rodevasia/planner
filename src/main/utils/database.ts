import { getEnv } from '@docsploit/espress'
import { Sequelize } from 'sequelize'

export const sequelize = new Sequelize(getEnv('DATABASE'), {
  logging: false,
  dialectOptions: {
    // ssl: true
    connectTimeout: 7500000
  }
})

export async function connectDatabase() {
  try {
    console.log('Connecting database...')

    await sequelize.authenticate()
    // await sequelize.sync({ alter: true });
    console.log('Database Connected')
  } catch (error) {
    console.log('Database Connection Failed')
    throw error
  }
}
