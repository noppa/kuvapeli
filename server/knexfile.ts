// Update with your config settings.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  client: 'better-sqlite3',
  connection: {
    database: process.env.DB_NAME || 'game',
    user: process.env.DB_USER || 'db_user',
    password: process.env.DB_PASSWORD || 'caklcascacpwkascsad2422',
    filename: process.env.DB_FILE || path.join(__dirname, './db.sqlite'),
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations',
    loadExtensions: ['.js', '.ts'],
  },
}
