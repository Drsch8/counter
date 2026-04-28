import type { Player, Round } from './types'

export interface GlobalPlayerStats {
  totalScore: number
  wins: number
  losses: number
  solos: number
  soloWins: number
  reWins: number
  reLosses: number
  kontraWins: number
  kontraLosses: number
}

export type GlobalStats = Record<string, GlobalPlayerStats>

const KEY = 'doppelkopf-global-stats'

function empty(): GlobalPlayerStats {
  return { totalScore: 0, wins: 0, losses: 0, solos: 0, soloWins: 0, reWins: 0, reLosses: 0, kontraWins: 0, kontraLosses: 0 }
}

export function loadGlobalStats(): GlobalStats {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') } catch { return {} }
}

function save(stats: GlobalStats) {
  localStorage.setItem(KEY, JSON.stringify(stats))
}

function getOrCreate(stats: GlobalStats, name: string): GlobalPlayerStats {
  if (!stats[name]) stats[name] = empty()
  return stats[name]
}

export function applyRoundToGlobal(players: Player[], round: Round): void {
  if (!round.result) return
  const stats = loadGlobalStats()
  for (const p of players) {
    const ps = getOrCreate(stats, p.name)
    const delta = round.result.scoreDeltas[p.id] ?? 0
    ps.totalScore += delta
    if (delta > 0) ps.wins++
    else if (delta < 0) ps.losses++
    if (round.gameType === 'solo') {
      if (round.reTeam[0] === p.id) {
        ps.solos++
        if (round.winner === 're') ps.soloWins++
      }
    } else {
      const isRe = round.reTeam.includes(p.id)
      const reWon = round.winner === 're'
      if (isRe) { if (reWon) ps.reWins++; else ps.reLosses++ }
      else       { if (!reWon) ps.kontraWins++; else ps.kontraLosses++ }
    }
  }
  save(stats)
}

export function undoRoundFromGlobal(players: Player[], round: Round): void {
  if (!round.result) return
  const stats = loadGlobalStats()
  for (const p of players) {
    const ps = getOrCreate(stats, p.name)
    const delta = round.result.scoreDeltas[p.id] ?? 0
    ps.totalScore -= delta
    if (delta > 0) ps.wins = Math.max(0, ps.wins - 1)
    else if (delta < 0) ps.losses = Math.max(0, ps.losses - 1)
    if (round.gameType === 'solo') {
      if (round.reTeam[0] === p.id) {
        ps.solos = Math.max(0, ps.solos - 1)
        if (round.winner === 're') ps.soloWins = Math.max(0, ps.soloWins - 1)
      }
    } else {
      const isRe = round.reTeam.includes(p.id)
      const reWon = round.winner === 're'
      if (isRe) { if (reWon) ps.reWins = Math.max(0, ps.reWins - 1); else ps.reLosses = Math.max(0, ps.reLosses - 1) }
      else       { if (!reWon) ps.kontraWins = Math.max(0, ps.kontraWins - 1); else ps.kontraLosses = Math.max(0, ps.kontraLosses - 1) }
    }
  }
  save(stats)
}
