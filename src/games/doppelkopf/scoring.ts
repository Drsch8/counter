import type { Round, RoundResult, Player } from './types'

export function calculateRound(round: Round, players: Player[], bock: boolean): RoundResult {
  // rePoints is the base game value entered by the user (e.g. 1, 2, 3...)
  const value = round.rePoints * (bock ? 2 : 1)
  const allIds = players.map(p => p.id)
  const deltas: Record<number, number> = {}

  if (round.gameType === 'solo') {
    // reTeam[0] is always the solo player; winner says if they won (re) or lost (kontra)
    const soloId = round.reTeam[0]
    const opponents = allIds.filter(id => id !== soloId)
    const sign = round.winner === 're' ? 1 : -1
    deltas[soloId] = sign * value * 3
    for (const id of opponents) deltas[id] = -sign * value
  } else {
    // reTeam always holds the WINNING players regardless of Re/Kontra label
    const loseTeam = allIds.filter(id => !round.reTeam.includes(id))
    for (const id of round.reTeam) deltas[id] = value
    for (const id of loseTeam) deltas[id] = -value
  }

  return { winner: round.winner, scoreDeltas: deltas }
}
