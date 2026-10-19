// random -> value noise -> fbm -> flow field, all as pure TSL Fn() nodes.
import { add, dot, float, floor, Fn, fract, Loop, mix, mul, sin, sub, vec2 } from 'three/tsl'
import type { Node } from 'three/webgpu'

// Classic hash: fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123)
export const random = Fn(([st]: [Node]) => {
  return fract(sin(dot(st, vec2(12.9898, 78.233))).mul(43758.5453123))
})

// Smooth value noise: random values on an integer lattice, interpolated
// with a smoothstep-shaped weight so cell borders do not show as creases.
export const noise = Fn(([st]: [Node]) => {
  const i = floor(st)
  const f = fract(st)
  const u = f.mul(f).mul(sub(3.0, mul(2.0, f)))

  const r00 = random(i)
  const r10 = random(i.add(vec2(1.0, 0.0)))
  const r01 = random(i.add(vec2(0.0, 1.0)))
  const r11 = random(i.add(vec2(1.0, 1.0)))

  return mix(
    mix(r00, r10, u.x),
    mix(r01, r11, u.x),
    u.y,
  )
})

// Fractional Brownian motion. `octaves` is a plain JS integer: Loop unrolls it
// at shader build time, so the octave count is fixed per material.
export const fbm = Fn(([st, amplitude, frequency, lacunarity, gain, octaves]: [Node, Node, Node, Node, Node, number]) => {
  const value = float(0).toVar()
  const amp = amplitude.toVar()
  const freq = frequency.toVar()

  Loop(octaves, () => {
    value.addAssign(amp.mul(noise(st.mul(freq))))
    freq.mulAssign(lacunarity)
    amp.mulAssign(gain)
  })

  return value
})

// Two fbm fields, each drifting along a different axis, packed as a vec2.
// Read as "how far to push this point in x and in y".
export const flowField = Fn(([p, t]: [Node, Node]) => {
  const fx = fbm(add(p, vec2(0.0, t.mul(0.1))), float(0.6), float(2.0), float(1.8), float(0.5), 6)
  const fy = fbm(add(p, vec2(t.mul(0.1), 0.0)), float(0.6), float(2.0), float(1.8), float(0.5), 6)
  return vec2(fx, fy)
})
