import {
  Game,
  Player,
  PlayerData,
  Image,
  Word,
  Guess,
  TurnData,
} from '../shared/dbTypes'
import { omit } from '../shared/utils'
import db from './db'

async function getImagesByPlayer(
  playerUuid: string,
): Promise<Omit<Image, 'metadata'>[]> {
  const images: Image[] = await db
    .select('images.*')
    .from('images')
    .where('images.takenByPlayer' satisfies `images.${keyof Image}`, playerUuid)
    .whereNull('images.deletedAt' satisfies `images.${keyof Image}`)
    .orderBy('images.created_at')
  return images.map((img) => omit(img, ['metadata']))
}

async function getGuessesByPlayer(playerUuid: string): Promise<Guess[]> {
  return await db
    .from('guesses')
    .where('guessedByPlayer' satisfies keyof Guess, playerUuid)
    .orderBy('created_at')
}

export default async function getPlayerData(
  player: Player,
): Promise<PlayerData> {
  const game: Game = await db.from('games').where('uuid', player.game).first()
  const turn: TurnData['turn'] =
    game.groupTakingImages == null
      ? 'paused'
      : game.groupTakingImages === player.group
        ? 'taking_images'
        : 'guessing_words'

  const [
    otherPlayers,
    takenImages,
    imagesToGuess,
    words,
    ownGuesses,
    pairGuesses,
  ] = await Promise.all([
    db
      .from('players')
      .where('game' satisfies keyof Player, player.game)
      .whereNot('uuid', player.uuid)
      .orderBy('created_at'),
    getImagesByPlayer(player.uuid),
    getImagesByPlayer(player.pairedWithPlayer),
    db
      .from('words')
      .where('game' satisfies keyof Word, player.game)
      .orderBy('created_at') as Promise<Word[]>,
    getGuessesByPlayer(player.uuid),
    getGuessesByPlayer(player.pairedWithPlayer),
  ])

  const wordsByUuid = new Map<string, Word>(words.map((w) => [w.uuid, w]))

  const turnData = (function getTurnData(): TurnData {
    if (turn === 'taking_images') {
      return {
        turn,
        wordsToTakeImagesFor: words.filter(
          (w) => w.chosenForPlayer === player.uuid,
        ),
        takenImages,
        mateGuessedWords: pairGuesses.map((g) => {
          const word = wordsByUuid.get(g.word)!
          return {
            ...g,
            wordName: word.name,
            correct: word.chosenForPlayer === player.uuid,
          }
        }),
      }
    } else if (turn === 'guessing_words') {
      return {
        turn,
        imagesToGuess,
        ownGuessedWords: ownGuesses.map((g) => {
          const word = wordsByUuid.get(g.word)!
          return {
            ...g,
            wordName: word.name,
            correct: word.chosenForPlayer === player.pairedWithPlayer,
          }
        }),
      }
    } else if (turn === 'paused') {
      return { turn }
    }

    throw new Error('Invalid turn: ' + (turn satisfies never))
  })()

  return {
    game: omit(game, ['adminToken']),
    player,
    otherPlayers: otherPlayers.map((p) => omit(p, ['token'])),
    turnData,

    wordOptions: words.map((w) => omit(w, ['chosenForPlayer', 'group'])),
  }
}
