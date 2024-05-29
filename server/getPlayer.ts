import type { Request } from 'express'
import getUser from './getUser'
import type { Player } from '../shared/dbTypes'

export default async function getPlayer(req: Request): Promise<Player> {
  const user = await getUser(req)

  if (user.type === 'player') {
    return user.value
  }

  throw new Error(`User ${user.value.uuid} is not a player`)
}
