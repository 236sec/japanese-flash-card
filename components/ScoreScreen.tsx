import type { Score, AnswerResult } from '@/lib/quiz/types'
import type { KanaChar } from '@/lib/kana/data'

interface ScoreScreenProps {
  score: Score
  answered: AnswerResult[]
  elapsedMs: number
  onRetry: (missedChars: KanaChar[]) => void
  onBack: () => void
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const tenths = Math.floor((ms % 1000) / 100)
  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, '0')}.${tenths}`
  }
  return `${seconds}.${tenths}s`
}

export default function ScoreScreen({
  score,
  answered,
  elapsedMs,
  onRetry,
  onBack,
}: ScoreScreenProps) {
  const percentage =
    score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0
  const hasMisses = score.misses.length > 0

  return (
    <div className="max-w-lg mx-auto p-6 text-center">
      <h2 className="text-2xl font-bold mb-2 dark:text-gray-100">Session Complete</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">{formatTime(elapsedMs)}</p>

      <div className="text-5xl font-bold mb-6 text-blue-600 dark:text-blue-400">{percentage}%</div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{score.total}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{score.correct}</div>
          <div className="text-xs text-green-500 dark:text-green-400 mt-1">Correct</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-3">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{score.incorrect}</div>
          <div className="text-xs text-red-500 dark:text-red-400 mt-1">Incorrect</div>
        </div>
      </div>

      {/* Missed Characters */}
      {hasMisses ? (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Missed Characters
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {score.misses.map((char, i) => {
              const result = answered.find(
                a => a.character.glyph === char.glyph,
              )
              return (
                <div
                  key={i}
                  className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2 text-center"
                >
                  <div className="text-xl dark:text-gray-100">{char.glyph}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{char.romaji}</div>
                  <div className="text-xs text-red-400 dark:text-red-400 mt-0.5">
                    You wrote: {result?.userAnswer}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="mb-8">
          <p className="text-green-600 dark:text-green-400 font-medium text-lg">
            Perfect score!
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            No characters to retry
          </p>
        </div>
      )}

      {/* Retry + Back buttons */}
      <div className="flex flex-col gap-3">
        {hasMisses && (
          <button
            type="button"
            onClick={() => onRetry(score.misses)}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium
                       hover:bg-orange-600 transition-colors"
          >
            Retry Missed Characters
          </button>
        )}
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium
                     hover:bg-blue-700 transition-colors"
        >
          Back to Selection
        </button>
      </div>
    </div>
  )
}
