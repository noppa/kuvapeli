import { DateLike, Uuid } from './utils'

export type Game = {
  uuid: Uuid
  name: string
  adminToken: string
  groupTakingImages?: number
  created_at: DateLike
  updated_at: DateLike
}

export type Player = {
  uuid: Uuid
  name: string
  game: Uuid
  group: number
  pairedWithPlayer: Uuid
  token: string
  created_at?: DateLike
  updated_at?: DateLike
}

export type Word = {
  uuid: Uuid
  name: string
  game: Uuid
  chosenForPlayer?: Uuid
  group: number
  created_at: DateLike
  updated_at: DateLike
}

export type Image = {
  uuid: Uuid
  takenByPlayer: Uuid
  metadata: string
  deletedAt: DateLike | null
  created_at: DateLike
  updated_at: DateLike
}

export type Guess = {
  uuid: Uuid
  word: Uuid
  guessedByPlayer: Uuid
  created_at: DateLike
  updated_at: DateLike
}

export type AdminData = {
  game: Game
  players: Player[]
  words: Word[]
  allPlayerData: PlayerData[]
}

export type GuessResult = Guess & {
  wordName: string
  correct: boolean
}

interface TakingImagesTurnData {
  turn: 'taking_images'
  wordsToTakeImagesFor: Word[]
  takenImages: Omit<Image, 'metadata'>[]
  mateGuessedWords: GuessResult[]
}

interface GuessingWordsTurnData {
  turn: 'guessing_words'
  imagesToGuess: Omit<Image, 'metadata'>[]
  ownGuessedWords: GuessResult[]
}

interface PausedTurnData {
  turn: 'paused'
}

export type CrudOperation<T extends { uuid: string }> =
  | { op: 'C'; data: T }
  | { op: 'U'; data: T }
  | { op: 'D'; uuid: Uuid }

export type TurnData =
  | TakingImagesTurnData
  | GuessingWordsTurnData
  | PausedTurnData

export type PlayerData = {
  game: Omit<Game, 'adminToken'>
  player: Player
  otherPlayers: Omit<Player, 'token'>[]
  wordOptions: Omit<Word, 'chosenForPlayer' | 'group'>[]
  turnData: TurnData
}

export type AutoGeneratedColumn = 'created_at' | 'updated_at'
