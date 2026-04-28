import { useState } from 'react'
import { useGameState, gameId } from './useGameState'
import RoundForm from './RoundForm'
import GameTable from './GameTable'
import PlayerSetup from './PlayerSetup'
import StatsModal from './StatsModal'
import styles from './DoppelkopfGame.module.css'

export default function DoppelkopfGame() {
  const { state, synced, setPlayerName, startGame, addRound, removeLastRound, reset } = useGameState()
  const [showId, setShowId] = useState(false)
  const [showStats, setShowStats] = useState(false)

  const isBockRound = state.bockRoundsRemaining > 0

  // ── Setup screen ──────────────────────────
  if (!state.started) {
    return (
      <div className={styles.app}>
        <header className={styles.header}>
          <h1>Doppelkopf</h1>
          <button className={styles.gameIdBtn} onClick={() => setShowId(v => !v)} title="Game ID">
            {synced ? '●' : '○'} {showId ? gameId : '···'}
          </button>
        </header>
        <main className={styles.setupMain}>
          <PlayerSetup
            players={state.players}
            onRename={setPlayerName}
            onStart={startGame}
          />
        </main>
      </div>
    )
  }

  // ── Game screen ───────────────────────────
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>Doppelkopf</h1>
        <div className={styles.headerRight}>
          <button className={styles.gameIdBtn} onClick={() => setShowId(v => !v)} title="Game ID">
            {synced ? '●' : '○'} {showId ? gameId : '···'}
          </button>
          <button className={styles.headerBtn} onClick={() => setShowStats(true)}>Stats</button>
          <button
            className={styles.headerBtn}
            onClick={() => { if (confirm('Start a new game?')) reset() }}
          >New Game</button>
        </div>
      </header>

      <div className={styles.tablePane}>
        {isBockRound && (
          <div className={styles.bockBanner}>
            BOCK ×2 — {state.bockRoundsRemaining} round{state.bockRoundsRemaining !== 1 ? 's' : ''} remaining
          </div>
        )}
        <GameTable
          players={state.players}
          rounds={state.rounds}
          onRenamePlayer={setPlayerName}
        />
      </div>

      <div className={styles.formPane}>
        <RoundForm
          players={state.players}
          isBockRound={isBockRound}
          onSubmit={(round, addBock) => addRound(round, addBock)}
          onUndo={removeLastRound}
          canUndo={state.rounds.length > 0}
        />
      </div>

      {showStats && (
        <StatsModal
          players={state.players}
          rounds={state.rounds}
          scores={state.scores}
          onClose={() => setShowStats(false)}
        />
      )}
    </div>
  )
}
