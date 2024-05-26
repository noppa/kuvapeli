// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  client: 'better-sqlite3',
  connection: {
    database: process.env.DB_NAME || 'game',
    user: process.env.DB_USER || 'db_user',
    password: process.env.DB_PASSWORD || 'caklcascacpwkascsad2422',
    filename: process.env.DB_FILE || './server/db.sqlite',
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './server/migrations',
    loadExtensions: ['.js', '.ts'],
  },
}
