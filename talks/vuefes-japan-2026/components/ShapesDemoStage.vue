<script setup lang="ts">
import { OrbitControls, useTexture } from '@tresjs/cientos'
import { useLoop, useTres } from '@tresjs/core'
import gsap from 'gsap'
import type { OrthographicCamera, Texture } from 'three'
import { RepeatWrapping } from 'three'
import { acos, atan, checker, color, Discard, float, floor, Fn, fract, If, int, Loop, mix, mul, normalize, normalView, PI, positionLocal, smoothstep, sub, time, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'
import type { Node } from 'three/webgpu'
import { MeshBasicNodeMaterial } from 'three/webgpu'
import { onUnmounted, reactive, shallowRef, toRef, watch } from 'vue'
import { calculateColor, paletteColors } from '../utils/vuefes-tsl/color'
import { COLOR_CYCLE_SECONDS, colorArray, colorSets } from '../utils/vuefes-tsl/color-sets'
import { generateSumiPattern } from '../utils/vuefes-tsl/flow-field'
import { grainNoise } from '../utils/vuefes-tsl/materials'
import { fbm, flowField, noise, random } from '../utils/vuefes-tsl/noise'
import { blendSoftLight } from '../utils/vuefes-tsl/soft-light'

// 0-5 follow the "Experience.vue" slide, 6-8 the "Node materials" slide, 9-11 the "Carving the V" slide,
// 12-15 the "Sphere coordinates" slide, 16-19 the "Value noise" slide, 20-23 the "Fractal Brownian motion" slide,
// 24-27 the "Layers of flow" slide (one step per new colorNode), 28-31 the "calculateColor" slide,
// 32-33 the "Paper grain" slide.
// controls turns on OrbitControls, so the audience sees which pattern follows the camera.
const props = withDefaults(
  defineProps<{ step: number, octaves?: number, controls?: boolean, highContrast?: boolean, paletteOffset?: number }>(),
  { paletteOffset: 0 },
)

const emit = defineEmits<{ palette: [index: number] }>()

// The one value JavaScript updates at runtime. Set 0 until the palette cycle step.
const paletteIndex = uniform(0, 'int')

let lastIndex = -1
const { onBeforeRender } = useLoop()

onBeforeRender(({ elapsed }) => {
  const idx = props.step >= 31
    ? (Math.floor(elapsed / COLOR_CYCLE_SECONDS) + props.paletteOffset) % colorSets.length
    : 0
  if (idx !== lastIndex) {
    lastIndex = idx
    paletteIndex.value = idx
    emit('palette', idx)
  }
})

// A uniform, so the octaves slider does not compile the shader again
const octaves = uniform(6, 'int')
watch(() => props.octaves, (value) => {
  if (value !== undefined) octaves.value = value
}, { immediate: true })

// Display only, the slide code does not have it. The toggle stretches 0.3-0.9 to black-white.
// A uniform, so the toggle does not compile the shader again.
const contrast = uniform(0)
watch(() => props.highContrast, (value) => {
  contrast.value = value ? 1 : 0
}, { immediate: true })
const gray = (v: Node) => vec3(mix(v, smoothstep(0.3, 0.9, v), contrast))

// The box that must stay visible. The shapes span about 676 x 330 world units once both are in place.
const FIT_WIDTH = 760
const FIT_HEIGHT = 420

const { sizes } = useTres()
const cameraRef = shallowRef<OrthographicCamera>()

// The snippet on the slide leaves this out. Tres does not resize an orthographic frustum,
// and the default one is 2 units wide, so the shapes would fill the whole canvas.
watch([sizes.width, sizes.height, cameraRef], () => {
  const cam = cameraRef.value
  if (!cam || !sizes.width.value || !sizes.height.value) return
  const aspect = sizes.width.value / sizes.height.value
  const height = Math.max(FIT_HEIGHT, FIT_WIDTH / aspect)
  cam.top = height / 2
  cam.bottom = -height / 2
  cam.left = -height * aspect / 2
  cam.right = height * aspect / 2
  cam.updateProjectionMatrix()
}, { immediate: true })

const cone = reactive({ rotationX: 0, x: 0 })
const sphere = reactive({ x: 0 })

let firstRun = true
watch(toRef(props, 'step'), (step) => {
  // Jump straight to the state when the slide opens on a later click, tween only on navigation
  const duration = firstRun ? 0 : 0.8
  firstRun = false
  const ease = 'power2.inOut'
  gsap.to(cone, { rotationX: step >= 2 ? Math.PI : 0, x: step >= 3 ? -146 : 0, duration, ease })
  gsap.to(sphere, { x: step >= 5 ? 172 : 0, duration, ease })
}, { immediate: true })

const { state: noiseTexture } = useTexture('/sumi/noise.png')
watch(noiseTexture, (tex) => {
  if (!tex) return
  tex.wrapS = RepeatWrapping
  tex.wrapT = RepeatWrapping
}, { immediate: true })

// Same as the last step on the "Paper grain" slide: 70% soft light of the grain over the base color
const withGrain = (base: Node, tex: Texture) => vec4(blendSoftLight(base, grainNoise(tex), float(0.7)), 1.0)

// Bound from step 0. Without a colorNode they render white, the same as the default material.
const coneMaterial = new MeshBasicNodeMaterial()
const sphereMaterial = new MeshBasicNodeMaterial()

// Same steps as the magic move on the "Carving the V" slide
function coneColorNode(step: number, tex: Texture | null) {
  if (step < 8) return null
  // From step 30 the V reads color1 of the active palette, like the original
  const green = step >= 30 ? vec3(colorArray.element(paletteIndex.mul(int(3)))) : color('#42b883')
  // Step 9 only wraps the color in Fn(), so it renders the same as step 8
  if (step < 10) return green

  return Fn(() => {
    const pos = positionLocal
    const inWedgeRange = pos.y.lessThan(-90)
    if (step < 11) {
      Discard(inWedgeRange)
    }
    else {
      const wedgeProgress = pos.y.add(200).div(110)
      const wedgeHalfWidth = float(64).mul(float(1).sub(wedgeProgress))
      const insideWedge = pos.x.abs().lessThan(wedgeHalfWidth)
      Discard(inWedgeRange.and(insideWedge))
    }
    // The slide only previews the raw grain on the sphere, so step 32 keeps the V colored
    if (step >= 33) return withGrain(green, tex!)
    return green
  })()
}

// Same steps as the magic move on the "Value noise" slide. The last stage is noise() in utils/vuefes-tsl/noise.
function noiseStage(stage: number) {
  return Fn(([st]: [Node]) => {
    if (stage === 0) return random(st)
    const i = floor(st)
    if (stage === 1) return random(i)

    const f = fract(st)
    // Stage 2 blends linearly, so the cell borders still show as creases
    const u = stage === 2 ? f : f.mul(f).mul(sub(3.0, mul(2.0, f)))

    const r00 = random(i)
    const r10 = random(i.add(vec2(1.0, 0.0)))
    const r01 = random(i.add(vec2(0.0, 1.0)))
    const r11 = random(i.add(vec2(1.0, 1.0)))

    return mix(mix(r00, r10, u.x), mix(r01, r11, u.x), u.y)
  })
}

// Same steps as the magic move on the "Fractal Brownian motion" slide
function fbmStage(stage: number) {
  return Fn(([st, amplitude, frequency, lacunarity, gain]: [Node, Node, Node, Node, Node]) => {
    const value = float(0).toVar()
    const amp = amplitude.toVar()
    const freq = frequency.toVar()

    if (stage === 0) {
      value.addAssign(amp.mul(noise(st.mul(freq))))
      return value
    }

    Loop(octaves, () => {
      value.addAssign(amp.mul(noise(st.mul(freq))))
      freq.mulAssign(lacunarity)
      // Stage 1 leaves out gain, so every octave adds the same amount and the sum burns out to white
      if (stage >= 2) amp.mulAssign(gain)
    })

    return value
  })
}

// Same as the "Sphere coordinates" slide and materials.ts: angles of the view-space normal,
// so the pattern faces the camera. spin adds time to theta.
function sphereCoords(spin: boolean) {
  const n = normalize(normalView)
  const phi = acos(n.y)
  const theta = spin ? atan(n.z, n.x).add(time.mul(0.1)) : atan(n.z, n.x)
  return { n, sphereUV: vec2(theta.div(PI.mul(2.0)), phi.div(PI)).mul(0.5) }
}

// Same as the first step of the magic move on the "calculateColor" slide: the ramp without the detail band
const inkRamp = Fn(([noiseValue, setIndex]: [Node, Node]) => {
  const colors = paletteColors(setIndex)
  const nv = fract(noiseValue.mul(5.0))
  const segment3 = floor(nv.mul(3.0))
  const localPos3 = fract(nv.mul(3.0))

  const currentColor3 = vec3(0.0).toVar()
  const nextColor3 = vec3(0.0).toVar()
  If(segment3.equal(0.0), () => {
    currentColor3.assign(colors.color1)
    nextColor3.assign(colors.color2)
  }).ElseIf(segment3.equal(1.0), () => {
    currentColor3.assign(colors.color2)
    nextColor3.assign(colors.color3)
  }).Else(() => {
    currentColor3.assign(colors.color3)
    nextColor3.assign(colors.color1)
  })

  const result = vec3(currentColor3).toVar()
  If(localPos3.greaterThan(0.8), () => {
    const tt = localPos3.sub(0.8).div(0.2)
    result.assign(mix(currentColor3, nextColor3, tt))
  })
  return result
})

function sphereColorNode(step: number, tex: Texture | null) {
  if (step < 8) return null
  if (step < 13) return color('#bc002d')
  // Geometry UVs are fixed to the mesh, so this checker turns with it when you orbit
  if (step < 14) return mix(color('#000000'), color('#ffffff'), checker(uv().mul(8.0)))

  const { n, sphereUV } = sphereCoords(step >= 15)
  if (step < 16) return mix(color('#000000'), color('#ffffff'), checker(sphereUV.mul(8.0)))
  if (step < 20) return vec3(noiseStage(step - 16)(sphereUV.mul(20.0)))
  if (step < 24) {
    // Stage 3 only shows the slider, so it renders the same as stage 2
    const fbmNode = fbmStage(Math.min(step - 20, 2))
    return gray(fbmNode(sphereUV.mul(3.0), float(0.6), float(2), float(1.8), float(0.5)))
  }

  // Same steps as the magic move on the "Layers of flow" slide
  const clouds = (st: Node) => fbm(st, float(0.6), float(2), float(1.8), float(0.5), 6)
  const st = sphereUV.mul(3.0)
  if (step === 24) return gray(clouds(st))
  if (step === 25) return gray(clouds(st.add(flowField(st, time))))
  if (step === 26) return gray(generateSumiPattern(sphereUV, time.mul(0.25), float(0.3)))

  // The pre-warp from materials.ts, without the grain jitter on flowStrength (grain comes later)
  const timeScale = time.mul(0.7)
  const baseFlow = flowField(sphereUV.mul(1.5), timeScale)
  const detailFlow = flowField(sphereUV.mul(3.0).add(baseFlow.mul(0.4)), timeScale.mul(1.2))
  const edgeIntensity = n.dot(vec3(0.0, 0.0, 1.0)).mul(0.5).add(0.5)
  const warpedUV = baseFlow.mul(0.7).add(detailFlow.mul(0.3))
    .add(edgeIntensity.mul(baseFlow).mul(1.5))
    .mul(0.1)
  const noiseValue = generateSumiPattern(sphereUV.add(warpedUV), time.mul(0.25), float(0.3))
  if (step === 27) return gray(noiseValue)
  if (step === 28) return inkRamp(noiseValue, paletteIndex)
  if (step === 32) return grainNoise(tex!)
  const baseColor = calculateColor(noiseValue, paletteIndex, sphereUV, warpedUV, time)
  return step >= 33 ? withGrain(baseColor, tex!) : baseColor
}

watch([toRef(props, 'step'), noiseTexture], ([step, tex]) => {
  // texture() captures the sampler when the node is built, so the grain steps show step 31 until the image loads
  const s = step >= 32 && !tex ? 31 : step
  coneMaterial.colorNode = coneColorNode(s, tex)
  sphereMaterial.colorNode = sphereColorNode(s, tex)
  // A new colorNode changes the shader, so the material has to compile again
  coneMaterial.needsUpdate = true
  sphereMaterial.needsUpdate = true
}, { immediate: true })

onUnmounted(() => {
  coneMaterial.dispose()
  sphereMaterial.dispose()
})
</script>

<template>
  <TresOrthographicCamera
    ref="cameraRef"
    :position="[0, 0, 1000]"
    :near="0.1"
    :far="9999"
  />

  <TresMesh
    v-if="step >= 1"
    :position="[cone.x, 0, 0]"
    :rotation="[cone.rotationX, 0, 0]"
    :material="coneMaterial"
  >
    <TresConeGeometry :args="[192, 330, 128]" />
  </TresMesh>

  <TresMesh v-if="step >= 4" :position="[sphere.x, 0, 0]" :material="sphereMaterial">
    <TresSphereGeometry :args="[165, 64, 64]" />
  </TresMesh>

  <OrbitControls v-if="controls" :enable-zoom="false" :enable-pan="false" />
</template>
