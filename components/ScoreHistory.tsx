'use client'

import { useState } from 'react'
import type { ScoreEntry, MissEntry } from '@/lib/quiz/types'

interface ScoreHistoryProps {
  entries: ScoreEntry[]
  onBack: () => void
  onRetry: (misses: MissEntry[]) => void
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const tenths = Math.floor((ms % 1000) / 100)
  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, '0')}.${tenths}`
  }
  return `${seconds}.${tenths}s`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ScoreEntryCard({
  entry,
  onRetry,
}: {
  entry: ScoreEntry
  onRetry: (misses: MissEntry[]) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const percentage =
    entry.total > 0
      ? Math.round((entry.correct / entry.total) * 100)
      : 0
  const hasMisses = entry.misses.length > 0

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
      {/* Summary row */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4 flex-1 min-w-0 flex-wrap">
          {/* Date */}
          <div className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
            {formatDate(entry.date)}
          </div>

          {/* Direction badge */}
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 shrink-0">
            {entry.direction}
          </span>

          {/* Score */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {percentage}%
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {entry.correct}/{entry.total}
            </span>
          </div>

          {/* Time */}
          <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
            {formatTime(entry.elapsedMs)}
          </span>
        </div>

        {/* Miss indicator + expand */}
        <div className="flex items-center gap-2 shrink-0">
          {hasMisses ? (
            <span className="text-xs text-red-500 dark:text-red-400 font-medium">
              {entry.misses.length} missed
            </span>
          ) : (
            <span className="text-xs text-green-500 dark:text-green-400 font-medium">
              Perfect
            </span>
          )}

          {hasMisses && (
            <button
              type="button"
              onClick={() => setExpanded(e => !e)}
              className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600
                         text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label={expanded ? 'Hide details' : 'Show details'}
            >
              {expanded ? 'Hide' : 'Show'} details
            </button>
          )}
        </div>
      </div>

      {/* Expanded missed characters */}
      {expanded && hasMisses && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {entry.misses.map((miss, i) => (
              <div
                key={i}
                className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2 text-center"
              >
                <div className="text-lg dark:text-gray-100">{miss.glyph}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{miss.romaji}</div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onRetry(entry.misses)}
            className="mt-3 px-4 py-2 text-sm bg-orange-500 text-white
                       rounded-lg font-medium hover:bg-orange-600
                       transition-colors"
          >
            Retry Missed Characters
          </button>
        </div>
      )}
    </div>
  )
}

export default function ScoreHistory({
  entries,
  onBack,
  onRetry,
}: ScoreHistoryProps) {
  // Show most recent first
  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold dark:text-gray-100">Score History</h1>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg
                     font-medium hover:bg-blue-700 transition-colors"
        >
          Back
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No sessions yet</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Complete a quiz to see your results here
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map(entry => (
            <ScoreEntryCard
              key={entry.id}
              entry={entry}
              onRetry={onRetry}
            />
          ))}
        </div>
      )}
    </div>
  )
}
