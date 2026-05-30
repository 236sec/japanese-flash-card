# Japanese Kana Flashcard

A web app for learning hiragana and katakana through self-paced quiz sessions with selectable character subsets and bidirectional practice.

## Language

**Character (Kana)**:
A single Japanese syllabic character — either hiragana or katakana — including base (gojūon), dakuten, handakuten, yōon, and sokuon variants.
_Avoid_: glyph, letter, symbol

**Direction**:
Whether the quiz prompt shows a kana character and expects romaji (kana→romaji), or shows romaji and expects the kana character (romaji→kana).
_Avoid_: mode, way, orientation

**Selection / Subset**:
The set of Characters the user has ticked for inclusion in a Session.
_Avoid_: deck, pack, set

**Session**:
One complete pass through all selected Characters in random order, from the first prompt to the Score screen.
_Avoid_: round, quiz, test, game

**Prompt**:
The kana character or romaji text displayed during a Session for the user to respond to.
_Avoid_: question, card, item

**Answer**:
The user's typed response to a Prompt, compared against the expected Hepburn romanization or kana.
_Avoid_: response, input, guess

**Miss**:
A Character the user answered incorrectly during a Session.
_Avoid_: mistake, error, fail

**Score**:
The end-of-Session summary showing correct count, total count, elapsed time, and the list of Misses.
_Avoid_: result, stats, summary

**Score History**:
A log of past Session results persisted locally, each entry containing the date, Direction, correct/total, elapsed time, and Missed Characters.
_Avoid_: records, log, past results

**On-screen Keyboard**:
A Gojūon-grid virtual keyboard for kana input in romaji→kana Direction. Togglable open/closed. Supports dakuten (゛) and handakuten (゜) composition.
_Avoid_: virtual keyboard, soft keyboard

## Relationships

- A **Session** has one **Direction**
- A **Session** draws from one **Selection** (a set of **Characters**)
- A **Session** produces one **Score**
- A **Score** may contain zero or more **Misses** (each a **Character**)
- A **Score History** contains many **Score** entries

## Example dialogue

> **Dev:** "When the user gets a Character wrong, does the Session move to the next Prompt automatically?"
> **Domain expert:** "No — the user must click Next manually. They need time to study the correct Answer."
>
> **Dev:** "Can a Session mix hiragana and katakana Characters?"
> **Domain expert:** "Yes. The Selection grid has both syllabaries side-by-side, and the Session shuffles every ticked Character regardless of type."

## Flagged ambiguities

- "mode" was used to mean **Direction** — resolved: Direction is the canonical term.
- "deck" was used to mean **Selection** — resolved: Selection is the canonical term.
- "round" / "game" were used to mean **Session** — resolved: Session is the canonical term.
