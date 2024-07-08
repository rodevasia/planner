import { app } from 'electron'
import { existsSync, readFileSync } from 'fs'

import path from 'path'
import { Sequelize } from 'sequelize'

function initializeC(){
  if(existsSync(path.join(app.getPath('userData'), 'storage.json'))){
    const store = JSON.parse(readFileSync(path.join(app.getPath('userData'), 'storage.json')).toString())
    const url = `postgresql://${store.username}:${store.password}@${store.host}:5432/${store.db}`
    return new Sequelize(url, {
      logging: false,
      dialectOptions: {
        // ssl: true
        connectTimeout: 7500000
      }
    })
  }

  }
    

export let sequelize = initializeC()

export async function connectDatabase(newWrite=false) {
  try {
    if(sequelize){
      console.log('Connecting database...')

    await sequelize.authenticate()
    console.log('Database Connected');
    return true
    }else{
      if(newWrite){
        sequelize = initializeC()
        await sequelize?.authenticate()
        console.log('Database Connected');
        return true
      }
      return false;
    }
  } catch (error) {
    console.log('Database Connection Failed')
    console.log(error);
    return false;
  }
}
