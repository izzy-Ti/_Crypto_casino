import {Pool} from 'pg'
import chalk from 'chalk'
import dotenv from 'dotenv'


dotenv.config()

const pool = new Pool({
  user: process.env.DB_USER,       
  host:process.env.DB_HOST ,      
  database: process.env.DB_NAME ,    
  password:process.env.DB_PASSWORD ,   
  port: process.env.DB_PORT ,            
});


pool.connect()
  .then(() => {
    console.log(chalk.blue.bold('Connected to PostgreSQL successfully'));
  })
  .catch((err) => {
    console.error(chalk.red.bold(' PostgreSQL connection error:'), err);
});

export default pool