import { AdminData, Game, Player, Word } from '../shared/dbTypes'
import db from './db'
import getPlayerData from './getPlayerData'

export default async function getAdminData(game: Game): Promise<AdminData> {
  const [players, words] = await Promise.all([
    db.from('players').where('game' satisfies keyof Player, game.uuid),
    db.from('words').where('game' satisfies keyof Word, game.uuid),
  ])

  const allPlayerData = await Promise.all(players.map((p) => getPlayerData(p)))

  return {
    game,
    players,
    words,
    allPlayerData,
  }
}
