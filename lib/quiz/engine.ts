import type { KanaChar } from '@/lib/kana/data'
import type { SessionState, Direction } from './types'

/** Fisher-Yates shuffle (in-place, returns same array) */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Create a new quiz session from the given characters.
 * Characters are shuffled into a random order.
 */
export function createSession(
  chars: KanaChar[],
  _direction: Direction,
): SessionState {
  const shuffled = shuffle([...chars])

  return {
    phase: 'quizzing',
    currentIndex: 0,
    answered: [],
    shuffled,
  }
}

/**
 * Submit an answer for the current prompt.
 * Returns the next state based on correctness.
 */
export function submitAnswer(
  state: SessionState,
  answer: string,
  elapsedMs: number,
): SessionState {
  if (state.phase !== 'quizzing') return state

  const currentChar = state.shuffled[state.currentIndex]
  const normalized = answer.trim().toLowerCase()
  const correct = normalized === currentChar.romaji

  const result = {
    character: currentChar,
    correct,
    userAnswer: answer,
    answeredAtMs: elapsedMs,
  }

  const answered = [...state.answered, result]
  const isLast = state.currentIndex >= state.shuffled.length - 1

  if (correct) {
    if (isLast) {
      return {
        phase: 'finished',
        answered,
        score: {
          total: answered.length,
          correct: answered.filter(a => a.correct).length,
          incorrect: answered.filter(a => !a.correct).length,
          elapsedMs,
          misses: answered.filter(a => !a.correct).map(a => a.character),
        },
      }
    }
    return {
      phase: 'quizzing',
      currentIndex: state.currentIndex + 1,
      answered,
      shuffled: state.shuffled,
    }
  }

  // Incorrect answer — show reviewing phase
  return {
    phase: 'reviewing',
    currentIndex: state.currentIndex,
    answered,
    lastAnswer: answer,
    correctAnswer: currentChar.romaji,
    shuffled: state.shuffled,
  }
}

/**
 * Advance from the reviewing phase to the next prompt.
 * Must only be called when state.phase === 'reviewing'.
 */
export function advance(state: SessionState): SessionState {
  if (state.phase !== 'reviewing') return state

  const isLast = state.currentIndex >= state.shuffled.length - 1

  if (isLast) {
    return {
      phase: 'finished',
      answered: state.answered,
      score: {
        total: state.answered.length,
        correct: state.answered.filter(a => a.correct).length,
        incorrect: state.answered.filter(a => !a.correct).length,
        elapsedMs: state.answered[state.answered.length - 1]?.answeredAtMs ?? 0,
        misses: state.answered.filter(a => !a.correct).map(a => a.character),
      },
    }
  }

  return {
    phase: 'quizzing',
    currentIndex: state.currentIndex + 1,
    answered: state.answered,
    shuffled: state.shuffled,
  }
}
