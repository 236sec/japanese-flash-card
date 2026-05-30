import type { KanaChar } from './data'
import { getAllChars } from './data'

export type ModifierType = 'dakuten' | 'handakuten'

/** Rows that accept dakuten (゛) */
const DAKUTEN_ROWS = new Set(['か-row', 'さ-row', 'た-row', 'は-row'])

/** Rows that accept handakuten (゜) */
const HANDAKUTEN_ROWS = new Set(['は-row'])

/**
 * Check whether a modifier can be applied to a base character.
 * Non-base characters (already modified, yōon, sokuon) return false.
 */
export function canApplyModifier(
  char: KanaChar,
  modifier: ModifierType,
): boolean {
  if (char.type !== 'base') return false

  if (modifier === 'dakuten') {
    return DAKUTEN_ROWS.has(char.row)
  }

  // handakuten
  return HANDAKUTEN_ROWS.has(char.row)
}

/**
 * Compose a base character with a modifier.
 * Returns the modified KanaChar, or undefined if the modifier cannot be applied.
 */
export function composeChar(
  base: KanaChar,
  modifier: ModifierType,
): KanaChar | undefined {
  if (!canApplyModifier(base, modifier)) return undefined

  const targetType = modifier === 'dakuten' ? 'dakuten' : 'handakuten'

  // Find the modified character by matching syllabary, row, column, and type
  const all = getAllChars()
  return all.find(
    c =>
      c.syllabary === base.syllabary &&
      c.row === base.row &&
      c.column === base.column &&
      c.type === targetType,
  )
}
