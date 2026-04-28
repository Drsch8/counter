import { useState } from 'react'
import type { Player, Round } from './types'
import { loadGlobalStats } from './globalStats'
import styles from './StatsModal.module.css'

interface Props {
  players: Player[]
  rounds: Round[]
  scores: Record<number, number>
  onClose: () => void
}

export default function StatsModal({ players, rounds, scores, onClose }: Props) {
  const [tab, setTab] = useState<'game' | 'alltime'>('game')

  const gameStats = players.map(p => {
    const wins = rounds.filter(r => (r.result?.scoreDeltas[p.id] ?? 0) > 0).length
    const losses = rounds.filter(r => (r.result?.scoreDeltas[p.id] ?? 0) < 0).length
    const solos = rounds.filter(r => r.gameType === 'solo' && r.reTeam[0] === p.id).length
    const soloWins = rounds.filter(r => r.gameType === 'solo' && r.reTeam[0] === p.id && r.winner === 're').length
    return { name: p.name, wins, losses, solos, soloWins, score: scores[p.id] ?? 0 }
  }).sort((a, b) => b.score - a.score)

  const globalRaw = loadGlobalStats()
  const globalStats = Object.entries(globalRaw)
    .map(([name, s]) => ({ name, ...s }))
    .sort((a, b) => b.totalScore - a.totalScore)

  const totalRounds = rounds.length
  const bockRounds = rounds.filter(r => r.bock).length
  const soloRounds = rounds.filter(r => r.gameType === 'solo').length

  const globalTotalRounds = globalStats.reduce((s, p) => s + p.wins + p.losses, 0) / 4 | 0

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Statistics</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'game' ? styles.tabActive : ''}`}
            onClick={() => setTab('game')}
          >This Game</button>
          <button
            className={`${styles.tab} ${tab === 'alltime' ? styles.tabActive : ''}`}
            onClick={() => setTab('alltime')}
          >All Time</button>
        </div>

        {tab === 'game' ? (
          <>
            <div className={styles.summary}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryValue}>{totalRounds}</span>
                <span className={styles.summaryLabel}>Rounds</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryValue}>{soloRounds}</span>
                <span className={styles.summaryLabel}>Solos</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryValue}>{bockRounds}</span>
                <span className={styles.summaryLabel}>Bock</span>
              </div>
            </div>
            <div className={styles.playerList}>
              {gameStats.map(s => (
                <div key={s.name} className={styles.playerRow}>
                  <div className={styles.playerName}>{s.name}</div>
                  <div className={styles.playerStats}>
                    <span className={s.score >= 0 ? styles.pos : styles.neg}>
                      {s.score > 0 ? `+${s.score}` : s.score}
                    </span>
                    <span className={styles.wl}>{s.wins}W / {s.losses}L</span>
                    {s.solos > 0 && (
                      <span className={styles.soloTag}>{s.soloWins}/{s.solos} solo</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {totalRounds === 0 && <p className={styles.empty}>No rounds played yet.</p>}
          </>
        ) : (
          <>
            <div className={styles.summary}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryValue}>{globalTotalRounds}</span>
                <span className={styles.summaryLabel}>Rounds</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryValue}>
                  {globalStats.reduce((s, p) => s + p.solos, 0)}
                </span>
                <span className={styles.summaryLabel}>Solos</span>
              </div>
            </div>
            <div className={styles.playerList}>
              {globalStats.map(s => (
                <div key={s.name} className={styles.playerRow}>
                  <div className={styles.playerName}>{s.name}</div>
                  <div className={styles.playerStats}>
                    <span className={s.totalScore >= 0 ? styles.pos : styles.neg}>
                      {s.totalScore > 0 ? `+${s.totalScore}` : s.totalScore}
                    </span>
                    <span className={styles.wl}>{s.wins}W / {s.losses}L</span>
                    {s.solos > 0 && (
                      <span className={styles.soloTag}>{s.soloWins}/{s.solos} solo</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {globalStats.length === 0 && <p className={styles.empty}>No history yet.</p>}
          </>
        )}
      </div>
    </div>
  )
}
