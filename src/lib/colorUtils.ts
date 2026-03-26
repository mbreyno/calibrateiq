/**
 * colorUtils.ts
 * Generates full color palettes from base hex colors and applies them
 * as CSS custom properties, enabling dynamic re-theming of the entire app.
 */

/** Parse a #rrggbb hex string into [r, g, b] (0–255) */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return [r, g, b]
}

/** Mix rgb towards white by factor t (0=original, 1=white) */
function mixWithWhite(r: number, g: number, b: number, t: number): string {
  const mix = (c: number) => Math.round(c + (255 - c) * t)
  return `${mix(r)} ${mix(g)} ${mix(b)}`
}

/** Mix rgb towards black by factor t (0=original, 1=black) */
function mixWithBlack(r: number, g: number, b: number, t: number): string {
  const mix = (c: number) => Math.round(c * (1 - t))
  return `${mix(r)} ${mix(g)} ${mix(b)}`
}

/**
 * Generate the "forest" (primary) palette — 11 shades from 950 (very dark) to 50 (very light).
 * The base color maps to shade 900. Darker shades mix with black; lighter shades mix with white.
 */
export function generatePrimary(hex: string): Record<string, string> {
  const [r, g, b] = hexToRgb(hex)
  return {
    '950': mixWithBlack(r, g, b, 0.45),
    '900': `${r} ${g} ${b}`,                // base = 900
    '800': mixWithWhite(r, g, b, 0.13),
    '700': mixWithWhite(r, g, b, 0.26),
    '600': mixWithWhite(r, g, b, 0.40),
    '500': mixWithWhite(r, g, b, 0.54),
    '400': mixWithWhite(r, g, b, 0.65),
    '300': mixWithWhite(r, g, b, 0.74),
    '200': mixWithWhite(r, g, b, 0.83),
    '100': mixWithWhite(r, g, b, 0.91),
    '50':  mixWithWhite(r, g, b, 0.96),
  }
}

/**
 * Generate the "gold" (accent) palette — 5 shades from 700 (dark) to 300 (light).
 * The base color maps to shade 500.
 */
export function generateAccent(hex: string): Record<string, string> {
  const [r, g, b] = hexToRgb(hex)
  return {
    '700': mixWithBlack(r, g, b, 0.35),
    '600': mixWithBlack(r, g, b, 0.15),
    '500': `${r} ${g} ${b}`,               // base = 500
    '400': mixWithWhite(r, g, b, 0.22),
    '300': mixWithWhite(r, g, b, 0.44),
  }
}

/**
 * Generate the "cream" (surface/background) palette — 5 shades from 50 (lightest) to 400 (darkest).
 * The base color maps to shade 100.
 */
export function generateSurface(hex: string): Record<string, string> {
  const [r, g, b] = hexToRgb(hex)
  return {
    '50':  mixWithWhite(r, g, b, 0.5),
    '100': `${r} ${g} ${b}`,               // base = 100
    '200': mixWithBlack(r, g, b, 0.04),
    '300': mixWithBlack(r, g, b, 0.10),
    '400': mixWithBlack(r, g, b, 0.19),
  }
}

/**
 * Apply all three palettes to the document as CSS custom properties.
 * Call this whenever brand colors change (on mount and on color picker change).
 */
export function applyBrandColors(primary: string, accent: string, surface: string): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  // Legacy single-value vars (used by sidebar inline styles)
  root.style.setProperty('--brand-color', primary)
  root.style.setProperty('--brand-accent', accent)
  root.style.setProperty('--brand-surface', surface)

  // Primary (forest) palette
  const pShades = generatePrimary(primary)
  Object.entries(pShades).forEach(([shade, rgb]) => {
    root.style.setProperty(`--forest-${shade}`, rgb)
  })

  // Accent (gold) palette
  const aShades = generateAccent(accent)
  Object.entries(aShades).forEach(([shade, rgb]) => {
    root.style.setProperty(`--gold-${shade}`, rgb)
  })

  // Surface (cream) palette
  const sShades = generateSurface(surface)
  Object.entries(sShades).forEach(([shade, rgb]) => {
    root.style.setProperty(`--cream-${shade}`, rgb)
  })
}
