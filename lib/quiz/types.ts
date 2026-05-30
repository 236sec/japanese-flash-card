import type { KanaChar } from '@/lib/kana/data'

export type Direction = 'kana→romaji' | 'romaji→kana'

export interface AnswerResult {
  character: KanaChar
  correct: boolean
  userAnswer: string
  answeredAtMs: number
}

export interface Score {
  total: number
  correct: number
  incorrect: number
  elapsedMs: number
  misses: KanaChar[]
}

export interface MissEntry {
  glyph: string
  romaji: string
}

/** A Score that has been persisted to history (serializable). */
export interface ScoreEntry {
  id: string
  date: string
  direction: Direction
  total: number
  correct: number
  incorrect: number
  elapsedMs: number
  misses: MissEntry[]
}

export type SessionState =
  | { phase: 'selecting' }
  | {
      phase: 'quizzing'
      currentIndex: number
      answered: AnswerResult[]
      shuffled: KanaChar[]
      direction: Direction
    }
  | {
      phase: 'reviewing'
      currentIndex: number
      answered: AnswerResult[]
      lastAnswer: string
      correctAnswer: string
      shuffled: KanaChar[]
      direction: Direction
    }
  | { phase: 'finished'; score: Score; answered: AnswerResult[] }
