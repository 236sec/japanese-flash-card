import { describe, it, expect } from 'vitest'
import { getAllChars, getCharByGlyph } from './data'
import { composeChar, canApplyModifier } from './composition'

describe('Kana Composition', () => {
  describe('composeChar', () => {
    it('composes か + ゛ → が (hiragana, dakuten)', () => {
      const base = getCharByGlyph('か')
      const result = composeChar(base!, 'dakuten')
      expect(result).toBeDefined()
      expect(result!.glyph).toBe('が')
      expect(result!.romaji).toBe('ga')
      expect(result!.type).toBe('dakuten')
    })

    it('composes は + ゜ → ぱ (hiragana, handakuten)', () => {
      const base = getCharByGlyph('は')
      const result = composeChar(base!, 'handakuten')
      expect(result).toBeDefined()
      expect(result!.glyph).toBe('ぱ')
      expect(result!.romaji).toBe('pa')
      expect(result!.type).toBe('handakuten')
    })

    it('composes カ + ゛ → ガ (katakana, dakuten)', () => {
      const base = getCharByGlyph('カ')
      const result = composeChar(base!, 'dakuten')
      expect(result).toBeDefined()
      expect(result!.glyph).toBe('ガ')
      expect(result!.romaji).toBe('ga')
    })

    it('composes ハ + ゜ → パ (katakana, handakuten)', () => {
      const base = getCharByGlyph('ハ')
      const result = composeChar(base!, 'handakuten')
      expect(result).toBeDefined()
      expect(result!.glyph).toBe('パ')
    })

    it('returns undefined for modifier on vowel row (あ-row)', () => {
      const base = getCharByGlyph('あ')
      const result = composeChar(base!, 'dakuten')
      expect(result).toBeUndefined()
    })

    it('returns undefined for handakuten on か-row', () => {
      const base = getCharByGlyph('か')
      const result = composeChar(base!, 'handakuten')
      expect(result).toBeUndefined()
    })

    it('returns undefined for dakuten on ま-row', () => {
      const base = getCharByGlyph('ま')
      const result = composeChar(base!, 'dakuten')
      expect(result).toBeUndefined()
    })

    it('returns undefined for modifiers on や-row', () => {
      const base = getCharByGlyph('や')
      const daku = composeChar(base!, 'dakuten')
      const handaku = composeChar(base!, 'handakuten')
      expect(daku).toBeUndefined()
      expect(handaku).toBeUndefined()
    })

    it('returns undefined for modifiers on ん', () => {
      const base = getCharByGlyph('ん')
      const result = composeChar(base!, 'dakuten')
      expect(result).toBeUndefined()
    })

    it('returns undefined for modifiers on non-base characters (dakuten already)', () => {
      const base = getCharByGlyph('が')
      const result = composeChar(base!, 'dakuten')
      expect(result).toBeUndefined()
    })

    it('returns undefined for modifiers on non-base characters (handakuten already)', () => {
      const base = getCharByGlyph('ぱ')
      const result = composeChar(base!, 'handakuten')
      expect(result).toBeUndefined()
    })

    it('composes correctly for all dakuten-capable base characters in hiragana', () => {
      const bases = getAllChars().filter(
        c => c.syllabary === 'hiragana' && c.type === 'base',
      )

      for (const base of bases) {
        const result = composeChar(base, 'dakuten')
        if (result) {
          expect(result.type).toBe('dakuten')
          expect(result.syllabary).toBe('hiragana')
          expect(result.row).toBe(base.row)
          expect(result.column).toBe(base.column)
        } else {
          // No dakuten variant for this base
          const row = base.row
          const allowedRows = ['か-row', 'さ-row', 'た-row', 'は-row']
          expect(allowedRows).not.toContain(row)
        }
      }
    })
  })

  describe('canApplyModifier', () => {
    it('returns true for か + dakuten', () => {
      const base = getCharByGlyph('か')
      expect(canApplyModifier(base!, 'dakuten')).toBe(true)
    })

    it('returns false for か + handakuten', () => {
      const base = getCharByGlyph('か')
      expect(canApplyModifier(base!, 'handakuten')).toBe(false)
    })

    it('returns true for は + dakuten', () => {
      const base = getCharByGlyph('は')
      expect(canApplyModifier(base!, 'dakuten')).toBe(true)
    })

    it('returns true for は + handakuten', () => {
      const base = getCharByGlyph('は')
      expect(canApplyModifier(base!, 'handakuten')).toBe(true)
    })

    it('returns false for あ + any modifier', () => {
      const base = getCharByGlyph('あ')
      expect(canApplyModifier(base!, 'dakuten')).toBe(false)
      expect(canApplyModifier(base!, 'handakuten')).toBe(false)
    })

    it('returns false for non-base characters', () => {
      const base = getCharByGlyph('が')
      expect(canApplyModifier(base!, 'dakuten')).toBe(false)
      expect(canApplyModifier(base!, 'handakuten')).toBe(false)
    })

    it('returns false for ん + any modifier', () => {
      const base = getCharByGlyph('ん')
      expect(canApplyModifier(base!, 'dakuten')).toBe(false)
      expect(canApplyModifier(base!, 'handakuten')).toBe(false)
    })
  })
})
