import { CrudOperation } from '../shared/dbTypes'
import db from './db'
import { DateLike, Uuid } from '../shared/utils'

export default async function handleCrudOperations<
  T extends {
    uuid: Uuid
    updated_at?: DateLike
  },
>(
  tableName: string,
  ownerConstraint: Partial<T>,
  operations: CrudOperation<T>[],
) {
  const inserts: T[] = []
  const updates: T[] = []
  const uuidsToDelete: string[] = []
  for (const change of operations) {
    if (change.op === 'C') {
      inserts.push({ ...change.data, ...ownerConstraint })
    } else if (change.op === 'U') {
      updates.push({
        ...change.data,
        ...ownerConstraint,
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
      await trx(tableName).insert(inserts)
    }
    for (const update of updates) {
      await trx(tableName)
        .where('uuid', update.uuid)
        .where(ownerConstraint)
        .update(update)
    }
    if (uuidsToDelete.length) {
      await trx(tableName)
        .whereIn('uuid', uuidsToDelete)
        .where(ownerConstraint)
        .delete()
    }
  })
}
