import { CrudOperation, Word } from '../shared/db-types'
import db from './db'
import { DateLike, Uuid } from '../shared/utils'

export default async function handleCrudOperations<
  T extends {
    uuid: Uuid
    game: Uuid
    updated_at: DateLike
  },
>(tableName: string, gameUuid: Uuid, operations: CrudOperation<T>[]) {
  const inserts: T[] = []
  const updates: T[] = []
  const uuidsToDelete: string[] = []
  for (const change of operations) {
    if (change.op === 'C') {
      inserts.push({ ...change.data, game: gameUuid })
    } else if (change.op === 'U') {
      updates.push({
        ...change.data,
        game: undefined,
        created_at: undefined,
        updated_at: new Date(),
      })
    } else if (change.op === 'D') {
      uuidsToDelete.push(change.uuid)
    } else {
      throw new Error(
        'Invalid operation: ' + JSON.stringify(change satisfies never),
      )
    }
  }

  await db.transaction(async (trx) => {
    if (inserts.length) {
      await trx('words').insert(inserts)
    }
    for (const update of updates) {
      await trx('words')
        .where('uuid', update.uuid)
        .where('game' satisfies keyof Word, gameUuid)
        .update(update)
    }
    if (uuidsToDelete.length) {
      await trx('words')
        .whereIn('uuid', uuidsToDelete)
        .where('game' satisfies keyof Word, gameUuid)
        .delete()
    }
  })
}
