'use client'

import type { Direction } from '@/lib/quiz/types'

interface DirectionToggleProps {
  value: Direction
  onChange: (direction: Direction) => void
}

const DIRECTIONS: { value: Direction; label: string }[] = [
  { value: 'kana→romaji', label: 'Kana → Romaji' },
  { value: 'romaji→kana', label: 'Romaji → Kana' },
]

export default function DirectionToggle({
  value,
  onChange,
}: DirectionToggleProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <span className="text-sm text-gray-500 dark:text-gray-400 font-medium mr-1">
        Direction:
      </span>
      <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
        {DIRECTIONS.map(dir => (
          <button
            key={dir.value}
            type="button"
            onClick={() => onChange(dir.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              value === dir.value
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {dir.label}
          </button>
        ))}
      </div>
    </div>
  )
}
