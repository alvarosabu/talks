import { Color } from 'three'
import { uniformArray } from 'three/tsl'

export interface ColorSet {
  color1: Color
  color2: Color
  color3: Color
  // Page background tint behind the shapes on the original site.
  bg: string
}

export const COLOR_CYCLE_SECONDS = 15

export const colorSets: ColorSet[] = [
  { color1: new Color('#007F62'), color2: new Color('#16C787'), color3: new Color('#C6A167'), bg: '#fae8e4' },
  { color1: new Color('#8314D3'), color2: new Color('#B9B8E7'), color3: new Color('#EE7F88'), bg: '#d0edf2' },
  { color1: new Color('#F66C21'), color2: new Color('#FA8663'), color3: new Color('#004E4B'), bg: '#def7d1' },
  { color1: new Color('#385FCC'), color2: new Color('#FF9301'), color3: new Color('#FFB2DC'), bg: '#ffdaff' },
]

// TSL has no struct uniforms, so the four palettes are flattened into one array
// of 12 colors: index = setIndex * 3 + slot (slot 0 = color1, 1 = color2, 2 = color3).
export const colorArray = uniformArray(
  colorSets.flatMap(s => [s.color1.clone(), s.color2.clone(), s.color3.clone()]),
  'color',
)
