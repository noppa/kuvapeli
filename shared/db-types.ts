export interface User {
  name: string
  password: string
  created_at: string
  updated_at: string
}

export interface Game {
  identifier: string
  name: string
  admin: string // references User.name
  created_at: string
  updated_at: string
}

export interface Player {
  name: string // references User.name
  game: string // references Game.identifier
  group: string
  created_at: string
  updated_at: string
}

export interface Word {
  word: string
  game: string // references Game.identifier
  chosen_for_player?: string // references Player.name
  ordering: number
  created_at: string
  updated_at: string
}

export interface Image {
  filename: string
  game: string // references Game.identifier
  word_actual?: string // references Word.word
  word_guess?: string // references Word.word
  deleted_at?: string
  created_at: string
  updated_at: string
}
