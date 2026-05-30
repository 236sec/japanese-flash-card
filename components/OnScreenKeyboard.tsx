'use client'

import { useState, useCallback } from 'react'
import { getAllChars, getCharsBySyllabary, type Syllabary } from '@/lib/kana/data'
import { composeChar, canApplyModifier, type ModifierType } from '@/lib/kana/composition'
import type { KanaChar } from '@/lib/kana/data'

const ROW_ORDER = [
  'あ-row', 'か-row', 'さ-row', 'た-row', 'な-row',
  'は-row', 'ま-row', 'や-row', 'ら-row', 'わ-row',
] as const

const COL_LABELS = ['a', 'i', 'u', 'e', 'o']

interface OnScreenKeyboardProps {
  onCommitChar: (char: string) => void
}

export default function OnScreenKeyboard({
  onCommitChar,
}: OnScreenKeyboardProps) {
  const [syllabary, setSyllabary] = useState<Syllabary>('hiragana')
  const [isOpen, setIsOpen] = useState(true)
  const [pending, setPending] = useState<KanaChar | null>(null)

  const commit = useCallback(
    (glyph: string) => {
      onCommitChar(glyph)
    },
    [onCommitChar],
  )

  const handleBaseClick = useCallback(
    (char: KanaChar) => {
      // If there's a pending character, commit it first
      if (pending) {
        commit(pending.glyph)
      }
      setPending(char)
    },
    [pending, commit],
  )

  const handleModifierClick = useCallback(
    (modifier: ModifierType) => {
      if (!pending) return
      if (!canApplyModifier(pending, modifier)) return

      const composed = composeChar(pending, modifier)
      if (composed) {
        commit(composed.glyph)
        setPending(null)
      }
    },
    [pending, commit],
  )

  const handleClearPending = useCallback(() => {
    if (pending) {
      commit(pending.glyph)
      setPending(null)
    }
  }, [pending, commit])

  const baseChars = getCharsBySyllabary(syllabary).filter(
    c => c.type === 'base',
  )

  const dakutenEnabled = pending ? canApplyModifier(pending, 'dakuten') : false
  const handakutenEnabled = pending
    ? canApplyModifier(pending, 'handakuten')
    : false

  return (
    <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
      {/* Header: tabs + toggle + pending */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        {/* Syllabary tabs */}
        <div className="flex gap-1 text-sm">
          <button
            type="button"
            onClick={() => {
              setPending(null)
              setSyllabary('hiragana')
            }}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              syllabary === 'hiragana'
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Hiragana
          </button>
          <button
            type="button"
            onClick={() => {
              setPending(null)
              setSyllabary('katakana')
            }}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              syllabary === 'katakana'
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Katakana
          </button>
        </div>

        {/* Pending character preview */}
        <div className="flex items-center gap-2">
          {pending && (
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <span className="text-gray-400 dark:text-gray-500">Pending:</span>
              <span className="text-lg font-medium text-blue-600 dark:text-blue-400">
                {pending.glyph}
              </span>
              <button
                type="button"
                onClick={handleClearPending}
                className="text-xs text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline ml-1"
                title="Commit and clear"
              >
                use
              </button>
            </div>
          )}

          {/* Keyboard toggle */}
          <button
            type="button"
            onClick={() => setIsOpen(o => !o)}
            className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600
                       text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label={isOpen ? 'Hide keyboard' : 'Show keyboard'}
          >
            {isOpen ? 'Hide' : 'Show'} ⌨
          </button>
        </div>
      </div>

      {/* Keyboard grid */}
      {isOpen && (
        <div className="p-3">
          <table className="border-collapse mx-auto text-center">
            <thead>
              <tr>
                <th className="w-8" />
                {COL_LABELS.map(col => (
                  <th
                    key={col}
                    className="w-10 px-0.5 pb-1 text-xs text-gray-400 dark:text-gray-500 font-normal"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROW_ORDER.map(rowName => {
                const chars = baseChars
                  .filter(c => c.row === rowName)
                  .sort((a, b) => a.column - b.column)

                if (chars.length === 0) return null

                return (
                  <tr key={rowName}>
                    <td className="text-xs text-gray-400 dark:text-gray-500 pr-1 text-right whitespace-nowrap">
                      {rowName.replace('-row', '')}
                    </td>
                    {[1, 2, 3, 4, 5].map(col => {
                      const char = chars.find(c => c.column === col)
                      if (!char) {
                        return (
                          <td key={col} className="p-0.5">
                            <span className="inline-block w-10 h-10" />
                          </td>
                        )
                      }
                      const isPending = pending?.glyph === char.glyph
                      return (
                        <td key={col} className="p-0.5">
                          <button
                            type="button"
                            onClick={() => handleBaseClick(char)}
                            className={`inline-flex items-center justify-center
                                       w-10 h-10 rounded-lg text-lg font-medium
                                       border transition-colors cursor-pointer
                                       ${
                                         isPending
                                           ? 'bg-blue-200 dark:bg-blue-800 border-blue-500 dark:border-blue-400 text-blue-900 dark:text-blue-100 ring-2 ring-blue-300 dark:ring-blue-500'
                                           : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 text-gray-800 dark:text-gray-200'
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
              {/* ん / ン row */}
              {(() => {
                const nChar = baseChars.find(c => c.romaji === 'n')
                if (!nChar) return null
                const isPending = pending?.glyph === nChar.glyph
                return (
                  <tr>
                    <td className="text-xs text-gray-400 dark:text-gray-500 pr-1 text-right">n</td>
                    <td colSpan={5} className="p-0.5">
                      <button
                        type="button"
                        onClick={() => handleBaseClick(nChar)}
                        className={`inline-flex items-center justify-center
                                   w-10 h-10 rounded-lg text-lg font-medium
                                   border transition-colors cursor-pointer
                                   ${
                                     isPending
                                       ? 'bg-blue-200 dark:bg-blue-800 border-blue-500 dark:border-blue-400 text-blue-900 dark:text-blue-100 ring-2 ring-blue-300 dark:ring-blue-500'
                                       : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 text-gray-800 dark:text-gray-200'
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

          {/* Modifier buttons */}
          <div className="flex justify-center gap-3 mt-3">
            <button
              type="button"
              onClick={() => handleModifierClick('dakuten')}
              disabled={!dakutenEnabled}
              className="px-5 py-2 text-lg rounded-lg border font-medium
                         transition-colors
                         disabled:opacity-30 disabled:cursor-not-allowed
                         enabled:bg-yellow-50 dark:enabled:bg-yellow-900/30 enabled:border-yellow-400 dark:enabled:border-yellow-600
                         enabled:text-yellow-800 dark:enabled:text-yellow-300 enabled:hover:bg-yellow-100 dark:enabled:hover:bg-yellow-900/50"
            >
              ゛ dakuten
            </button>
            <button
              type="button"
              onClick={() => handleModifierClick('handakuten')}
              disabled={!handakutenEnabled}
              className="px-5 py-2 text-lg rounded-lg border font-medium
                         transition-colors
                         disabled:opacity-30 disabled:cursor-not-allowed
                         enabled:bg-green-50 dark:enabled:bg-green-900/30 enabled:border-green-400 dark:enabled:border-green-600
                         enabled:text-green-800 dark:enabled:text-green-300 enabled:hover:bg-green-100 dark:enabled:hover:bg-green-900/50"
            >
              ゜ handakuten
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
