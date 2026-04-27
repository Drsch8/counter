import { useState } from 'react'
import type { Player } from './types'
import styles from './PlayerSetup.module.css'

interface Props {
  players: Player[]
  onRename: (id: number, name: string) => void
}

export default function PlayerSetup({ players, onRename }: Props) {
  const [drafts, setDrafts] = useState<Record<number, string>>(
    () => Object.fromEntries(players.map(p => [p.id, p.name]))
  )

  function commit(id: number) {
    const name = drafts[id].trim()
    onRename(id, name || players.find(p => p.id === id)!.name)
  }

  return (
    <div className={styles.setup}>
      <div className={styles.intro}>
        <h2 className={styles.heading}>Who's playing?</h2>
        <p className={styles.sub}>Tap a tile to set the player's name.</p>
      </div>

      <div className={styles.grid}>
        {players.map((p, i) => (
          <div key={p.id} className={styles.tile}>
            <span className={styles.number}>{i + 1}</span>
            <input
              className={styles.nameInput}
              value={drafts[p.id]}
              placeholder={`Player ${i + 1}`}
              onChange={e => setDrafts(d => ({ ...d, [p.id]: e.target.value }))}
              onBlur={() => commit(p.id)}
              onKeyDown={e => { if (e.key === 'Enter') { commit(p.id); (e.target as HTMLInputElement).blur() } }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
