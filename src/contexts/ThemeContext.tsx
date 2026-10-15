import { useState, useEffect, type ReactNode } from 'react'
import { ThemeContext, type Theme } from './theme-context'
import { readPreference, savePreference } from '../lib/preferences'
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [choice, setChoice] = useState<Theme | null>(() => { const value = readPreference<Theme | null>('theme', null); let old: string | null = null; try { old = localStorage.getItem('theme') } catch { /* Use system preference without browser storage. */ } return value === 'dark' || value === 'light' ? value : old === 'dark' || old === 'light' ? old : null })
  const [system, setSystem] = useState<Theme>(() => matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  const theme = choice ?? system
  useEffect(() => { const media = matchMedia('(prefers-color-scheme: dark)'); const update = () => setSystem(media.matches ? 'dark' : 'light'); media.addEventListener('change', update); return () => media.removeEventListener('change', update) }, [])
  useEffect(() => { document.documentElement.dataset.theme = theme; document.documentElement.style.colorScheme = theme; document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#101419' : '#f3f6f9') }, [theme])
  return <ThemeContext.Provider value={{ theme, toggleTheme: () => { const next = theme === 'dark' ? 'light' : 'dark'; setChoice(next); savePreference('theme', next) } }}>{children}</ThemeContext.Provider>
}
