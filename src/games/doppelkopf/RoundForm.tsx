import { useState } from 'react'
import type { Player, Round, GameType, Team } from './types'
import styles from './RoundForm.module.css'

interface Props {
  players: Player[]
  isBockRound: boolean
  onSubmit: (round: Omit<Round, 'id' | 'result' | 'bock' | 'bockTriggered'>, addBock: boolean) => void
  onUndo: () => void
  canUndo: boolean
}

export default function RoundForm({ players, isBockRound, onSubmit, onUndo, canUndo }: Props) {
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
    if (selected.length !== needed) return
    const rePoints = Math.max(0, Number(points) || 0)
    onSubmit({ gameType, reTeam: selected, rePoints, winner }, addBock)
    setSelected([])
    setPoints('')
    setWinner('re')
    setAddBock(false)
  }

  const ready = selected.length === needed && (gameType === 'normal' || true)

  return (
    <div className={styles.form}>

      {/* Row 1: type toggle + points */}
      <div className={styles.row1}>
        <div className={styles.segmented}>
          <button
            className={`${styles.segBtn} ${gameType === 'normal' ? styles.segActive : ''}`}
            onClick={() => switchType('normal')}
          >Normal</button>
          <button
            className={`${styles.segBtn} ${gameType === 'solo' ? styles.segActive : ''}`}
            onClick={() => switchType('solo')}
          >Solo</button>
        </div>
        <div className={styles.ptsWrap}>
          {isBockRound && <span className={styles.bockPip}>×2</span>}
          <input
            className={styles.ptsInput}
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={0}
            placeholder="1"
            value={points}
            onChange={e => setPoints(e.target.value)}
          />
        </div>
      </div>

      {/* Row 2: player buttons */}
      <div className={styles.playerRowLabel}>
        {gameType === 'normal' ? 'Re team (2 players)' : 'Solo player'}
      </div>
      <div className={styles.playerRow}>
        {players.map(p => (
          <button
            key={p.id}
            className={`${styles.playerBtn} ${selected.includes(p.id) ? styles.playerSel : ''}`}
            onClick={() => toggle(p.id)}
          >{p.name}</button>
        ))}
      </div>

      {/* Row 3: winner toggle — always for normal, after player selection for solo */}
      {(gameType === 'normal' || (gameType === 'solo' && selected.length === 1)) && (
        <div className={styles.winnerRow}>
          <button
            className={`${styles.winBtn} ${winner === 're' ? styles.winRe : ''}`}
            onClick={() => setWinner('re')}
          >Re wins</button>
          <button
            className={`${styles.winBtn} ${winner === 'kontra' ? styles.winKontra : ''}`}
            onClick={() => setWinner('kontra')}
          >Kontra wins</button>
        </div>
      )}

      {/* Row 4: bock + undo + submit */}
      <div className={styles.row4}>
        <label className={styles.bockLabel}>
          <input
            className={styles.bockCheck}
            type="checkbox"
            checked={addBock}
            onChange={e => setAddBock(e.target.checked)}
          />
          <span>Bock <span className={styles.bockDesc}>×2 for 4</span></span>
        </label>
        {canUndo && (
          <button className={styles.undoBtn} onClick={onUndo}>↩</button>
        )}
        <button
          className={`${styles.submitBtn} ${!ready ? styles.submitDim : ''}`}
          onClick={handleSubmit}
        >Add Round</button>
      </div>

    </div>
  )
}
