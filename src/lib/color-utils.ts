// src/lib/color-utils.ts

function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex)
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  if (!isValidHex(hex)) return { h: 0, s: 0, l: 50 }
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

export function hslToHex(h: number, s: number, l: number): string {
  const hn = h / 360
  const sn = s / 100
  const ln = l / 100

  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t
    if (tt < 0) tt += 1
    if (tt > 1) tt -= 1
    if (tt < 1 / 6) return p + (q - p) * 6 * tt
    if (tt < 1 / 2) return q
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
    return p
  }

  let r: number, g: number, b: number
  if (sn === 0) {
    r = g = b = ln
  } else {
    const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn
    const p = 2 * ln - q
    r = hue2rgb(p, q, hn + 1 / 3)
    g = hue2rgb(p, q, hn)
    b = hue2rgb(p, q, hn - 1 / 3)
  }

  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/** Returns the original hex if invalid, avoiding NaN in dark palette generation */
export function safeHex(hex: string, fallback = '#888888'): string {
  return isValidHex(hex) ? hex : fallback
}

export function generateDarkPalette(light: {
  colorBackground: string
  colorSurface: string
  colorSurfaceAlt: string
  colorText: string
  colorTextSoft: string
  colorTextMuted: string
  colorBorder: string
}): {
  darkColorBackground: string
  darkColorSurface: string
  darkColorSurfaceAlt: string
  darkColorText: string
  darkColorTextSoft: string
  darkColorTextMuted: string
  darkColorBorder: string
} {
  const bg = hexToHsl(safeHex(light.colorBackground))
  const text = hexToHsl(safeHex(light.colorText))
  const border = hexToHsl(safeHex(light.colorBorder))

  // Background: se claro (L > 80), gera escuro. Senão mantém.
  const darkBgL = bg.l > 80 ? 7 : Math.min(bg.l, 12)
  const darkBg = hslToHex(bg.h, Math.min(bg.s, 15), darkBgL)

  // Surface: bg + 6%
  const darkSurface = hslToHex(bg.h, Math.min(bg.s, 15), darkBgL + 6)

  // Surface Alt: bg + 12%
  const darkSurfaceAlt = hslToHex(bg.h, Math.min(bg.s, 15), darkBgL + 12)

  // Text: se light text é escuro (L < 40), gera claro
  const darkTextL = text.l < 40 ? 90 : text.l
  const darkText = hslToHex(text.h, Math.min(text.s, 20), darkTextL)

  // Text Soft: L=70%
  const darkTextSoft = hslToHex(text.h, Math.min(text.s, 15), 70)

  // Text Muted: L=45%
  const darkTextMuted = hslToHex(text.h, Math.min(text.s, 10), 45)

  // Border: L=20%, S reduzida
  const darkBorder = hslToHex(border.h, Math.round(border.s * 0.3), 20)

  return {
    darkColorBackground: darkBg,
    darkColorSurface: darkSurface,
    darkColorSurfaceAlt: darkSurfaceAlt,
    darkColorText: darkText,
    darkColorTextSoft: darkTextSoft,
    darkColorTextMuted: darkTextMuted,
    darkColorBorder: darkBorder,
  }
}
