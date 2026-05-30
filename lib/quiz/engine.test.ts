import { describe, it, expect } from 'vitest'
import { createSession, submitAnswer, advance } from './engine'
import { getAllChars } from '@/lib/kana/data'

describe('Quiz Engine', () => {
  describe('createSession', () => {
    it('returns a quizzing session with shuffled characters', () => {
      const chars = [getAllChars()[0], getAllChars()[1], getAllChars()[2]]
      const state = createSession(chars, 'kana→romaji')

      expect(state.phase).toBe('quizzing')
      if (state.phase !== 'quizzing') return

      expect(state.currentIndex).toBe(0)
      expect(state.answered).toEqual([])
      // shuffled contains exactly the input characters
      expect(state.shuffled).toHaveLength(chars.length)
      expect(state.shuffled.map(c => c.glyph).sort()).toEqual(
        chars.map(c => c.glyph).sort(),
      )
    })
  })

  describe('submitAnswer', () => {
    it('records a correct answer and advances to the next prompt', () => {
      const chars = [
        getAllChars().find(c => c.romaji === 'a')!,
        getAllChars().find(c => c.romaji === 'i')!,
      ]
      const state = createSession(chars, 'kana→romaji')
      if (state.phase !== 'quizzing') throw new Error('expected quizzing')

      const prompt = state.shuffled[0]
      const next = submitAnswer(state, prompt.romaji, 1500)

      expect(next.phase).toBe('quizzing')
      if (next.phase !== 'quizzing') return

      expect(next.currentIndex).toBe(1)
      expect(next.answered).toHaveLength(1)
      expect(next.answered[0]).toEqual({
        character: prompt,
        correct: true,
        userAnswer: prompt.romaji,
        answeredAtMs: 1500,
      })
      // shuffled array preserved
      expect(next.shuffled).toEqual(state.shuffled)
    })

    it('transitions to reviewing phase on wrong answer with correct answer shown', () => {
      const chars = [getAllChars().find(c => c.romaji === 'ka')!]
      const state = createSession(chars, 'kana→romaji')
      if (state.phase !== 'quizzing') throw new Error('expected quizzing')

      const next = submitAnswer(state, 'wrong', 500)

      expect(next.phase).toBe('reviewing')
      if (next.phase !== 'reviewing') return

      expect(next.currentIndex).toBe(0) // stays on same prompt
      expect(next.lastAnswer).toBe('wrong')
      expect(next.correctAnswer).toBe('ka')
      expect(next.answered).toHaveLength(1)
      expect(next.answered[0].correct).toBe(false)
      expect(next.shuffled).toEqual(state.shuffled)
    })

    it('matches Hepburn romaji case-insensitively with trimming', () => {
      const chars = [getAllChars().find(c => c.romaji === 'shi')!]
      const state = createSession(chars, 'kana→romaji')
      if (state.phase !== 'quizzing') throw new Error('expected quizzing')

      // Upper case with extra whitespace
      const next = submitAnswer(state, '  SHI  ', 200)
      expect(next.phase).toBe('finished')
      if (next.phase !== 'finished') return
      expect(next.score.correct).toBe(1)
      expect(next.score.incorrect).toBe(0)
    })
  })

  describe('advance', () => {
    it('moves from reviewing to the next prompt (or finishes)', () => {
      const chars = [
        getAllChars().find(c => c.romaji === 'a')!,
        getAllChars().find(c => c.romaji === 'i')!,
      ]
      let state = createSession(chars, 'kana→romaji')
      if (state.phase !== 'quizzing') throw new Error('expected quizzing')

      // Submit wrong answer to enter reviewing
      state = submitAnswer(state, 'wrong', 100)
      expect(state.phase).toBe('reviewing')
      if (state.phase !== 'reviewing') return

      // Advance from reviewing
      const advanced = advance(state)
      expect(advanced.phase).toBe('quizzing')
      if (advanced.phase !== 'quizzing') return
      expect(advanced.currentIndex).toBe(1)
      expect(advanced.answered).toHaveLength(1)
    })

    it('finishes session when advancing from reviewing on last character', () => {
      const chars = [getAllChars().find(c => c.romaji === 'a')!]
      let state = createSession(chars, 'kana→romaji')
      if (state.phase !== 'quizzing') throw new Error('expected quizzing')

      state = submitAnswer(state, 'wrong', 100)
      expect(state.phase).toBe('reviewing')
      if (state.phase !== 'reviewing') return

      const finished = advance(state)
      expect(finished.phase).toBe('finished')
      if (finished.phase !== 'finished') return
      expect(finished.score.total).toBe(1)
      expect(finished.score.correct).toBe(0)
      expect(finished.score.incorrect).toBe(1)
    })
  })

  describe('complete session', () => {
    it('produces correct Score when all answers are correct', () => {
      const chars = [
        getAllChars().find(c => c.romaji === 'a')!,
        getAllChars().find(c => c.romaji === 'i')!,
        getAllChars().find(c => c.romaji === 'u')!,
      ]
      let state = createSession(chars, 'kana→romaji')
      if (state.phase !== 'quizzing') throw new Error('expected quizzing')

      const timestamps = [100, 250, 500]
      for (let i = 0; i < chars.length; i++) {
        const char = state.shuffled[i]
        state = submitAnswer(state, char.romaji, timestamps[i])
      }

      expect(state.phase).toBe('finished')
      if (state.phase !== 'finished') return

      expect(state.score.total).toBe(3)
      expect(state.score.correct).toBe(3)
      expect(state.score.incorrect).toBe(0)
      expect(state.score.misses).toEqual([])
      expect(state.score.elapsedMs).toBe(500)
    })

    it('records elapsedMs in each AnswerResult and the final Score', () => {
      const chars = [
        getAllChars().find(c => c.romaji === 'a')!,
        getAllChars().find(c => c.romaji === 'i')!,
      ]
      let state = createSession(chars, 'kana→romaji')
      if (state.phase !== 'quizzing') throw new Error('expected quizzing')

      // First answer at 1000ms
      state = submitAnswer(state, state.shuffled[0].romaji, 1000)
      if (state.phase !== 'quizzing') throw new Error('expected quizzing')
      expect(state.answered[0].answeredAtMs).toBe(1000)

      // Second answer at 3500ms
      state = submitAnswer(state, state.shuffled[1].romaji, 3500)
      expect(state.phase).toBe('finished')
      if (state.phase !== 'finished') return

      expect(state.answered[0].answeredAtMs).toBe(1000)
      expect(state.answered[1].answeredAtMs).toBe(3500)
      expect(state.score.elapsedMs).toBe(3500)
    })

    it('produces correct Score with mixed correct/incorrect answers', () => {
      const chars = [
        getAllChars().find(c => c.romaji === 'ka')!,
        getAllChars().find(c => c.romaji === 'ki')!,
      ]
      let state = createSession(chars, 'kana→romaji')
      if (state.phase !== 'quizzing') throw new Error('expected quizzing')

      // First answer: correct
      const firstGlyph = state.shuffled[0].glyph
      const firstRomaji = state.shuffled[0].romaji
      state = submitAnswer(state, firstRomaji, 200)

      // Second answer: wrong → reviewing
      state = submitAnswer(state, 'xxxx', 400)
      expect(state.phase).toBe('reviewing')
      if (state.phase !== 'reviewing') return

      // Advance → finished
      state = advance(state)
      expect(state.phase).toBe('finished')
      if (state.phase !== 'finished') return

      expect(state.score.total).toBe(2)
      expect(state.score.correct).toBe(1)
      expect(state.score.incorrect).toBe(1)
      expect(state.score.misses).toHaveLength(1)
      expect(state.score.misses[0].glyph).toBe(
        chars.find(c => c.glyph !== firstGlyph)!.glyph,
      )
      expect(state.score.elapsedMs).toBe(400)
    })
  })

  describe('retry', () => {
    it('creates a new session from missed characters of a completed score', () => {
      const allChars = getAllChars()
      const a = allChars.find(c => c.romaji === 'a')!
      const i = allChars.find(c => c.romaji === 'i')!
      const u = allChars.find(c => c.romaji === 'u')!

      const missed = [i, u]
      const state = createSession(missed, 'kana→romaji')

      expect(state.phase).toBe('quizzing')
      if (state.phase !== 'quizzing') return
      expect(state.shuffled).toHaveLength(2)
      expect(state.shuffled.map(c => c.glyph).sort()).toEqual(
        [i.glyph, u.glyph].sort(),
      )
      expect(state.currentIndex).toBe(0)
      expect(state.answered).toEqual([])
    })

    it('correctly extracts missed characters through the full session lifecycle', () => {
      const allChars = getAllChars()
      const a = allChars.find(c => c.romaji === 'a')!
      const i = allChars.find(c => c.romaji === 'i')!

      // Complete a session: first char correct, second incorrect
      let state = createSession([a, i], 'kana→romaji')
      if (state.phase !== 'quizzing') throw new Error('expected quizzing')

      const firstRomaji = state.shuffled[0].romaji
      const secondGlyph = state.shuffled[1].glyph

      state = submitAnswer(state, firstRomaji, 500)
      if (state.phase !== 'quizzing') throw new Error('expected quizzing')

      state = submitAnswer(state, 'wrong', 1000)
      if (state.phase !== 'reviewing') throw new Error('expected reviewing')
      state = advance(state)

      expect(state.phase).toBe('finished')
      if (state.phase !== 'finished') return
      expect(state.score.misses).toHaveLength(1)
      expect(state.score.misses[0].glyph).toBe(secondGlyph)

      // Retry with missed chars
      const retry = createSession(state.score.misses, 'kana→romaji')
      expect(retry.phase).toBe('quizzing')
      if (retry.phase !== 'quizzing') return
      expect(retry.shuffled).toHaveLength(1)
      expect(retry.shuffled[0].glyph).toBe(secondGlyph)
    })
  })
})
