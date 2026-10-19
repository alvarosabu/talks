// Final (step 8) materials from the blog post, without the intermediate steps.
import type { Texture } from 'three'
import {
  acos,
  atan,
  Discard,
  float,
  Fn,
  int,
  normalize,
  normalView,
  PI,
  positionLocal,
  texture,
  time,
  vec2,
  vec3,
  vec4,
} from 'three/tsl'
import { MeshBasicNodeMaterial } from 'three/webgpu'
import type { Node } from 'three/webgpu'
import { colorArray } from './color-sets'
import { calculateColor } from './color'
import { generateSumiPattern } from './flow-field'
import { flowField } from './noise'
import { blendSoftLight } from './soft-light'

export interface SumiMaterialOptions {
  // uniform(int) holding the active palette index, owned by the scene
  paletteIndex: Node
  noiseTexture: Texture
}

// The grain texture is tiled in object space, so it does not stretch with
// the geometry, and it scrolls slowly on x.
export function grainNoise(noiseTexture: Texture) {
  const pos = positionLocal
  const nUV = vec2(pos.x.mul(0.01).add(time.mul(0.05)), pos.y.mul(0.01))
  return texture(noiseTexture, nUV).rgb
}

export function createConeMaterial({ paletteIndex, noiseTexture }: SumiMaterialOptions): MeshBasicNodeMaterial {
  const mat = new MeshBasicNodeMaterial({ transparent: true })

  mat.colorNode = Fn(() => {
    const pos = positionLocal

    // Carve the notch that turns the triangle into a V. Only the tail end
    // (y < -90) is affected; the wedge half-width shrinks from 64 at y=-200
    // to 0 at y=-90.
    const inWedgeRange = pos.y.lessThan(-90.0)
    const wedgeProgress = pos.y.add(200.0).div(110.0)
    const wedgeHalfWidth = float(64.0).mul(float(1.0).sub(wedgeProgress))
    const insideWedge = pos.x.abs().lessThan(wedgeHalfWidth)
    Discard(inWedgeRange.and(insideWedge))

    const baseColor = vec3(colorArray.element(paletteIndex.mul(int(3))))
    return vec4(blendSoftLight(baseColor, grainNoise(noiseTexture), float(0.7)), 1.0)
  })()

  return mat
}

export function createSphereMaterial({ paletteIndex, noiseTexture }: SumiMaterialOptions): MeshBasicNodeMaterial {
  const mat = new MeshBasicNodeMaterial({ transparent: true })

  mat.colorNode = Fn(() => {
    // Spherical coordinates of the view-space normal. Using the normal instead
    // of the geometry UV keeps the pattern facing the camera, and adding time
    // to theta spins it around the vertical axis.
    const n = normalize(normalView)
    const phi = acos(n.y)
    const theta = atan(n.z, n.x).add(time.mul(0.1))
    const sphereUV = vec2(theta.div(PI.mul(2.0)), phi.div(PI)).mul(0.5)

    const timeScale = time.mul(0.7)
    const baseFlow = flowField(sphereUV.mul(1.5), timeScale)
    const detailFlow = flowField(sphereUV.mul(3.0).add(baseFlow.mul(0.4)), timeScale.mul(1.2))

    const grain = grainNoise(noiseTexture)
    const flowStrength = float(0.1).add(grain.r.mul(0.01)).toVar()
    const warpedUV = baseFlow.mul(0.7).add(detailFlow.mul(0.3)).mul(flowStrength).toVar()

    // Push harder where the surface faces the camera so the center swirls
    // more than the rim.
    const edgeIntensity = n.dot(vec3(0.0, 0.0, 1.0)).mul(0.5).add(0.5)
    warpedUV.addAssign(edgeIntensity.mul(baseFlow).mul(flowStrength).mul(1.5))

    const noiseValue = generateSumiPattern(sphereUV.add(warpedUV), time.mul(0.25), float(0.3))
    const baseColor = calculateColor(noiseValue, paletteIndex, sphereUV, warpedUV, time)

    return vec4(blendSoftLight(baseColor, grain, float(0.7)), 1.0)
  })()

  return mat
}
