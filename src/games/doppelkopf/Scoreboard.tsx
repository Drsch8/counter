import { useState } from 'react'
import type { Player } from './types'
import styles from './Scoreboard.module.css'

interface Props {
  players: Player[]
  scores: Record<number, number>
  onRenamePlayer: (id: number, name: string) => void
  onReset: () => void
}

export default function Scoreboard({ players, scores, onRenamePlayer, onReset }: Props) {
  const [editing, setEditing] = useState<number | null>(null)
  const [draft, setDraft] = useState('')

  const sorted = [...players].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0))

  return (
    <div className={styles.scoreboard}>
      <ul className={styles.list}>
        {sorted.map((p, i) => (
          <li key={p.id} className={styles.row}>
            <span className={styles.rank}>{i + 1}</span>
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
              <span className={styles.name} onClick={() => { setEditing(p.id); setDraft(p.name) }}>
                {p.name}
              </span>
            )}
            <span className={`${styles.score} ${(scores[p.id] ?? 0) >= 0 ? styles.positive : styles.negative}`}>
              {scores[p.id] ?? 0}
            </span>
          </li>
        ))}
      </ul>
      <button className={styles.resetBtn} onClick={() => { if (confirm('Spiel wirklich zurücksetzen?')) onReset() }}>
        Neues Spiel
      </button>
    </div>
  )
}
