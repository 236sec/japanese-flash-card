import type { KanaChar } from '@/lib/kana/data'

export type Direction = 'kana→romaji'

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

export type SessionState =
  | { phase: 'selecting' }
  | {
      phase: 'quizzing'
      currentIndex: number
      answered: AnswerResult[]
      shuffled: KanaChar[]
    }
  | {
      phase: 'reviewing'
      currentIndex: number
      answered: AnswerResult[]
      lastAnswer: string
      correctAnswer: string
      shuffled: KanaChar[]
    }
  | { phase: 'finished'; score: Score; answered: AnswerResult[] }
