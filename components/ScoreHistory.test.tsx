import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@/lib/test-utils'
import ScoreHistory from './ScoreHistory'
import type { ScoreEntry } from '@/lib/quiz/types'

afterEach(() => {
  cleanup()
})

const sampleEntries: ScoreEntry[] = [
  {
    id: '1',
    date: '2026-05-30T10:00:00.000Z',
    direction: 'kana→romaji',
    total: 10,
    correct: 8,
    incorrect: 2,
    elapsedMs: 45000,
    misses: [
      { glyph: 'き', romaji: 'ki' },
      { glyph: 'ふ', romaji: 'fu' },
    ],
  },
  {
    id: '2',
    date: '2026-05-30T11:30:00.000Z',
    direction: 'romaji→kana',
    total: 5,
    correct: 5,
    incorrect: 0,
    elapsedMs: 15000,
    misses: [],
  },
]

describe('ScoreHistory', () => {
  it('renders the heading', () => {
    render(
      <ScoreHistory entries={[]} onBack={vi.fn()} onRetry={vi.fn()} />,
    )
    expect(screen.getByText('Score History')).toBeInTheDocument()
  })

  it('shows empty state when no entries exist', () => {
    render(
      <ScoreHistory entries={[]} onBack={vi.fn()} onRetry={vi.fn()} />,
    )
    expect(screen.getByText(/no sessions yet/i)).toBeInTheDocument()
    expect(
      screen.getByText(/complete a quiz/i),
    ).toBeInTheDocument()
  })

  it('renders a list of score entries', () => {
    render(
      <ScoreHistory
        entries={sampleEntries}
        onBack={vi.fn()}
        onRetry={vi.fn()}
      />,
    )

    // Both entries should be visible
    expect(screen.getByText('8/10')).toBeInTheDocument()
    expect(screen.getByText('5/5')).toBeInTheDocument()
  })

  it('shows the percentage for each entry', () => {
    render(
      <ScoreHistory
        entries={sampleEntries}
        onBack={vi.fn()}
        onRetry={vi.fn()}
      />,
    )

    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('shows direction for each entry', () => {
    render(
      <ScoreHistory
        entries={sampleEntries}
        onBack={vi.fn()}
        onRetry={vi.fn()}
      />,
    )

    const kanaToRomaji = screen.getAllByText(/kana→romaji/i)
    expect(kanaToRomaji.length).toBeGreaterThanOrEqual(1)
  })

  it('shows formatted elapsed time for each entry', () => {
    render(
      <ScoreHistory
        entries={sampleEntries}
        onBack={vi.fn()}
        onRetry={vi.fn()}
      />,
    )

    // 45s for entry 1
    expect(screen.getByText(/45\.0s/)).toBeInTheDocument()
    // 15s for entry 2
    expect(screen.getByText(/15\.0s/)).toBeInTheDocument()
  })

  it('shows the date for each entry', () => {
    render(
      <ScoreHistory
        entries={sampleEntries}
        onBack={vi.fn()}
        onRetry={vi.fn()}
      />,
    )

    // Both dates contain the year 2026
    const dates = screen.getAllByText(/2026/)
    expect(dates).toHaveLength(2)
  })

  it('shows missed characters and allows expanding details', async () => {
    const user = userEvent.setup()
    render(
      <ScoreHistory
        entries={sampleEntries}
        onBack={vi.fn()}
        onRetry={vi.fn()}
      />,
    )

    // First entry has 2 misses - we should see the miss count
    expect(screen.getByText(/2 missed/)).toBeInTheDocument()

    // Click to expand misses
    const expandBtn = screen.getByRole('button', { name: /show details/i })
    await user.click(expandBtn)

    // Missed characters should now be visible
    expect(screen.getByText('き')).toBeInTheDocument()
    expect(screen.getByText('ki')).toBeInTheDocument()
    expect(screen.getByText('ふ')).toBeInTheDocument()
  })

  it('shows "perfect" instead of misses for entries with no incorrect', () => {
    render(
      <ScoreHistory
        entries={sampleEntries}
        onBack={vi.fn()}
        onRetry={vi.fn()}
      />,
    )

    expect(screen.getByText(/perfect/i)).toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()

    render(
      <ScoreHistory entries={[]} onBack={onBack} onRetry={vi.fn()} />,
    )

    await user.click(screen.getByRole('button', { name: /back/i }))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('calls onRetry with missed chars when retry is clicked on an entry', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()

    render(
      <ScoreHistory
        entries={sampleEntries}
        onBack={vi.fn()}
        onRetry={onRetry}
      />,
    )

    // First expand the entry with misses
    const expandBtn = screen.getByRole('button', { name: /show details/i })
    await user.click(expandBtn)

    // Then click retry
    const retryBtn = screen.getByRole('button', { name: /retry/i })
    await user.click(retryBtn)

    expect(onRetry).toHaveBeenCalledOnce()
    expect(onRetry).toHaveBeenCalledWith([
      { glyph: 'き', romaji: 'ki' },
      { glyph: 'ふ', romaji: 'fu' },
    ])
  })
})
