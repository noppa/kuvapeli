import type { Request } from 'express'
import getUser from './getUser'
import { Game } from '../shared/db-types'

export default async function getGameAsAdmin(req: Request): Promise<Game> {
  const user = await getUser(req)

  if (user.type === 'admin') {
    return user.value
  }

  throw new Error('User is not an admin')
}
