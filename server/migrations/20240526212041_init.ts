import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('games', (table) => {
    table.string('uuid').primary()
    table.string('name').notNullable()
    table.string('adminToken').notNullable().unique()
    table.integer('groupTakingImages')
    table.timestamps(true, true)
  })
  await knex.schema.createTable('players', (table) => {
    table.string('uuid').primary()
    table.string('name')
    table.string('game').references('uuid').inTable('games').notNullable()
    table.integer('group').notNullable()
    table
      .string('pairedWithPlayer')
      .references('uuid')
      .inTable('players')
      .notNullable()
    table.string('token').notNullable().unique()
    table.timestamps(true, true)
    table.unique(['name', 'game'])
  })
  await knex.schema.createTable('words', (table) => {
    table.string('uuid').primary()
    table.string('word').notNullable()
    table.string('game').references('uuid').inTable('games').notNullable()
    table.string('chosenForPlayer').references('uuid').inTable('players')
    table.integer('group').notNullable()
    table.timestamps(true, true)
  })
  await knex.schema.createTable('images', (table) => {
    table.string('uuid').primary()
    table.string('game').references('uuid').inTable('games').notNullable()
    table.string('wordActual').references('uuid').inTable('words').notNullable()
    table.string('wordGuess').references('uuid').inTable('words')
    table.dateTime('deletedAt')
    table.timestamps(true, true)
  })
}

export async function down(): Promise<void> {}
