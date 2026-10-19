<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import { colorSets } from '../utils/vuefes-tsl/color-sets'

// Ported from the blog's "Ink bands and palettes" figure: calculateColor() shown as a Blender
// Color Ramp. The stops are bound to the shader's knobs (floor(nv * 3) fixes the segment starts,
// the 0.8 blend start moves the other three), so every handle maps to a number in the code.
// The preview is the same noise chain as the shader, run once on the CPU and recolored on every change.
// step comes from $clicks on the slide, the controls can override it live.
const props = defineProps<{ step: number }>()

// Same palette as the code blocks, so the figure reads as part of the code
const COLORS = {
  bg: '#303446',
  text: '#a5adce',
  accent: '#e78284',
}
const W = 256
const H = 104
const RAMP_W = 600
const T = 20
const INTERPOLATIONS = ['Constant', 'Linear', 'Ease'] as const
type Interpolation = typeof INTERPOLATIONS[number]

// One state per click: contour lines in three flat colors, then the blend, then the detail band
const STEPS: { bands: number, interpolation: Interpolation, detailBand: boolean }[] = [
  { bands: 5, interpolation: 'Constant', detailBand: false },
  { bands: 5, interpolation: 'Linear', detailBand: false },
  { bands: 5, interpolation: 'Linear', detailBand: true },
]

const palette = ref(0)
const blend = ref(0.8)
const bands = ref(5)
const interpolation = ref<Interpolation>('Constant')
const detailBand = ref(false)
const selected = ref(1)

watch(() => props.step, (step) => {
  const state = STEPS[Math.min(step, STEPS.length - 1)]!
  bands.value = state.bands
  interpolation.value = state.interpolation
  detailBand.value = state.detailBand
  blend.value = 0.8
}, { immediate: true })

const rampRef = useTemplateRef<HTMLCanvasElement>('rampCanvas')
const barRef = useTemplateRef<HTMLDivElement>('bar')
const grayRef = useTemplateRef<HTMLCanvasElement>('grayCanvas')
const colorRef = useTemplateRef<HTMLCanvasElement>('colorCanvas')

// fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123), same as the shader
function random(x: number, y: number): number {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123
  return s - Math.floor(s)
}

function noise(x: number, y: number): number {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  const ux = fx * fx * (3 - 2 * fx)
  const uy = fy * fy * (3 - 2 * fy)
  const a = random(ix, iy)
  const b = random(ix + 1, iy)
  const c = random(ix, iy + 1)
  const d = random(ix + 1, iy + 1)
  return (a + (b - a) * ux) * (1 - uy) + (c + (d - c) * ux) * uy
}

function fbm(x: number, y: number, amplitude = 0.6, frequency = 2, lacunarity = 1.8, gain = 0.5, octaves = 6): number {
  let value = 0
  let amp = amplitude
  let freq = frequency
  for (let i = 0; i < octaves; i++) {
    value += amp * noise(x * freq, y * freq)
    freq *= lacunarity
    amp *= gain
  }
  return value
}

function flowField(x: number, y: number, t: number): [number, number] {
  return [fbm(x, y + t * 0.1), fbm(x + t * 0.1, y)]
}

// The three-layer warp shared by generateSumiPattern and generateSumiDetail
function layeredFlow(x: number, y: number, ts: number): [number, number] {
  const [f1x, f1y] = flowField(x * 2, y * 2, ts)
  const [f2x, f2y] = flowField(x * 4 + f1x * 0.2, y * 4 + f1y * 0.2, ts * 1.2)
  const [f3x, f3y] = flowField(x * 8 + f2x * 0.15, y * 8 + f2y * 0.15, ts * 0.9)
  return [
    f1x * 0.5 + f2x * 0.3 + f3x * 0.2,
    f1y * 0.5 + f2y * 0.3 + f3y * 0.2,
  ]
}

function sumiPattern(u: number, v: number, t: number, scale: number): number {
  const x = u * scale
  const y = v * scale
  const [fx, fy] = layeredFlow(x, y, t * 0.15)
  const marble = fbm(x + fx * 0.8, y + fy * 0.8)
  const sumi = fbm((x + fx) * 3 + t * 0.05, (y + fy) * 3 + t * 0.05)
  return marble * 0.5 + sumi * 0.5
}

