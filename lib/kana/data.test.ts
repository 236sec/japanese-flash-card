import { describe, it, expect } from 'vitest'
import { getAllChars, getCharsBySyllabary, getCharsByType } from './data'

// Valid Hepburn romaji patterns:
// Single vowels, consonant+vowel, yōon digraphs, dakuten, handakuten
const HEPBURN_ROMAJI = new Set([
  // Vowels
  'a', 'i', 'u', 'e', 'o',
  // K-row
  'ka', 'ki', 'ku', 'ke', 'ko',
  // G-row (dakuten)
  'ga', 'gi', 'gu', 'ge', 'go',
  // S-row
  'sa', 'shi', 'su', 'se', 'so',
  // Z-row (dakuten)
  'za', 'ji', 'zu', 'ze', 'zo',
  // T-row
  'ta', 'chi', 'tsu', 'te', 'to',
  // D-row (dakuten)
  'da', 'de', 'do',
  // N-row
  'na', 'ni', 'nu', 'ne', 'no',
  // H-row
  'ha', 'hi', 'fu', 'he', 'ho',
  // B-row (dakuten)
  'ba', 'bi', 'bu', 'be', 'bo',
  // P-row (handakuten)
  'pa', 'pi', 'pu', 'pe', 'po',
  // M-row
  'ma', 'mi', 'mu', 'me', 'mo',
  // Y-row
  'ya', 'yu', 'yo',
  // R-row
  'ra', 'ri', 'ru', 're', 'ro',
  // W-row
  'wa', 'wo',
  // Standalone n
  'n',
  // Yōon - K-row
  'kya', 'kyu', 'kyo',
  // Yōon - G-row
  'gya', 'gyu', 'gyo',
  // Yōon - S-row
  'sha', 'shu', 'sho',
  // Yōon - J-row
  'ja', 'ju', 'jo',
  // Yōon - T-row
  'cha', 'chu', 'cho',
  // Yōon - N-row
  'nya', 'nyu', 'nyo',
  // Yōon - H-row
  'hya', 'hyu', 'hyo',
  // Yōon - B-row
  'bya', 'byu', 'byo',
  // Yōon - P-row
  'pya', 'pyu', 'pyo',
  // Yōon - M-row
  'mya', 'myu', 'myo',
  // Yōon - R-row
  'rya', 'ryu', 'ryo',
])

describe('Kana Data', () => {
  describe('character count', () => {
    it('has approximately 210 characters total', () => {
      const all = getAllChars()
      expect(all.length).toBeGreaterThanOrEqual(200)
      expect(all.length).toBeLessThanOrEqual(220)
    })

    it('has roughly equal hiragana and katakana characters', () => {
      const hiragana = getCharsBySyllabary('hiragana')
      const katakana = getCharsBySyllabary('katakana')
      expect(hiragana.length).toBe(katakana.length)
      expect(hiragana.length).toBeGreaterThan(90)
    })

    it('has correct counts by type', () => {
      const base = getCharsByType('base')
      const dakuten = getCharsByType('dakuten')
      const handakuten = getCharsByType('handakuten')
      const yoon = getCharsByType('yōon')
      const sokuon = getCharsByType('sokuon')

      // base gojūon: 46 per syllabary = 92 total
      expect(base.length).toBe(92)
      // dakuten: 20 per syllabary = 40 total
      expect(dakuten.length).toBe(40)
      // handakuten: 5 per syllabary = 10 total
      expect(handakuten.length).toBe(10)
      // yōon: ~36 per syllabary = 72 total
      expect(yoon.length).toBe(72)
      // sokuon: 1 per syllabary = 2 total
      expect(sokuon.length).toBe(2)
    })
  })

  describe('romaji format', () => {
    it('all romaji are valid Hepburn romanization', () => {
      const all = getAllChars()
      for (const char of all) {
        expect(
          HEPBURN_ROMAJI.has(char.romaji),
          `"${char.romaji}" (glyph: ${char.glyph}) is not valid Hepburn`,
        ).toBe(true)
      }
    })

    it('all romaji are lowercase and contain only ASCII letters', () => {
      const all = getAllChars()
      for (const char of all) {
        expect(char.romaji).toBe(char.romaji.toLowerCase())
        expect(char.romaji).toMatch(/^[a-z]+$/)
      }
    })
  })

  describe('uniqueness', () => {
    it('has no duplicate glyphs', () => {
      const all = getAllChars()
      const glyphs = all.map(c => c.glyph)
      const unique = new Set(glyphs)
      expect(unique.size).toBe(all.length)
    })
  })
})
