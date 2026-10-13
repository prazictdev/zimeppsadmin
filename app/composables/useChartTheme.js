/**
 * Resolves chart colours from the active DaisyUI theme's CSS custom properties
 * so no colour values are hardcoded. Reads the variables on the client; falls
 * back to the raw `var(--color-*)` references during SSR/first paint.
 */
export const useChartTheme = () => {
  const semanticVars = [
    '--color-primary',
    '--color-secondary',
    '--color-accent',
    '--color-info',
    '--color-success',
    '--color-warning',
    '--color-error',
    '--color-neutral',
  ]

  const readVar = (name, fallback) => {
    if (import.meta.client && typeof window !== 'undefined') {
      const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
      if (value) return value
    }
    return fallback ?? `var(${name})`
  }

  const palette = () => semanticVars.map((name) => readVar(name))

  const highlightColor = () => readVar('--color-error')

  const mutedColor = () => readVar('--color-base-content')

  /**
   * Build a per-bar/segment colour array, emphasising values that exceed the
   * highlight threshold.
   */
  const colorsFor = (values, highlightThreshold = null) => {
    const base = palette()
    const highlight = highlightColor()
    return values.map((value, index) => {
      if (highlightThreshold != null && Number(value) > Number(highlightThreshold)) {
        return highlight
      }
      return base[index % base.length]
    })
  }

  return { palette, highlightColor, mutedColor, colorsFor }
}