function sumiDetail(x: number, y: number, t: number): number {
  const [fx, fy] = layeredFlow(x, y, t * 0.15)
  return fbm((x + fx) * 6 + t * 0.02, (y + fy) * 6 + t * 0.02, 0.8, 4, 2.2, 0.7, 4)
}

// noiseValue per pixel, plus the warped UV that the detail band needs later
const values = new Float32Array(W * H)
const warped = new Float32Array(W * H * 2)
// The detail noise is only read inside the 0.30-0.33 band, which moves with the
// bands slider, so it is filled lazily. NaN means "not computed yet".
const details = new Float32Array(W * H).fill(Number.NaN)
let rowsDone = 0

function computePixel(px: number, py: number) {
  // A patch of sphereUV close to what faces the camera on the sphere
  const u = (px / W) * 0.5
  const v = 0.1 + (py / H) * 0.2
  const ts = T * 0.7
  const [bx, by] = flowField(u * 1.5, v * 1.5, ts)
  const [dx, dy] = flowField(u * 3 + bx * 0.4, v * 3 + by * 0.4, ts * 1.2)
  // edgeIntensity is 1 here: the preview is the center of the disc
  const wx = (bx * 0.7 + dx * 0.3) * 0.1 + bx * 0.15
  const wy = (by * 0.7 + dy * 0.3) * 0.1 + by * 0.15
  const i = py * W + px
  values[i] = sumiPattern(u + wx, v + wy, T * 0.25, 0.3)
  warped[i * 2] = u + wx
  warped[i * 2 + 1] = v + wy
}

function detailAt(i: number): number {
  if (Number.isNaN(details[i]!)) {
    details[i] = sumiDetail(warped[i * 2]! * 0.1, warped[i * 2 + 1]! * 0.1, T * 0.1)
  }
  return details[i]!
}

// three.js stores Color in linear space and the shader mixes there, so the
// ramp mixes in linear too and converts to sRGB only for display
function toSRGB(c: number): number {
  const v = c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055
  return Math.round(Math.min(1, Math.max(0, v)) * 255)
}

const colors = computed(() => {
  const set = colorSets[palette.value]!
  return [set.color1, set.color2, set.color3].map(c => [c.r, c.g, c.b] as const)
})

function blendBetween(idx: number, local: number, out: number[]) {
  const cur = colors.value[idx]!
  const next = colors.value[(idx + 1) % 3]!
  let t = 0
  if (interpolation.value !== 'Constant' && local > blend.value) {
    t = (local - blend.value) / (1 - blend.value)
    if (interpolation.value === 'Ease') t = t * t * (3 - 2 * t)
  }
  out[0] = cur[0] + (next[0] - cur[0]) * t
  out[1] = cur[1] + (next[1] - cur[1]) * t
  out[2] = cur[2] + (next[2] - cur[2]) * t
}

// The Else branch of calculateColor: three segments, flat until blend start
function ramp(nv: number, out: number[]) {
  const seg = Math.min(2, Math.floor(nv * 3))
  blendBetween(seg, nv * 3 - seg, out)
}

// The If branch: the same ramp, cycled faster and nudged by detail noise
function rampDetail(nv: number, detail: number, out: number[]) {
  const n = nv * 0.95 + detail * 0.05
  const idx = Math.floor(n * 24) % 3
  const local = n * 9 - Math.floor(n * 9)
  blendBetween(idx, local, out)
}

const inDetailBand = (nv: number) => nv > 0.3 && nv < 0.33

