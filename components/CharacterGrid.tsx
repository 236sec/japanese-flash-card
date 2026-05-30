'use client'

import { useCallback } from 'react'
import { getAllChars, getCharsByRow, getCharsBySyllabary, type Syllabary } from '@/lib/kana/data'

const ROW_ORDER = [
  'あ-row', 'か-row', 'さ-row', 'た-row', 'な-row',
  'は-row', 'ま-row', 'や-row', 'ら-row', 'わ-row',
]

const COL_LABELS = ['a', 'i', 'u', 'e', 'o']

interface CharacterGridProps {
  selectedGlyphs: Set<string>
  onSelectionChange: (glyphs: Set<string>) => void
}

function KanaGrid({
  syllabary,
  selectedGlyphs,
  onToggle,
  onSetBatch,
}: {
  syllabary: Syllabary
  selectedGlyphs: Set<string>
  onToggle: (glyph: string) => void
  onSetBatch: (glyphs: string[], selected: boolean) => void
}) {
  const allChars = getAllChars()
  const label = syllabary === 'hiragana' ? 'Hiragana ひらがな' : 'Katakana カタカナ'

  const charsInColumn = getCharsBySyllabary(syllabary)
  const selectedInColumn = charsInColumn.filter(c => selectedGlyphs.has(c.glyph))
  const allInColumnSelected = charsInColumn.length === selectedInColumn.length

  function handleSelectAll() {
    const unselected = charsInColumn
      .filter(c => !selectedGlyphs.has(c.glyph))
      .map(c => c.glyph)
    if (unselected.length > 0) onSetBatch(unselected, true)
  }

  function handleDeselectAll() {
    const selected = selectedInColumn.map(c => c.glyph)
    if (selected.length > 0) onSetBatch(selected, false)
  }

  return (
    <div className="flex-1 min-w-0">
      <h2 className="text-lg font-bold text-center mb-1 dark:text-gray-100">{label}</h2>
      <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-2">
        {selectedInColumn.length} / {charsInColumn.length} selected
      </p>
      <div className="flex justify-center gap-2 mb-3">
        <button
          type="button"
          onClick={handleSelectAll}
          disabled={allInColumnSelected}
          className="px-3 py-1 text-xs rounded border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30
                     text-gray-700 dark:text-gray-300
                     disabled:opacity-30 disabled:cursor-not-allowed
                     transition-colors"
        >
          Select all
        </button>
        <button
          type="button"
          onClick={handleDeselectAll}
          disabled={selectedInColumn.length === 0}
          className="px-3 py-1 text-xs rounded border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/30
                     text-gray-700 dark:text-gray-300
                     disabled:opacity-30 disabled:cursor-not-allowed
                     transition-colors"
        >
          Deselect all
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="border-collapse mx-auto text-center">
          <thead>
            <tr>
              <th className="w-10" />
              {COL_LABELS.map(col => (
                <th key={col} className="w-14 px-1 pb-2 text-xs text-gray-500 dark:text-gray-400 font-normal">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROW_ORDER.map(rowName => {
              const chars = getCharsByRow(rowName)
                .filter(c => c.syllabary === syllabary && c.type === 'base')
                .sort((a, b) => a.column - b.column)

              if (chars.length === 0) return null

              return (
                <tr key={rowName}>
                  <td className="text-xs text-gray-400 dark:text-gray-500 pr-2 text-right whitespace-nowrap">
                    {rowName.replace('-row', '')}
                  </td>
                  {[1, 2, 3, 4, 5].map(col => {
                    const char = chars.find(c => c.column === col)
                    if (!char) {
                      return <td key={col} className="p-1"><span className="inline-block w-12 h-12" /></td>
                    }
                    const isSelected = selectedGlyphs.has(char.glyph)
                    return (
                      <td key={col} className="p-1">
                        <button
                          type="button"
                          onClick={() => onToggle(char.glyph)}
                          title={`${char.glyph} = ${char.romaji}`}
                          className={`inline-flex items-center justify-center
                                     w-12 h-12 rounded-lg
                                     text-xl font-medium
                                     border transition-colors cursor-pointer
                                     ${isSelected
                                       ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-400 dark:border-blue-500 text-blue-900 dark:text-blue-200'
                                       : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 text-gray-800 dark:text-gray-200'
                                     }`}
                        >
                          {char.glyph}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
            {/* Standalone ん / ン row */}
            {(() => {
              const nChar = allChars.find(
                c => c.syllabary === syllabary && c.type === 'base' && c.romaji === 'n'
              )
              if (!nChar) return null
              const isSelected = selectedGlyphs.has(nChar.glyph)
              return (
                <tr>
                  <td className="text-xs text-gray-400 dark:text-gray-500 pr-2 text-right">n</td>
                  <td colSpan={5} className="p-1">
                    <button
                      type="button"
                      onClick={() => onToggle(nChar.glyph)}
                      title={`${nChar.glyph} = ${nChar.romaji}`}
                      className={`inline-flex items-center justify-center
                                 w-12 h-12 rounded-lg
                                 text-xl font-medium
                                 border transition-colors cursor-pointer
                                 ${isSelected
                                   ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-400 dark:border-blue-500 text-blue-900 dark:text-blue-200'
                                   : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 text-gray-800 dark:text-gray-200'
                                 }`}
                    >
                      {nChar.glyph}
                    </button>
                  </td>
                </tr>
              )
            })()}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function CharacterGrid({ selectedGlyphs, onSelectionChange }: CharacterGridProps) {
  const handleToggle = useCallback(
    (glyph: string) => {
      const next = new Set(selectedGlyphs)
      if (next.has(glyph)) {
        next.delete(glyph)
      } else {
        next.add(glyph)
      }
      onSelectionChange(next)
    },
    [selectedGlyphs, onSelectionChange],
  )

  const handleSetBatch = useCallback(
    (glyphs: string[], selected: boolean) => {
      const next = new Set(selectedGlyphs)
      for (const g of glyphs) {
        if (selected) next.add(g)
        else next.delete(g)
      }
      onSelectionChange(next)
    },
    [selectedGlyphs, onSelectionChange],
  )

  const selectedCount = selectedGlyphs.size

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col lg:flex-row gap-8 justify-center">
        <KanaGrid
          syllabary="hiragana"
          selectedGlyphs={selectedGlyphs}
          onToggle={handleToggle}
          onSetBatch={handleSetBatch}
        />
        <KanaGrid
          syllabary="katakana"
          selectedGlyphs={selectedGlyphs}
          onToggle={handleToggle}
          onSetBatch={handleSetBatch}
        />
      </div>

      {selectedCount > 0 && (
        <div className="text-center mt-8">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {selectedCount} character{selectedCount !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  )
}
