import db from './db'
import type { Game, Player } from '../shared/dbTypes'
import type { Request } from 'express'

export type UserResult =
  | { type: 'admin'; game: string; value: Game }
  | { type: 'player'; game: string; value: Player }

export default async function getUser(req: Request): Promise<UserResult> {
  const authorization = String(
    req.query.authorization ||
      req.headers.authorization ||
      req.cookies.authorization ||
      '',
  )
  console.log('debug auth', authorization)

  if (!authorization) {
    throw new Error('No token provided')
  }
  const tokenMatch = authorization.match(/^(?:Bearer )?([a-z0-9]+)$/i)
  if (!tokenMatch) {
    throw new Error('Invalid token format')
  }
  const [, token] = tokenMatch

  console.log('parsed token', token)
  const player: undefined | Player = await db
    .from('players')
    .where('token', token)
    .first()
  if (player) {
    return { type: 'player', game: player.game, value: player }
  }

  const game: undefined | Game = await db
    .from('games')
    .where('adminToken' satisfies keyof Game, token)
    .first()
  if (game) {
    return { type: 'admin', game: game.name, value: game }
  }

  throw new Error('Cannot find player with token')
}
