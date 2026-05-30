import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@/lib/test-utils'
import OnScreenKeyboard from './OnScreenKeyboard'

afterEach(() => {
  cleanup()
})

describe('OnScreenKeyboard', () => {
  it('renders the Gojūon grid with base hiragana characters', () => {
    render(<OnScreenKeyboard onCommitChar={vi.fn()} />)

    expect(screen.getByRole('button', { name: /^あ$/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^い$/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^う$/ })).toBeInTheDocument()
  })

  it('renders modifier buttons ゛ and ゜', () => {
    render(<OnScreenKeyboard onCommitChar={vi.fn()} />)

    expect(screen.getByRole('button', { name: '゛ dakuten' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '゜ handakuten' })).toBeInTheDocument()
  })

  it('has toggle tabs to switch between hiragana and katakana', async () => {
    render(<OnScreenKeyboard onCommitChar={vi.fn()} />)

    expect(screen.getByText('Hiragana')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /katakana/i }))
    expect(screen.getByText('Katakana')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^ア$/ })).toBeInTheDocument()
  })

  it('toggles keyboard visibility', async () => {
    render(<OnScreenKeyboard onCommitChar={vi.fn()} />)

    expect(screen.getByRole('button', { name: /^あ$/ })).toBeInTheDocument()

    const toggleBtn = screen.getByRole('button', { name: /keyboard/i })
    await userEvent.click(toggleBtn)
    expect(screen.queryByRole('button', { name: /^あ$/ })).not.toBeInTheDocument()

    await userEvent.click(toggleBtn)
    expect(screen.getByRole('button', { name: /^あ$/ })).toBeInTheDocument()
  })

  it('does not commit immediately when a base key is tapped (goes to pending)', async () => {
    const onCommit = vi.fn()
    render(<OnScreenKeyboard onCommitChar={onCommit} />)

    await userEvent.click(screen.getByRole('button', { name: /^あ$/ }))
    // Character goes to pending, not committed yet
    expect(onCommit).not.toHaveBeenCalled()
  })

  it('composes dakuten: か + ゛ → が', async () => {
    const onCommit = vi.fn()
    render(<OnScreenKeyboard onCommitChar={onCommit} />)

    await userEvent.click(screen.getByRole('button', { name: /^か$/ }))
    expect(onCommit).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: '゛ dakuten' }))
    expect(onCommit).toHaveBeenCalledWith('が')
    expect(onCommit).not.toHaveBeenCalledWith('か')
  })

  it('composes handakuten: は + ゜ → ぱ', async () => {
    const onCommit = vi.fn()
    render(<OnScreenKeyboard onCommitChar={onCommit} />)

    await userEvent.click(screen.getByRole('button', { name: /^は$/ }))
    await userEvent.click(screen.getByRole('button', { name: '゜ handakuten' }))
    expect(onCommit).toHaveBeenCalledWith('ぱ')
  })

  it('commits pending char when tapping a different base char', async () => {
    const onCommit = vi.fn()
    render(<OnScreenKeyboard onCommitChar={onCommit} />)

    await userEvent.click(screen.getByRole('button', { name: /^か$/ }))
    expect(onCommit).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: /^さ$/ }))
    expect(onCommit).toHaveBeenCalledWith('か')

    await userEvent.click(screen.getByRole('button', { name: '゛ dakuten' }))
    expect(onCommit).toHaveBeenCalledWith('ざ')
  })

  it('disables handakuten when pending char cannot take it (e.g. か)', async () => {
    render(<OnScreenKeyboard onCommitChar={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: /^か$/ }))

    expect(screen.getByRole('button', { name: '゜ handakuten' })).toBeDisabled()
  })

  it('disables both modifiers when nothing is pending', () => {
    render(<OnScreenKeyboard onCommitChar={vi.fn()} />)

    expect(screen.getByRole('button', { name: '゛ dakuten' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '゜ handakuten' })).toBeDisabled()
  })

  it('enables both modifiers when pending char supports both (は)', async () => {
    render(<OnScreenKeyboard onCommitChar={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: /^は$/ }))

    expect(screen.getByRole('button', { name: '゛ dakuten' })).toBeEnabled()
    expect(screen.getByRole('button', { name: '゜ handakuten' })).toBeEnabled()
  })

  it('shows pending character preview', async () => {
    render(<OnScreenKeyboard onCommitChar={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: /^か$/ }))
    expect(screen.getByText(/pending/i)).toBeInTheDocument()
  })
})
