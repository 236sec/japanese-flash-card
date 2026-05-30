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

export function createLocalStorageAdapter(storage: Storage): StorageAdapter {
  function parseStoredSelection(): Set<string> {
    const raw = storage.getItem(SELECTION_KEY)
    if (!raw) return new Set()
    try {
      const arr: string[] = JSON.parse(raw)
      return new Set(arr)
    } catch {
      return new Set()
    }
  }

  function parseScoreHistory(): ScoreEntry[] {
    const raw = storage.getItem(SCORE_HISTORY_KEY)
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
      storage.setItem(SELECTION_KEY, JSON.stringify(arr))
    },

    async getDirection(): Promise<Direction> {
      const raw = storage.getItem(DIRECTION_KEY)
      if (raw === 'romaji→kana' || raw === 'kana→romaji') return raw
      return 'kana→romaji'
    },

    async setDirection(direction: Direction): Promise<void> {
      storage.setItem(DIRECTION_KEY, direction)
    },

    async getScoreHistory(): Promise<ScoreEntry[]> {
      return parseScoreHistory()
    },

    async addScoreEntry(entry: ScoreEntry): Promise<void> {
      const history = parseScoreHistory()
      history.push(entry)
      storage.setItem(SCORE_HISTORY_KEY, JSON.stringify(history))
    },

    async clearScoreHistory(): Promise<void> {
      storage.removeItem(SCORE_HISTORY_KEY)
    },
  }
}
