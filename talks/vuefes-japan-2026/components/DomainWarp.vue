<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { useDevicePixelRatio, useRafFn } from '@vueuse/core'
import { computed, ref, useTemplateRef, watch } from 'vue'

// Ported from the blog's "Pushing the ink around" figure: concentric ink rings (a suminagashi drop)
// pushed by the same random -> noise -> fbm chain as the shader, but on the CPU.
// step comes from $clicks on the slide, the slider can override it live.
const props = defineProps<{ step: number }>()

// Same palette as the code blocks, so the figure reads as part of the code
const COLORS = {
  bg: '#303446',
  ink: '#c6d0f5',
  accent: '#e78284',
  text: '#a5adce',
}
const W = 900
const H = 360
const RINGS = 12
const RING_GAP = 11
const SEGMENTS = 240
const CENTER_Y = 200
const CENTERS = [225, 675]

const STRENGTH_PER_STEP = [0, 0.4, 1]

const strength = ref(STRENGTH_PER_STEP[0]!)
watch(() => props.step, (step) => {
  strength.value = STRENGTH_PER_STEP[Math.min(step, STRENGTH_PER_STEP.length - 1)]!
}, { immediate: true })

// Slidev upscales the slide with a CSS transform, so the canvas draws the extra pixels to stay sharp
const { $scale } = useSlideContext()
const { pixelRatio } = useDevicePixelRatio()
const dpr = computed(() => Math.min(pixelRatio.value * $scale.value, 3))

const canvasRef = useTemplateRef<HTMLCanvasElement>('cv')

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

function fbm(x: number, y: number): number {
  let value = 0
  let amp = 0.6
  let freq = 2
  for (let i = 0; i < 4; i++) {
    value += amp * noise(x * freq, y * freq)
    freq *= 1.8
    amp *= 0.5
  }
  return value
}

// Two fbm reads with different drifts give a direction, not just a length.
// 0.55 is about the fbm average, so the push goes both ways.
function flow(x: number, y: number, t: number): [number, number] {
  const fx = fbm(x, y + t * 0.1) - 0.55
  const fy = fbm(x + t * 0.1, y) - 0.55
  return [fx, fy]
}

function drawDrop(ctx: CanvasRenderingContext2D, cx: number, cy: number, amount: number, t: number) {
  ctx.lineWidth = 1.8
  for (let r = 1; r <= RINGS; r++) {
    const radius = r * RING_GAP
    ctx.beginPath()
    for (let s = 0; s <= SEGMENTS; s++) {
      const a = (s / SEGMENTS) * Math.PI * 2
      const px = cx + Math.cos(a) * radius
      const py = cy + Math.sin(a) * radius
      // Sample the field in a small coordinate space so the push is smooth across the drop
      const [dx, dy] = flow(px * 0.006, py * 0.006, t)
      const push = amount * 140
      const x = px + dx * push
      const y = py + dy * push
      if (s === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = r % 3 === 0 ? COLORS.accent : COLORS.ink
    ctx.globalAlpha = 0.55 + 0.45 * (1 - r / RINGS)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

// Eased toward strength every frame, so a click bends the rings instead of jumping
let shown = strength.value
let start = 0

function draw(now: number) {
  const canvas = canvasRef.value
  if (!canvas) return
  if (!start) start = now
  const t = (now - start) / 1000
  shown += (strength.value - shown) * 0.08

  const ratio = dpr.value
  if (canvas.width !== Math.round(W * ratio)) {
    canvas.width = Math.round(W * ratio)
    canvas.height = Math.round(H * ratio)
  }
  const ctx = canvas.getContext('2d')!
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  ctx.clearRect(0, 0, W, H)

  ctx.fillStyle = COLORS.text
  ctx.font = '17px "JetBrains Mono", ui-monospace, monospace'
  ctx.textAlign = 'center'
  ctx.fillText('rings drawn at p', CENTERS[0]!, 36)
  ctx.fillText('rings drawn at p + flow(p) × strength', CENTERS[1]!, 36)

  drawDrop(ctx, CENTERS[0]!, CENTER_Y, 0, t)
  drawDrop(ctx, CENTERS[1]!, CENTER_Y, shown, t)

  ctx.strokeStyle = COLORS.text
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(425, CENTER_Y)
  ctx.lineTo(475, CENTER_Y)
  ctx.lineTo(465, CENTER_Y - 8)
  ctx.moveTo(475, CENTER_Y)
  ctx.lineTo(465, CENTER_Y + 8)
  ctx.stroke()
}

useRafFn(({ timestamp }) => draw(timestamp))
</script>

<template>
  <div class="relative rounded-lg overflow-hidden" :style="{ background: COLORS.bg }">
    <canvas ref="cv" class="w-full h-auto block" :style="{ aspectRatio: `${W} / ${H}` }" />
    <!-- Under the arrow, the only gap the warped rings never reach -->
    <label class="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 font-mono text-sm" :style="{ color: COLORS.text }">
      <span class="whitespace-nowrap">strength {{ strength.toFixed(2) }}</span>
      <input v-model.number="strength" type="range" min="0" max="1" step="0.01" class="w-28 accent-[#e78284]">
    </label>
  </div>
</template>
