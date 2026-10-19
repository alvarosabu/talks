import { float, floor, Fn, fract, If, int, mix, mod, select, vec3 } from 'three/tsl'
import type { Node } from 'three/webgpu'
import { colorArray } from './color-sets'
import { generateSumiDetail } from './flow-field'

// Picks color1/2/3 of the active palette out of the flat 12-entry array.
export function paletteColors(setIndex: Node) {
  const base = setIndex.mul(int(3))
  return {
    color1: vec3(colorArray.element(base)),
    color2: vec3(colorArray.element(base.add(int(1)))),
    color3: vec3(colorArray.element(base.add(int(2)))),
  }
}

// Turns a [0, 1] noise value into ink bands: fract(x * 5) repeats the gradient
// five times, each repeat is split into three solid colors, and only the last
// 20% of each color blends into the next one. A thin band near 0.3 gets extra
// high-frequency detail so some contour lines look hand-drawn.
export const calculateColor = Fn(([noiseValue, setIndex, noiseUV, warpedUV, t]: [Node, Node, Node, Node, Node]) => {
  const colors = paletteColors(setIndex)

  const nv = fract(noiseValue.mul(5.0)).toVar()
  const result = vec3(0.0).toVar()

  If(nv.greaterThan(float(0.3)).and(nv.lessThan(float(0.33))), () => {
    const sumiDetail = generateSumiDetail(noiseUV.add(warpedUV).mul(0.1), t.mul(0.1))
    nv.assign(nv.mul(0.95).add(sumiDetail.mul(0.05)))

    const segment24 = floor(nv.mul(24.0))
    const idx = int(mod(segment24, 3.0))
    const localPos9 = fract(nv.mul(9.0)).toVar()

    const currentColor9 = vec3(select(
      idx.equal(int(0)),
      colors.color1,
      select(idx.equal(int(1)), colors.color2, colors.color3),
    ))
    const nextColor9 = vec3(select(
      idx.equal(int(0)),
      colors.color2,
      select(idx.equal(int(1)), colors.color3, colors.color1),
    ))

    If(localPos9.greaterThan(float(0.8)), () => {
      const tt = localPos9.sub(0.8).div(0.2)
      result.assign(mix(currentColor9, nextColor9, tt))
    }).Else(() => {
      result.assign(currentColor9)
    })
  }).Else(() => {
    const segment3 = floor(nv.mul(3.0))
    const localPos3 = fract(nv.mul(3.0)).toVar()

    const currentColor3 = vec3(0.0).toVar()
    const nextColor3 = vec3(0.0).toVar()

    If(segment3.equal(float(0.0)), () => {
      currentColor3.assign(colors.color1)
      nextColor3.assign(colors.color2)
    }).ElseIf(segment3.equal(float(1.0)), () => {
      currentColor3.assign(colors.color2)
      nextColor3.assign(colors.color3)
    }).Else(() => {
      currentColor3.assign(colors.color3)
      nextColor3.assign(colors.color1)
    })

    If(localPos3.greaterThan(float(0.8)), () => {
      const tt = localPos3.sub(0.8).div(0.2)
      result.assign(mix(currentColor3, nextColor3, tt))
    }).Else(() => {
      result.assign(currentColor3)
    })
  })

  return result
})
