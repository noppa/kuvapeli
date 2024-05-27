export interface Game {
  uuid: string
  name: string
  adminToken: string
  groupTakingImages: number
  created_at: string
  updated_at: string
}

export interface Player {
  uuid: string
  game: string
  group: number
  token: string
  pairedWithPlayer: string
  created_at: string
  updated_at: string
}

export interface Word {
  uuid: string
  word: string
  game: string
  chosenForPlayer?: string
  group: number
  created_at: string
  updated_at: string
}

export interface Image {
  uuid: string
  game: string
  wordActual: string
  wordGuess?: string
  deletedAt?: string
  created_at: string
  updated_at: string
}

export interface AdminData {
  game: Game
  players: Player[]
  words: Word[]
  images: Image[]
}

type ImageToGuess = Omit<Image, 'wordActual'> & {
  answerCorrect: null | boolean
}

export interface PlayerData {
  game: Omit<Game, 'adminToken'>
  player: Player
  otherPlayers: Omit<Player, 'token'>[]
  turn: 'taking_images' | 'guessing_words' | 'paused'

  takenImages: Image[]
  imagesToGuess: ImageToGuess[]
  wordsToTakeImagesFor: Word[]
  wordOptions: Omit<Word, 'chosenForPlayer'>[]
}
