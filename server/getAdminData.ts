import { AdminData, Game } from '../shared/db-types'
import db from './db'

export default async function getAdminData(game: Game): Promise<AdminData> {
  const [players, words, images] = await Promise.all([
    db.from('players').where('game', game.uuid),
    db.from('words').where('game', game.uuid),
    db.from('images').where('game', game.uuid),
  ])

  return {
    game,
    players,
    words,
    images,
  }
}
