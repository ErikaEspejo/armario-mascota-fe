'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Inicializar con un valor por defecto seguro que se actualizará en useEffect
  const [theme, setThemeState] = useState<Theme>(() => {
    // Solo intentar leer de localStorage si estamos en el cliente
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme | null
      if (savedTheme) return savedTheme
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      return systemPreference
    }
    return 'light'
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Leer preferencia guardada o detectar preferencia del sistema
    const savedTheme = localStorage.getItem('theme') as Theme | null
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    
    const initialTheme = savedTheme || systemPreference
    setThemeState(initialTheme)
    
    // Aplicar tema inmediatamente
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme)
    }
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  // Siempre proporcionar el contexto, incluso antes de montar
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

