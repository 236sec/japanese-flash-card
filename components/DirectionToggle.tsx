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
      <span className="text-sm text-gray-500 font-medium mr-1">
        Direction:
      </span>
      <div className="flex rounded-lg border border-gray-300 overflow-hidden">
        {DIRECTIONS.map(dir => (
          <button
            key={dir.value}
            type="button"
            onClick={() => onChange(dir.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              value === dir.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {dir.label}
          </button>
        ))}
      </div>
    </div>
  )
}