function drawRamp() {
  const ctx = rampRef.value?.getContext('2d')
  if (!ctx) return
  const img = ctx.createImageData(RAMP_W, 1)
  const rgb = [0, 0, 0]
  for (let x = 0; x < RAMP_W; x++) {
    ramp(x / RAMP_W, rgb)
    img.data[x * 4] = toSRGB(rgb[0]!)
    img.data[x * 4 + 1] = toSRGB(rgb[1]!)
    img.data[x * 4 + 2] = toSRGB(rgb[2]!)
    img.data[x * 4 + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
}

function drawPreviews() {
  const gray = grayRef.value?.getContext('2d')
  const color = colorRef.value?.getContext('2d')
  if (!gray || !color || !rowsDone) return
  const grayImg = gray.createImageData(W, rowsDone)
  const colorImg = color.createImageData(W, rowsDone)
  const rgb = [0, 0, 0]
  for (let i = 0; i < W * rowsDone; i++) {
    const n = values[i]!
    const g = Math.round(Math.min(1, n) * 255)
    grayImg.data[i * 4] = g
    grayImg.data[i * 4 + 1] = g
    grayImg.data[i * 4 + 2] = g
    grayImg.data[i * 4 + 3] = 255

    const scaled = n * bands.value
    const nv = scaled - Math.floor(scaled)
    if (detailBand.value && inDetailBand(nv)) rampDetail(nv, detailAt(i), rgb)
    else ramp(nv, rgb)
    colorImg.data[i * 4] = toSRGB(rgb[0]!)
    colorImg.data[i * 4 + 1] = toSRGB(rgb[1]!)
    colorImg.data[i * 4 + 2] = toSRGB(rgb[2]!)
    colorImg.data[i * 4 + 3] = 255
  }
  gray.putImageData(grayImg, 0, 0)
  color.putImageData(colorImg, 0, 0)
}

watch([palette, blend, interpolation], drawRamp)
watch([palette, blend, interpolation, bands, detailBand], drawPreviews)

// Seven stops, like the Color Ramp node. The ones on k / 3 come from floor(nv * 3) and
// cannot move. The other three all sit at (k + blend) / 3, so dragging any of them
// moves the blend start for every segment.
const stops = computed(() => {
  const b = blend.value
  return [
    { pos: 0, color: 0, movable: false },
    { pos: b / 3, color: 0, movable: true, segment: 0 },
    { pos: 1 / 3, color: 1, movable: false },
    { pos: (1 + b) / 3, color: 1, movable: true, segment: 1 },
    { pos: 2 / 3, color: 2, movable: false },
    { pos: (2 + b) / 3, color: 2, movable: true, segment: 2 },
    { pos: 1, color: 0, movable: false },
  ]
})

const hexes = computed(() => {
  const set = colorSets[palette.value]!
  return [set.color1, set.color2, set.color3].map(c => `#${c.getHexString().toUpperCase()}`)
})

const selectedStop = computed(() => stops.value[selected.value]!)

let dragSegment: number | null = null

function onHandleDown(index: number, event: PointerEvent) {
  selected.value = index
  const stop = stops.value[index]!
  if (!stop.movable) return
  dragSegment = stop.segment!
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onHandleMove(event: PointerEvent) {
  if (dragSegment === null || !barRef.value) return
  // getBoundingClientRect includes Slidev's scale transform, so this stays in bar units
  const rect = barRef.value.getBoundingClientRect()
  const pos = (event.clientX - rect.left) / rect.width
  // Stay inside the segment: 0 is a full gradient, 0.95 is almost a hard edge
  const next = Math.min(0.95, Math.max(0, pos * 3 - dragSegment))
  blend.value = Math.round(next * 100) / 100
}

function onHandleUp() {
  dragSegment = null
}

let raf = 0
onMounted(() => {
  drawRamp()
  // About 290 hashes per pixel, so the field is built a few rows per frame
  // and painted as it goes instead of blocking the slide
  const step = () => {
    const end = Math.min(H, rowsDone + 12)
    for (let y = rowsDone; y < end; y++) {
      for (let x = 0; x < W; x++) computePixel(x, y)
    }
    rowsDone = end
    drawPreviews()
    if (rowsDone < H) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
})

onUnmounted(() => cancelAnimationFrame(raf))
</script>

<template>
  <div class="rounded-lg px-4 py-3 flex flex-col gap-2 font-mono text-xs" :style="{ background: COLORS.bg, color: COLORS.text }">
    <div class="flex items-center gap-5">
      <div class="flex items-center gap-2">
        <button
          v-for="(set, i) in colorSets"
          :key="i"
          type="button"
          class="size-5 rounded-full border-2 transition-transform"
          :class="i === palette ? 'scale-110 border-white' : 'border-transparent opacity-60'"
          :style="{ background: `linear-gradient(135deg, ${set.color1.getStyle()} 33%, ${set.color2.getStyle()} 33% 66%, ${set.color3.getStyle()} 66%)` }"
          :aria-label="`Palette ${i + 1}`"
          @click="palette = i"
        />
      </div>
      <div class="flex rounded overflow-hidden border border-white/15">
        <button
          v-for="mode in INTERPOLATIONS"
          :key="mode"
          type="button"
          class="px-2 py-0.5"
          :class="mode === interpolation ? 'bg-white/15 text-white' : ''"
          @click="interpolation = mode"
        >
          {{ mode }}
        </button>
      </div>
      <label class="flex items-center gap-2">
        <span class="whitespace-nowrap">bands {{ bands }}</span>
        <input v-model.number="bands" type="range" min="1" max="10" step="1" class="w-24 accent-[#e78284]">
      </label>
      <label class="flex items-center gap-2">
        <input v-model="detailBand" type="checkbox" class="accent-[#e78284]">
        <span>detail band</span>
      </label>
    </div>

    <div ref="bar" class="relative mx-1">
      <div class="relative">
        <canvas ref="rampCanvas" :width="RAMP_W" height="1" class="ramp-bar" />
        <div v-if="detailBand" class="detail-hatch" title="Detail band, 0.30 to 0.33" />
      </div>
      <div class="relative h-5">
        <button
          v-for="(stop, i) in stops"
          :key="i"
          type="button"
          class="stop"
          :class="{ 'is-movable': stop.movable, 'is-selected': i === selected }"
          :style="{ left: `${stop.pos * 100}%` }"
          :aria-label="`Stop ${i + 1} at ${stop.pos.toFixed(3)}`"
          @pointerdown="onHandleDown(i, $event)"
          @pointermove="onHandleMove"
          @pointerup="onHandleUp"
          @pointercancel="onHandleUp"
        >
          <span class="stop-arrow" />
          <span class="stop-box" :style="{ backgroundColor: hexes[stop.color] }" />
        </button>
      </div>
    </div>

    <div class="flex items-center justify-between mx-1">
      <div class="flex gap-4">
        <span v-for="(hex, i) in hexes" :key="hex" class="flex items-center gap-1.5">
          <span class="size-3 rounded-sm" :style="{ backgroundColor: hex }" />
          color{{ i + 1 }} {{ hex }}
        </span>
      </div>
      <span>
        pos {{ selectedStop.pos.toFixed(3) }} ·
        {{ selectedStop.movable ? `(${selectedStop.segment} + ${blend.toFixed(2)}) / 3` : 'fixed by floor(nv × 3)' }}
      </span>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <canvas ref="grayCanvas" :width="W" :height="H" class="block w-full h-auto rounded" />
        <div class="mt-1">noiseValue</div>
      </div>
      <div>
        <canvas ref="colorCanvas" :width="W" :height="H" class="block w-full h-auto rounded" />
        <div class="mt-1">ramp(fract(noiseValue × {{ bands }}))</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ramp-bar {
  display: block;
  width: 100%;
  height: 1.5rem;
  border-radius: 3px;
}

.detail-hatch {
  position: absolute;
  inset-block: 0;
  left: 30%;
  width: 3%;
  border-inline: 1px solid rgb(255 255 255 / 0.9);
  background: repeating-linear-gradient(45deg, rgb(255 255 255 / 0.6) 0 2px, transparent 2px 5px);
  pointer-events: none;
}

/* Blender-style stop: a small arrow pointing at the bar, a color box below */
.stop {
  position: absolute;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-inline: 4px;
  transform: translateX(-50%);
  touch-action: none;
  cursor: default;
  opacity: 0.4;
}

.stop.is-movable {
  cursor: ew-resize;
  opacity: 1;
}

.stop-arrow {
  width: 0;
  height: 0;
  border-inline: 5px solid transparent;
  border-bottom: 6px solid #c6d0f5;
}

.stop-box {
  width: 10px;
  height: 12px;
  border: 1px solid #c6d0f5;
  border-radius: 2px;
}

.stop.is-selected .stop-arrow {
  border-bottom-color: #e78284;
}

.stop.is-selected .stop-box {
  border-color: #e78284;
  box-shadow: 0 0 0 1px #e78284;
}
</style>
