import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.string('name').primary()
    table.string('password').notNullable()
    table.timestamps(true, true)
  })
  await knex.schema.createTable('games', (table) => {
    table.string('identifier').primary()
    table.string('name').notNullable()
    table.string('admin').references('name').inTable('users').notNullable()
    table.timestamps(true, true)
  })
  await knex.schema.createTable('players', (table) => {
    table.string('name')
    table.string('game').references('identifier').inTable('games').notNullable()
    table.string('group').notNullable()
    table.timestamps(true, true)
    table.primary(['name', 'game'])
  })
  await knex.schema.createTable('words', (table) => {
    table.string('word').notNullable()
    table.string('game').references('identifier').inTable('games').notNullable()
    table.string('chosen_for_player').references('name').inTable('players')
    table.integer('ordering').notNullable().defaultTo(0)
    table.timestamps(true, true)
    table.primary(['word', 'game'])
  })
  await knex.schema.createTable('images', (table) => {
    table.string('filename').primary()
    table.string('game').references('identifier').inTable('games').notNullable()
    table.string('word_actual').references('word').inTable('words')
    table.string('word_guess').references('word').inTable('words')
    table.dateTime('deleted_at')
    table.timestamps(true, true)
  })
}

export async function down(): Promise<void> {}
