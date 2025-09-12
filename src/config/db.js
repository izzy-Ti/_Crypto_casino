import {Pool} from 'pg'
import chalk from 'chalk'


const pool = new Pool({
  user: 'admin',          // same as POSTGRES_USER in docker run
  host: 'localhost',      // since postgres runs locally in docker
  database: 'casino',     // same as POSTGRES_DB
  password: 'secret',     // same as POSTGRES_PASSWORD
  port: 5432,             // exposed port
});


pool.connect()
  .then(() => {
    console.log(chalk.blue.bold('Connected to PostgreSQL successfully'));
  })
  .catch((err) => {
    console.error(chalk.red.bold(' PostgreSQL connection error:'), err);
});

export default pool