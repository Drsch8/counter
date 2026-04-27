import { useState, useEffect, useCallback } from 'react'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase'
import type { GameState, Player, Round } from './types'
import { calculateRound } from './scoring'

const DEFAULT_PLAYERS: Player[] = [
  { id: 1, name: 'Player 1' },
  { id: 2, name: 'Player 2' },
  { id: 3, name: 'Player 3' },
  { id: 4, name: 'Player 4' },
]

function initialState(): GameState {
  return {
    players: DEFAULT_PLAYERS,
    rounds: [],
    scores: { 1: 0, 2: 0, 3: 0, 4: 0 },
    bockRoundsRemaining: 0,
  }
}

// ── Game ID ────────────────────────────────
// A short random ID stored in localStorage so the same browser
// always reconnects to the same game. Share it with other players
// to sync to the same Firestore document.
function getOrCreateGameId(): string {
  const key = 'doppelkopf-game-id'
  const existing = localStorage.getItem(key)
  if (existing) return existing
  const id = Math.random().toString(36).slice(2, 8).toUpperCase()
  localStorage.setItem(key, id)
  return id
}

export const gameId = getOrCreateGameId()

async function saveToFirestore(id: string, state: GameState) {
  await setDoc(doc(db, 'games', id), state)
}

export function useGameState() {
  const [state, setState] = useState<GameState>(initialState)
  const [synced, setSynced] = useState(false)

  // Subscribe to Firestore document — updates state on any change from any device
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'games', gameId), snap => {
      if (snap.exists()) {
        setState({ ...initialState(), ...(snap.data() as GameState) })
      }
      setSynced(true)
    })
    return unsub
  }, [])

  const setPlayerName = useCallback((id: number, name: string) => {
    setState(s => {
      const next = { ...s, players: s.players.map(p => p.id === id ? { ...p, name } : p) }
      saveToFirestore(gameId, next)
      return next
    })
  }, [])

  const addRound = useCallback((round: Omit<Round, 'id' | 'result' | 'bock' | 'bockTriggered'>, addBock: boolean) => {
    setState(s => {
      const id = s.rounds.length + 1
      const isBock = s.bockRoundsRemaining > 0
      const bockTriggered = addBock ? 4 : 0
      const fullRound: Round = { ...round, id, bock: isBock, bockTriggered }
      const result = calculateRound(fullRound, s.players, isBock)
      fullRound.result = result

      const scores = { ...s.scores }
      for (const [idStr, delta] of Object.entries(result.scoreDeltas)) {
        scores[Number(idStr)] = (scores[Number(idStr)] ?? 0) + delta
      }

      const bockRoundsRemaining = Math.max(0, s.bockRoundsRemaining - (isBock ? 1 : 0)) + bockTriggered
      const next: GameState = { ...s, rounds: [...s.rounds, fullRound], scores, bockRoundsRemaining }
      saveToFirestore(gameId, next)
      return next
    })
  }, [])

  const removeLastRound = useCallback(() => {
    setState(s => {
      if (s.rounds.length === 0) return s
      const removed = s.rounds[s.rounds.length - 1]
      const rounds = s.rounds.slice(0, -1)
      const scores: Record<number, number> = {}
      for (const p of s.players) scores[p.id] = 0
      for (const r of rounds) {
        if (!r.result) continue
        for (const [idStr, delta] of Object.entries(r.result.scoreDeltas)) {
          scores[Number(idStr)] = (scores[Number(idStr)] ?? 0) + delta
        }
      }
      const bockRoundsRemaining = s.bockRoundsRemaining
        + (removed.bock ? 1 : 0)
        - (removed.bockTriggered ?? 0)
      const next: GameState = { ...s, rounds, scores, bockRoundsRemaining }
      saveToFirestore(gameId, next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    const next = initialState()
    saveToFirestore(gameId, next)
    setState(next)
  }, [])

  return { state, synced, setPlayerName, addRound, removeLastRound, reset }
}
