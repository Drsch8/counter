export type Team = 're' | 'kontra'
export type GameType = 'normal' | 'solo'

export interface Player {
  id: number
  name: string
}

export interface Round {
  id: number
  gameType: GameType
  reTeam: number[]    // 2 player ids for normal, 1 for solo
  rePoints: number    // game value entered by user (e.g. 1, 2, 3)
  winner: Team
  bock: boolean       // was played with doubled stakes
  bockTriggered: number  // how many bock rounds this round queued (0 or 4)
  result?: RoundResult
}

export interface RoundResult {
  winner: Team
  scoreDeltas: Record<number, number>  // playerId -> score change
}

export interface GameState {
  players: Player[]
  rounds: Round[]
  scores: Record<number, number>
  bockRoundsRemaining: number
  started: boolean
}
