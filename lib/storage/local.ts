const SELECTION_KEY = 'jfc-character-selection'

export interface StorageAdapter {
  getCharacterSelection(): Promise<Set<string>>
  setCharacterSelection(chars: Set<string>): Promise<void>
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

  return {
    async getCharacterSelection(): Promise<Set<string>> {
      return parseStoredSelection()
    },

    async setCharacterSelection(chars: Set<string>): Promise<void> {
      const arr = [...chars]
      storage.setItem(SELECTION_KEY, JSON.stringify(arr))
    },
  }
}
