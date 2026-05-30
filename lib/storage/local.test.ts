import { describe, it, expect, beforeEach } from 'vitest'
import { createLocalStorageAdapter } from './local'

// Stub localStorage since vitest runs in Node
function createMockStorage(): Storage {
  const store = new Map<string, string>()
  return {
    get length() { return store.size },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => { store.delete(key) },
    setItem: (key: string, value: string) => { store.set(key, value) },
  }
}

describe('LocalStorage Storage Adapter', () => {
  let mockStorage: Storage
  let adapter: ReturnType<typeof createLocalStorageAdapter>

  beforeEach(() => {
    mockStorage = createMockStorage()
    adapter = createLocalStorageAdapter(mockStorage)
  })

  it('returns an empty Set when nothing has been stored', async () => {
    const selection = await adapter.getCharacterSelection()
    expect(selection).toBeInstanceOf(Set)
    expect(selection.size).toBe(0)
  })

  it('stores and retrieves a Set of glyphs', async () => {
    const chars = new Set(['あ', 'い', 'う', 'え', 'お'])
    await adapter.setCharacterSelection(chars)
    const loaded = await adapter.getCharacterSelection()
    expect(loaded).toEqual(chars)
  })

  it('overwrites previously stored data', async () => {
    await adapter.setCharacterSelection(new Set(['か', 'き']))
    await adapter.setCharacterSelection(new Set(['さ', 'し', 'す']))
    const loaded = await adapter.getCharacterSelection()
    expect(loaded).toEqual(new Set(['さ', 'し', 'す']))
  })

  it('handles an empty Set', async () => {
    await adapter.setCharacterSelection(new Set())
    const loaded = await adapter.getCharacterSelection()
    expect(loaded.size).toBe(0)
  })

  describe('direction persistence', () => {
    it('returns default direction when nothing stored', async () => {
      const direction = await adapter.getDirection()
      expect(direction).toBe('kana→romaji')
    })

    it('stores and retrieves direction', async () => {
      await adapter.setDirection('romaji→kana')
      const loaded = await adapter.getDirection()
      expect(loaded).toBe('romaji→kana')
    })

    it('returns kana→romaji for invalid stored value', async () => {
      mockStorage.setItem('jfc-direction', 'invalid')
      const direction = await adapter.getDirection()
      expect(direction).toBe('kana→romaji')
    })
  })

  describe('score history', () => {
    it('returns empty array when no history stored', async () => {
      const history = await adapter.getScoreHistory()
      expect(history).toEqual([])
    })

    it('stores and retrieves a single score entry', async () => {
      const entry = {
        id: 'test-1',
        date: '2026-05-30T10:00:00.000Z',
        direction: 'kana→romaji' as const,
        total: 5,
        correct: 4,
        incorrect: 1,
        elapsedMs: 12000,
        misses: [{ glyph: 'き', romaji: 'ki' }],
      }

      await adapter.addScoreEntry(entry)
      const history = await adapter.getScoreHistory()
      expect(history).toHaveLength(1)
      expect(history[0]).toEqual(entry)
    })

    it('appends new entries to existing history', async () => {
      const entry1 = {
        id: 'append-1',
        date: '2026-05-30T11:00:00.000Z',
        direction: 'kana→romaji' as const,
        total: 3,
        correct: 3,
        incorrect: 0,
        elapsedMs: 5000,
        misses: [],
      }
      const entry2 = {
        id: 'append-2',
        date: '2026-05-30T12:00:00.000Z',
        direction: 'romaji→kana' as const,
        total: 10,
        correct: 7,
        incorrect: 3,
        elapsedMs: 30000,
        misses: [
          { glyph: 'カ', romaji: 'ka' },
          { glyph: 'シ', romaji: 'shi' },
        ],
      }

      await adapter.addScoreEntry(entry1)
      await adapter.addScoreEntry(entry2)
      const history = await adapter.getScoreHistory()
      expect(history).toHaveLength(2)
      expect(history[0]).toEqual(entry1)
      expect(history[1]).toEqual(entry2)
    })

    it('handles corrupted JSON gracefully', async () => {
      mockStorage.setItem('jfc-score-history', 'not-json')
      const history = await adapter.getScoreHistory()
      expect(history).toEqual([])
    })

    it('clears all score history', async () => {
      await adapter.addScoreEntry({
        id: 'clear-test',
        date: '2026-05-30T13:00:00.000Z',
        direction: 'kana→romaji',
        total: 1,
        correct: 1,
        incorrect: 0,
        elapsedMs: 100,
        misses: [],
      })
      await adapter.clearScoreHistory()
      const history = await adapter.getScoreHistory()
      expect(history).toEqual([])
    })
  })
})
