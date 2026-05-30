import { describe, it, expect, beforeAll, afterAll } from 'vitest'
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

  beforeAll(() => {
    mockStorage = createMockStorage()
    adapter = createLocalStorageAdapter(mockStorage)
  })

  afterAll(() => {
    // clean up
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
})
