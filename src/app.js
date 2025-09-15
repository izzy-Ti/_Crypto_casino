import express from 'express'
import pool from './config/db.js'
import chalk from 'chalk'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import user from './routes/auth.routes.js'

dotenv.config()

const app = express()
const port = process.env.PORT

await pool.connect();
app.use(cookieParser()); 

app.use(express.json())
app.use('/api/user', user)

app.listen(port || 5000, () =>{
    console.log(chalk.yellow.bold(`server is running on ${port}`))
})