import knex from 'knex'
const dbFilePath = process.env.DB_FILE_PATH || 'db.json'

const db = knex({
  client: 'better-sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: dbFilePath,
  },
})

export default db
