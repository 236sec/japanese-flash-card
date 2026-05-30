import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@/lib/test-utils'
import DirectionToggle from './DirectionToggle'
import type { Direction } from '@/lib/quiz/types'

afterEach(() => {
  cleanup()
})

describe('DirectionToggle', () => {
  it('renders both direction options', () => {
    const onChange = vi.fn()
    render(<DirectionToggle value="kana→romaji" onChange={onChange} />)

    expect(screen.getByText(/kana.*romaji/i)).toBeInTheDocument()
    expect(screen.getByText(/romaji.*kana/i)).toBeInTheDocument()
  })

  it('highlights the currently selected direction', () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <DirectionToggle value="kana→romaji" onChange={onChange} />,
    )

    const kanaBtn = screen.getByRole('button', { name: /kana.*romaji/i })
    const romajiBtn = screen.getByRole('button', { name: /romaji.*kana/i })
    expect(kanaBtn.className).toContain('bg-blue')
    expect(romajiBtn.className).not.toContain('bg-blue')

    rerender(<DirectionToggle value="romaji→kana" onChange={onChange} />)
    expect(romajiBtn.className).toContain('bg-blue')
    expect(kanaBtn.className).not.toContain('bg-blue')
  })

  it('calls onChange with the new direction when clicked', async () => {
    const onChange = vi.fn()
    render(<DirectionToggle value="kana→romaji" onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: /romaji.*kana/i }))
    expect(onChange).toHaveBeenCalledWith('romaji→kana')
  })

  it('calls onChange with kana→romaji when switching back', async () => {
    const onChange = vi.fn()
    render(<DirectionToggle value="romaji→kana" onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: /kana.*romaji/i }))
    expect(onChange).toHaveBeenCalledWith('kana→romaji')
  })
})
