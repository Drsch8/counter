import { useState } from 'react'
import type { Player, Round } from './types'
import styles from './GameTable.module.css'

interface Props {
  players: Player[]
  rounds: Round[]
  onRenamePlayer: (id: number, name: string) => void
}

export default function GameTable({ players, rounds, onRenamePlayer }: Props) {
  const [editing, setEditing] = useState<number | null>(null)
  const [draft, setDraft] = useState('')

  // Build cumulative running totals per round
  const running: Record<number, number>[] = []
  const acc: Record<number, number> = {}
  for (const p of players) acc[p.id] = 0
  for (const r of rounds) {
    for (const p of players) {
      acc[p.id] += r.result?.scoreDeltas[p.id] ?? 0
    }
    running.push({ ...acc })
  }

  // Dealer rotates each round: round 1 → player 0, round 2 → player 1, …
  const nextDealerId = players[rounds.length % players.length].id

  function ptsCell(r: Round) {
    const v = r.rePoints * (r.bock ? 2 : 1)
    return r.gameType === 'solo' ? `${v}/${v * 3}` : `${v}`
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thRound}>#</th>
              {players.map(p => (
                <th key={p.id} className={styles.thPlayer}>
                  {editing === p.id ? (
                    <input
                      className={styles.nameInput}
                      value={draft}
                      autoFocus
                      onChange={e => setDraft(e.target.value)}
                      onBlur={() => { onRenamePlayer(p.id, draft || p.name); setEditing(null) }}
                      onKeyDown={e => { if (e.key === 'Enter') { onRenamePlayer(p.id, draft || p.name); setEditing(null) } }}
                    />
                  ) : (
                    <span
                      className={`${styles.playerName} ${p.id === nextDealerId ? styles.dealer : ''}`}
                      onClick={() => { setEditing(p.id); setDraft(p.name) }}
                    >
                      {p.name}
                    </span>
                  )}
                </th>
              ))}
              <th className={styles.thPts}>Pts</th>
            </tr>
          </thead>
          <tbody>
            {rounds.map((r, i) => (
              <tr key={r.id}>
                <td className={`${styles.tdRound} ${r.bock ? styles.bockCell : ''} ${r.gameType === 'solo' ? styles.soloCell : ''}`}>
                  {r.id}
                  {r.bock && <span className={`${styles.badge} ${styles.bockBadge}`}>B</span>}
                  {r.gameType === 'solo' && <span className={`${styles.badge} ${styles.soloBadge}`}>S</span>}
                </td>
                {players.map(p => {
                  const delta = r.result?.scoreDeltas[p.id] ?? 0
                  const cumulative = running[i][p.id]
                  const cellClass = delta > 0 ? styles.cellWin : delta < 0 ? styles.cellLoss : ''
                  const numClass = cumulative > 0 ? styles.pos : cumulative < 0 ? styles.neg : styles.zero
                  return (
                    <td key={p.id} className={`${styles.tdScore} ${cellClass}`}>
                      <span className={numClass}>{cumulative > 0 ? `+${cumulative}` : cumulative}</span>
                    </td>
                  )
                })}
                <td className={styles.tdPts}>{ptsCell(r)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
