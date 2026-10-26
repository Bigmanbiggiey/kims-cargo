import { render, type RenderResult } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../App'

/** Render the whole app at a URL, the way a visitor would land on it. */
export function renderAt(path: string): RenderResult {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}
