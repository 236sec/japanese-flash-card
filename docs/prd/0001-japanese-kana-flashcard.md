# Japanese Kana Flashcard — PRD

## Problem Statement

A learner of Japanese needs to practice recognizing and writing hiragana and katakana characters. Existing flashcard tools either lack bidirectional practice (kana→romaji and romaji→kana), offer no character-level subset control, or bury the experience behind accounts and paywalls. The learner wants a simple, local web app where they pick exactly which characters to practice, quiz themselves in either direction, and see exactly what they missed.

## Solution

A single-page Next.js web app where the user selects individual kana characters from a side-by-side hiragana/katakana grid, picks a quiz Direction, answers prompts one at a time, and receives a Score screen showing correct count, elapsed time, and all Misses with a one-click Retry. All preferences and Session history persist in localStorage. No account, no backend.

## User Stories

1. As a learner, I want to see all 210+ kana characters organized by syllabary and row, so that I can understand the full set at a glance.
2. As a learner, I want to tick and untick individual characters in the grid, so that I can focus on exactly the characters I need to practice.
3. As a learner, I want to see hiragana and katakana grids side-by-side, so that I can select from both syllabaries without switching tabs.
4. As a learner, I want to choose the quiz Direction (kana→romaji or romaji→kana) before starting a Session, so that I can practice either recognition or recall.
5. As a learner, I want characters presented in random order during a Session, so that I'm tested on recall rather than memorizing sequence.
6. As a learner, I want to type my Answer in a text input and submit it, so that I actively produce the answer rather than passively flipping a card.
7. As a learner, I want Hepburn romanization to be the standard for matching Answers, so that there is no ambiguity about what is correct.
8. As a learner, I want to see whether my Answer was correct or incorrect immediately after submitting, so that I get instant feedback.
9. As a learner, I want to see the correct Answer displayed when I get a character wrong, so that I can learn from my mistake.
10. As a learner, I want to click "Next" manually after seeing feedback, so that I control the pace of my learning.
11. As a learner, I want to see the elapsed time during the Session, so that I can benchmark my speed.
12. As a learner, I want to see a Score screen at the end of each Session showing correct count out of total, elapsed time, and a list of all Missed Characters, so that I know exactly what to review.
13. As a learner, I want to click "Retry" on the Score screen to start a new Session with only my Missed Characters, so that I can reinforce weak areas immediately.
14. As a learner practicing romaji→kana, I want an on-screen Gojūon-grid keyboard I can toggle open/closed, so that I can input kana without installing a Japanese IME.
15. As a learner using the on-screen keyboard in romaji→kana mode, I want to compose dakuten and handakuten characters using modifier buttons (゛゜), so that I can enter the full kana set.
16. As a learner, I want my last-used character Selection to persist across page refreshes, so that I don't have to retick characters every visit.
17. As a learner, I want my last-used Direction preference to persist, so that I can jump straight into practice.
18. As a learner, I want my past Session Scores saved to Score History, so that I can track my progress over time.
19. As a learner, I want to view my Score History and see date, Direction, score, time, and Misses for each past Session, so that I can monitor improvement.
20. As a learner, I want the app to work entirely in the browser with no account needed, so that I can start practicing immediately.

## Implementation Decisions

### Modules

The app is composed of six modules:

**Kana Data** — Pure data: all ~210 kana character definitions. Each character has its glyph (e.g., `あ`), Hepburn romaji (e.g., `a`), syllabary (hiragana/katakana), type (base/dakuten/handakuten/yōon/sokuon), row (あ-row, か-row, etc.), and column position. Exported as a flat array and lookup helpers.

**Quiz Engine** — Pure logic with zero UI dependencies. Manages the Session state machine:

1. `selecting` — user is picking characters and direction
2. `quizzing` — prompts are being shown, accepting answers
3. `reviewing` — correct answer displayed after a miss, waiting for Next click
4. `finished` — all prompts answered, Score ready

Takes a character set and Direction, shuffles deterministically, validates Answers against Hepburn romaji (case-insensitive, trimmed), tracks correct/incorrect, maintains elapsed timer, and produces a Score result. Fully testable.

