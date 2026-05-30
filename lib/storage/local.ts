import type { Direction, ScoreEntry } from '@/lib/quiz/types'

const SELECTION_KEY = 'jfc-character-selection'
const DIRECTION_KEY = 'jfc-direction'
const SCORE_HISTORY_KEY = 'jfc-score-history'

export interface StorageAdapter {
  getCharacterSelection(): Promise<Set<string>>
  setCharacterSelection(chars: Set<string>): Promise<void>
  getDirection(): Promise<Direction>
  setDirection(direction: Direction): Promise<void>
  getScoreHistory(): Promise<ScoreEntry[]>
  addScoreEntry(entry: ScoreEntry): Promise<void>
  clearScoreHistory(): Promise<void>
}

/**
 * Safely read from storage, returning defaultValue if unavailable or throws.
 */
function safeGetItem(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

/**
 * Safely write to storage—silently ignore if unavailable.
 */
function safeSetItem(storage: Storage, key: string, value: string): void {
  try {
    storage.setItem(key, value)
  } catch {
    // storage unavailable — silently ignore
  }
}

/**
 * Safely remove a key from storage—silently ignore if unavailable.
 */
function safeRemoveItem(storage: Storage, key: string): void {
  try {
    storage.removeItem(key)
  } catch {
    // storage unavailable — silently ignore
  }
}

export function createLocalStorageAdapter(storage: Storage): StorageAdapter {
  function parseStoredSelection(): Set<string> {
    const raw = safeGetItem(storage, SELECTION_KEY)
    if (!raw) return new Set()
    try {
      const arr: string[] = JSON.parse(raw)
      return new Set(arr)
    } catch {
      return new Set()
    }
  }

  function parseScoreHistory(): ScoreEntry[] {
    const raw = safeGetItem(storage, SCORE_HISTORY_KEY)
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return parsed
    } catch {
      return []
    }
  }

  return {
    async getCharacterSelection(): Promise<Set<string>> {
      return parseStoredSelection()
    },

    async setCharacterSelection(chars: Set<string>): Promise<void> {
      const arr = [...chars]
      safeSetItem(storage, SELECTION_KEY, JSON.stringify(arr))
    },

    async getDirection(): Promise<Direction> {
      const raw = safeGetItem(storage, DIRECTION_KEY)
      if (raw === 'romaji→kana' || raw === 'kana→romaji') return raw
      return 'kana→romaji'
    },

    async setDirection(direction: Direction): Promise<void> {
      safeSetItem(storage, DIRECTION_KEY, direction)
    },

    async getScoreHistory(): Promise<ScoreEntry[]> {
      return parseScoreHistory()
    },

    async addScoreEntry(entry: ScoreEntry): Promise<void> {
      const history = parseScoreHistory()
      history.push(entry)
      safeSetItem(storage, SCORE_HISTORY_KEY, JSON.stringify(history))
    },

    async clearScoreHistory(): Promise<void> {
      safeRemoveItem(storage, SCORE_HISTORY_KEY)
    },
  }
}
