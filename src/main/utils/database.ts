import { getEnv } from '@docsploit/espress'
import { is } from '@electron-toolkit/utils'
import { Sequelize } from 'sequelize'
process.env.DATABASE =
  'postgresql://postgres:ytUTobmZzMnc7vVj@db.svqaxlmmnnxzxyxsnpaw.supabase.co:5432/postgres'
process.env.VERIFICATION_SECRET = '12345'
process.env.DOMAIN = 'http://localhost:6453/'
process.env.EMAIL_PASSWORD = 'thflfirfzujgyogc'
process.env.EMAIL_USERNAME = 'robertdevasia64@gmail.com'
process.env.PORT = '6453'
const acutalcw = process.cwd;
process.cwd = () => (is.dev ? acutalcw() : __dirname)
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
