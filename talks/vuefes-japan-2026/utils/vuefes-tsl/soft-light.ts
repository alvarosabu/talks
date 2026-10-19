import { float, Fn, mix, sqrt, vec3 } from 'three/tsl'
import type { Node } from 'three/webgpu'

// Photoshop-style soft light for one channel: blend < 0.5 darkens like
// multiply, blend > 0.5 lightens like screen, and 0.5 leaves base untouched.
const softLightChannel = Fn(([base, blend]: [Node, Node]) => {
  const dark = base.mul(blend).mul(2.0).add(base.mul(base).mul(blend.mul(2.0).oneMinus()))
  const light = sqrt(base).mul(blend.mul(2.0).sub(1.0)).add(base.mul(float(2.0).sub(blend.mul(2.0))))
  return blend.lessThan(0.5).select(dark, light)
})

export const blendSoftLight = Fn(([base, blend, opacity]: [Node, Node, Node]) => {
  const blended = vec3(
    softLightChannel(base.x, blend.x),
    softLightChannel(base.y, blend.y),
    softLightChannel(base.z, blend.z),
  )
  return mix(base, blended, opacity)
})
