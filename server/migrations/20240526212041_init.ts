import type { Knex } from 'knex'
import { Game } from '../../shared/dbTypes'
import { Uuid } from '../../shared/utils'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('games', (table) => {
    table.string('uuid').primary()
    table.string('name').notNullable()
    table.string('adminToken').notNullable().unique()
    table.integer('groupTakingImages')
    table.timestamps(true, true)
  })

  await knex('games').insert({
    uuid: 'fd83209f-fce8-4158-9291-1ba65061bd69' as Uuid,
    adminToken: '94451761399f',
    name: 'Eka peli',
    groupTakingImages: 1,
  } satisfies Game)

  await knex.schema.createTable('players', (table) => {
    table.string('uuid').primary()
    table.string('name').notNullable()
    table.string('game').references('uuid').inTable('games').notNullable()
    table.integer('group').notNullable()
    table.string('pairedWithPlayer')
    // .references('uuid')
    // .inTable('players')
    table.string('token').notNullable().unique()
    table.timestamps(true, true)
    table.unique(['name', 'game'])
  })
  await knex.schema.createTable('words', (table) => {
    table.string('uuid').primary()
    table.string('name').notNullable()
    table.string('game').references('uuid').inTable('games').notNullable()
    table.string('chosenForPlayer').references('uuid').inTable('players')
    table.integer('group').notNullable()
    table.timestamps(true, true)
    table.unique(['game', 'name'])
  })
  await knex.schema.createTable('images', (table) => {
    table.string('uuid').primary()
    table.string('metadata')
    table.timestamp('deletedAt')
    table
      .string('takenByPlayer')
      .references('uuid')
      .inTable('players')
      .notNullable()
    table.timestamps(true, true)
  })
  await knex.schema.createTable('guesses', (table) => {
    table.string('uuid').primary()
    table.string('word').references('uuid').inTable('words').notNullable()
    table
      .string('guessedByPlayer')
      .references('uuid')
      .inTable('players')
      .notNullable()
    table.timestamps(true, true)
  })
}

export async function down(): Promise<void> {}
