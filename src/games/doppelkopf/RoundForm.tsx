import { useState } from 'react'
import type { Player, Round, GameType, Team } from './types'
import styles from './RoundForm.module.css'

interface Props {
  players: Player[]
  isBockRound: boolean
  onSubmit: (round: Omit<Round, 'id' | 'result' | 'bock' | 'bockTriggered'>, addBock: boolean) => void
  onCancel: () => void
}

export default function RoundForm({ players, isBockRound, onSubmit, onCancel }: Props) {
  const [gameType, setGameType] = useState<GameType>('normal')
  const [winner, setWinner] = useState<Team>('re')
  const [selected, setSelected] = useState<number[]>([])
  const [points, setPoints] = useState('')
  const [addBock, setAddBock] = useState(false)

  const needed = gameType === 'solo' ? 1 : 2

  function toggle(id: number) {
    setSelected(s =>
      s.includes(id)
        ? s.filter(x => x !== id)
        : s.length < needed ? [...s, id] : [id]
    )
  }

  function switchType(t: GameType) {
    setGameType(t)
    setSelected([])
    setWinner('re')
  }

  function handleSubmit() {
    if (selected.length !== needed) {
      alert(gameType === 'solo' ? 'Select the solo player' : 'Select the 2 winning players')
      return
    }
    const rePoints = Math.max(0, Number(points) || 0)
    onSubmit({ gameType, reTeam: selected, rePoints, winner }, addBock)
    setSelected([])
    setPoints('')
    setWinner('re')
    setAddBock(false)
  }

  return (
    <div className={styles.form}>

      <div className={styles.topBar}>
        <button className={styles.cancelBtn} onClick={onCancel}>← Back</button>
        {isBockRound && <span className={styles.bockBanner}>Bock · ×2</span>}
      </div>

      {/* Game type */}
      <div className={styles.section}>
        <div className={styles.segmented}>
          <button className={`${styles.segBtn} ${gameType === 'normal' ? styles.segActive : ''}`} onClick={() => switchType('normal')}>Normal</button>
          <button className={`${styles.segBtn} ${gameType === 'solo' ? styles.segActive : ''}`} onClick={() => switchType('solo')}>Solo</button>
        </div>
      </div>

      {gameType === 'normal' ? (
        <div className={styles.section}>
          <span className={styles.label}>Winning team</span>
          {/* Re / Kontra selector */}
          <div className={styles.teamToggle}>
            <button
              className={`${styles.teamBtn} ${winner === 're' ? styles.teamRe : ''}`}
              onClick={() => setWinner('re')}
            >Re</button>
            <button
              className={`${styles.teamBtn} ${winner === 'kontra' ? styles.teamKontra : ''}`}
              onClick={() => setWinner('kontra')}
            >Kontra</button>
          </div>
          {/* Players on winning team */}
          <div className={styles.playerGrid}>
            {players.map(p => (
              <button
                key={p.id}
                className={`${styles.playerBtn} ${selected.includes(p.id) ? (winner === 're' ? styles.playerRe : styles.playerKontra) : ''}`}
                onClick={() => toggle(p.id)}
              >{p.name}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.section}>
          <span className={styles.label}>Solo player</span>
          <div className={styles.playerGrid}>
            {players.map(p => (
              <button
                key={p.id}
                className={`${styles.playerBtn} ${selected.includes(p.id) ? styles.playerRe : ''}`}
                onClick={() => toggle(p.id)}
              >{p.name}</button>
            ))}
          </div>
          {selected.length === 1 && (
            <div className={styles.teamToggle} style={{ marginTop: '0.25rem' }}>
              <button className={`${styles.teamBtn} ${winner === 're' ? styles.teamRe : ''}`} onClick={() => setWinner('re')}>Re wins</button>
              <button className={`${styles.teamBtn} ${winner === 'kontra' ? styles.teamKontra : ''}`} onClick={() => setWinner('kontra')}>Kontra wins</button>
            </div>
          )}
        </div>
      )}

      {/* Points */}
      <div className={styles.section}>
        <span className={styles.label}>Points</span>
        <input
          className={styles.pointsInput}
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          min={0}
          placeholder="1"
          value={points}
          onChange={e => setPoints(e.target.value)}
          autoFocus
        />
      </div>

      {/* Bock */}
      <div className={styles.section}>
        <label className={styles.bockLabel}>
          <input className={styles.bockCheck} type="checkbox" checked={addBock} onChange={e => setAddBock(e.target.checked)} />
          <span>Bock<span className={styles.bockDesc}> — next 4 rounds count double</span></span>
        </label>
      </div>

      <button className={styles.submitBtn} onClick={handleSubmit}>Save round</button>
    </div>
  )
}
