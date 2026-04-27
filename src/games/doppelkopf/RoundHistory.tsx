import type { Round, Player } from './types'
import styles from './RoundHistory.module.css'

interface Props {
  rounds: Round[]
  players: Player[]
  onUndo: () => void
}

export default function RoundHistory({ rounds, players, onUndo }: Props) {
  const getName = (id: number) => players.find(p => p.id === id)?.name ?? `#${id}`

  if (rounds.length === 0) {
    return <p className={styles.empty}>Noch keine Runden gespielt.</p>
  }

  return (
    <div className={styles.history}>
      <button className={styles.undoBtn} onClick={onUndo}>↩ Letzte Runde löschen</button>
      {[...rounds].reverse().map(r => {
        const kontraTeam = players.filter(p => !r.reTeam.includes(p.id))
        return (
          <div key={r.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.roundNum}>#{r.id}</span>
              {r.gameType === 'solo' && <span className={styles.solo}>Solo</span>}
              <span className={r.result?.winner === 're' ? styles.reWin : styles.kontraWin}>
                {r.result?.winner === 're' ? 'Re' : 'Kontra'} gewinnt
              </span>
            </div>
            <div className={styles.teams}>
              <span>Re: {r.reTeam.map(getName).join(', ')}</span>
              <span>Kontra: {kontraTeam.map(p => p.name).join(', ')}</span>
            </div>
            <div className={styles.points}>{r.rePoints} : {240 - r.rePoints}</div>
            {r.result && (
              <div className={styles.deltas}>
                {players.map(p => {
                  const d = r.result!.scoreDeltas[p.id] ?? 0
                  return (
                    <span key={p.id} className={d > 0 ? styles.pos : d < 0 ? styles.neg : styles.zero}>
                      {p.name} {d > 0 ? `+${d}` : d}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
