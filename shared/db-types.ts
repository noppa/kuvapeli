export type Uuid = string & { __uuid: true }
export type DateLike = Date | string

export interface Game {
  uuid: Uuid
  name: string
  adminToken: string
  groupTakingImages?: number
  created_at: DateLike
  updated_at: DateLike
}

export interface Player {
  uuid: Uuid
  name?: string
  game: Uuid
  group: number
  pairedWithPlayer: Uuid
  token: string
  created_at: DateLike
  updated_at: DateLike
}

export interface Word {
  uuid: Uuid
  name: string
  game: Uuid
  chosenForPlayer?: Uuid
  group: number
  created_at: DateLike
  updated_at: DateLike
}

export interface Image {
  uuid: Uuid
  takenByPlayer: Uuid
  deletedAt: DateLike | null
  created_at: DateLike
  updated_at: DateLike
}

export interface Guess {
  uuid: Uuid
  word: Uuid
  guessedByPlayer: Uuid
  created_at: DateLike
  updated_at: DateLike
}

export interface AdminData {
  game: Game
  players: Player[]
  words: Word[]
  images: Image[]
}

export interface GuessResult extends Guess {
  wordName: string
  correct: boolean
}

interface TakingImagesTurnData {
  turn: 'taking_images'
  wordsToTakeImagesFor: Word[]
  takenImages: Image[]
  mateGuessedWords: GuessResult[]
}

interface GuessingWordsTurnData {
  turn: 'guessing_words'
  imagesToGuess: Image[]
  ownGuessedWords: GuessResult[]
}

interface PausedTurnData {
  turn: 'paused'
}

export type TurnData =
  | TakingImagesTurnData
  | GuessingWordsTurnData
  | PausedTurnData

export interface PlayerData {
  game: Omit<Game, 'adminToken'>
  player: Player
  otherPlayers: Omit<Player, 'token'>[]
  wordOptions: Omit<Word, 'chosenForPlayer' | 'group'>[]
  turnData: TurnData
}