Session state shape from prototype:
```ts
type SessionState =
  | { phase: 'selecting' }
  | { phase: 'quizzing'; currentIndex: number; answered: AnswerResult[] }
  | { phase: 'reviewing'; currentIndex: number; answered: AnswerResult[]; lastAnswer: string; correctAnswer: string }
  | { phase: 'finished'; score: Score }

type AnswerResult = {
  character: KanaChar
  correct: boolean
  userAnswer: string
}
```

**Storage** — Abstracted persistence layer with an async interface. Wraps localStorage today; the async signature means it can be swapped for Server Functions or a fetch-based API later without changing consumers.

Interface shape:
```ts
interface StorageAdapter {
  getCharacterSelection(): Promise<Set<string>>
  setCharacterSelection(chars: Set<string>): Promise<void>
  getDirection(): Promise<Direction | null>
  setDirection(d: Direction): Promise<void>
  getScoreHistory(): Promise<ScoreEntry[]>
  addScoreEntry(entry: ScoreEntry): Promise<void>
  getSettings(): Promise<Settings>
  setSettings(s: Settings): Promise<void>
}
```

**Character Grid** — UI component: side-by-side columns (hiragana left, katakana right), each organized by row with tickable individual characters. Select-all/deselect-all per column.

**Quiz UI** — Two sub-components:
- **Quiz Card**: displays the Prompt (kana glyph or romaji text), input field, submit button, feedback (correct/incorrect with correct Answer), Next button during reviewing phase, elapsed timer.
- **Score Screen**: displays correct/total, elapsed time, list of Missed Characters with their readings, Retry button (starts new Session with Missed set), and back-to-selection button.

**Kana Keyboard** — Togglable on-screen keyboard in Gojūon grid layout (10 columns × 5 rows base). Modifier buttons (゛゜) apply to the currently selected base character to produce dakuten/handakuten variants. Toggle open/close button always visible during romaji→kana Sessions.

### Routing

Single-page app with no routing. All UI state is managed client-side. The page transitions between Selection → Quiz → Score are handled by the Quiz Engine's phase state, not by Next.js routes.

### Data flow

- Character definitions are imported statically from Kana Data
- Session state lives in React state (useReducer or useState)
- All persistence goes through the Storage adapter
- On mount, Storage is read to restore: last Selection, last Direction, Score History
- On Session end, the Score is written to Score History via Storage

### Character matching

Answers are matched case-insensitively and trimmed. Hepburn romanization is the single source of truth. No Kunrei-shiki aliases accepted.

### On-screen keyboard composition

User taps a base character (e.g., `か`) which populates the input. Tapping `゛` appends dakuten to produce `が`. Tapping `゜` appends handakuten. If the current base cannot take the modifier, the button is inert. Yōon are composed by selecting a base + small-ya/yu/yo combo.

## Testing Decisions

### What makes a good test

Tests verify external behavior — given inputs, what outputs and state transitions occur. No tests should depend on DOM, React rendering, or localStorage internals.

### Modules tested

- **Kana Data** — verify character count per syllabary and type, verify all romaji are valid Hepburn, verify lookup functions return correct characters, verify no duplicate glyphs.
- **Quiz Engine** — verify shuffle covers all selected characters exactly once, verify correct Hepburn matching (including edge cases like `n` vs `ん`), verify incorrect detection, verify phase transitions (selecting→quizzing→reviewing→finished), verify timer starts/stops correctly, verify Score output contains correct/total/elapsed/missed.

### Prior art

No existing tests in the codebase. Tests use Vitest (or Jest) and run in Node.js with no browser dependency.

## Out of Scope

- Vocabulary or kanji flashcards
- Spaced repetition (SRS)
- Audio playback of kana readings
- User accounts or server-side persistence
- Multi-device sync
- Mobile native app (responsive web is fine)
- Stroke order animation
- Kunrei-shiki or Nihon-shiki romanization
- Per-character statistics (e.g., "you've missed し 12 times")
- Timed per-question limits
- Customizable timer display (always shows elapsed)
- Import/export of character selections or score history

## Further Notes

- The app uses Next.js 16 with the App Router, Tailwind CSS v4, React 19, and TypeScript in strict mode.
- The Storage adapter's async interface is intentionally over-engineered for localStorage — it exists to enable a smooth migration path to server-side persistence (Server Functions + database) without rewriting consuming modules.
- Character data should be structured so that adding new character types (e.g., extended katakana for foreign words) is a data-only change.
