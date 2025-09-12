import express from 'express'
import pool from './config/db.js'
import chalk from 'chalk'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = process.env.PORT

await pool.connect();

app.listen(port || 5000, () =>{
    console.log(chalk.yellow.bold(`server is running on ${port}`))
})