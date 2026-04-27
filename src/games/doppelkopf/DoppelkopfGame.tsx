import { useState } from 'react'
import { useGameState, gameId } from './useGameState'
import RoundForm from './RoundForm'
import GameTable from './GameTable'
import PlayerSetup from './PlayerSetup'
import styles from './DoppelkopfGame.module.css'

export default function DoppelkopfGame() {
  const { state, synced, setPlayerName, addRound, removeLastRound, reset } = useGameState()
  const [showForm, setShowForm] = useState(false)
  const [showId, setShowId] = useState(false)

  const isBockRound = state.bockRoundsRemaining > 0

  if (showForm) {
    return (
      <div className={styles.app}>
        <header className={styles.header}>
          <h1>Doppelkopf</h1>
          <span className={styles.roundLabel}>Round {state.rounds.length + 1}</span>
        </header>
        <main className={styles.main}>
          <RoundForm
            players={state.players}
            isBockRound={isBockRound}
            onSubmit={(round, addBock) => { addRound(round, addBock); setShowForm(false) }}
            onCancel={() => setShowForm(false)}
          />
        </main>
      </div>
    )
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>Doppelkopf</h1>
        <div className={styles.headerRight}>
          <button className={styles.gameIdBtn} onClick={() => setShowId(v => !v)} title="Game ID">
            {synced ? '●' : '○'} {showId ? gameId : '···'}
          </button>
          <button
            className={styles.newGameBtn}
            onClick={() => { if (confirm('Start a new game?')) reset() }}
          >
            New Game
          </button>
        </div>
      </header>
      <main className={styles.main}>
        {state.rounds.length === 0 ? (
          <PlayerSetup players={state.players} onRename={setPlayerName} />
        ) : (
          <GameTable
            players={state.players}
            rounds={state.rounds}
            onRenamePlayer={setPlayerName}
            onUndo={removeLastRound}
          />
        )}
      </main>
      <div className={styles.footer}>
        {isBockRound && <span className={styles.bockIndicator}>BOCK ×2</span>}
        <button className={styles.addRoundBtn} onClick={() => setShowForm(true)}>
          + Round
        </button>
      </div>
    </div>
  )
}
