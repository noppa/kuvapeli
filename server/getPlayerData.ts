import { Game, Player, PlayerData, Image, Word } from '../shared/db-types'
import { omit } from '../shared/utils'
import db from './db'

async function getImagesByPlayer(playerUuid: string): Promise<Image[]> {
  return await db
    .select('images.*')
    .from('images')
    .innerJoin('words', 'images.wordActual', 'words.uuid')
    .where('words.chosenForPlayer' satisfies `words.${keyof Word}`, playerUuid)
    .whereNull('images.deletedAt' satisfies `images.${keyof Image}`)
}

export default async function getPlayerData(
  player: Player,
): Promise<PlayerData> {
  const game: Game = await db.from('games').where('uuid', player.game).first()
  const turn: PlayerData['turn'] = !game.groupTakingImages
    ? 'paused'
    : game.groupTakingImages === player.group
      ? 'taking_images'
      : 'guessing_words'

  const [otherPlayers, takenImages, imagesToGuess, words] = await Promise.all([
    db
      .from('players')
      .where('game' satisfies keyof Player, player.game)
      .whereNot('uuid', player.uuid),
    getImagesByPlayer(player.uuid),
    getImagesByPlayer(player.pairedWithPlayer),
    db
      .from('words')
      .where('game' satisfies keyof Word, player.game)
      .where('group', player.group) as Promise<
      (Word & { chosenForGroup: number })[]
    >,
  ])

  const wordsByUuid = new Map<string, Word>(words.map((w) => [w.uuid, w]))

  return {
    game: omit(game, ['adminToken']),
    player,
    otherPlayers: otherPlayers.map((p) => omit(p, ['token'])),
    turn,

    takenImages,
    imagesToGuess: imagesToGuess.map((i) => {
      const guessedWord = (i.wordGuess && wordsByUuid.get(i.wordGuess)) || null
      const answerCorrect = guessedWord?.uuid === i.wordActual

      return {
        ...omit(i, ['wordActual']),
        answerCorrect: guessedWord == null ? null : Boolean(answerCorrect),
      }
    }),
    wordsToTakeImagesFor:
      turn === 'taking_images'
        ? words.filter((w) => w.chosenForPlayer === player.uuid)
        : [],
    wordOptions: words
      .filter((w) => !w.chosenForGroup || w.chosenForGroup === player.group)
      .map((w) => omit(w, ['chosenForPlayer'])),
  }
}
