/// <reference types="@webgpu/types" />
import type { ShaderBgSettings } from './shader-bg-settings'
import { perlin3d } from '@typegpu/noise'
import { common, d, std, tgpu } from 'typegpu'
import { shaderBgSettings } from './shader-bg-settings'

export interface ShaderBg {
  destroy: () => void
}

const Params = d.struct({
  aspect: d.f32,
  // Accumulated on the CPU as speed * dt, so changing speed never makes the field jump
  phase: d.f32,
  angle: d.f32,
  broadFreq: d.vec2f,
  detailFreq: d.vec2f,
  detailSpeed: d.f32,
  detailWeight: d.f32,
  gain: d.f32,
  shadeLow: d.f32,
  shadeHigh: d.f32,
  lumMin: d.f32,
  lumMax: d.f32,
  curve: d.f32,
  grain: d.f32,
})

// One device for every slide instance (main view, presenter, overview thumbnails)
let rootPromise: ReturnType<typeof tgpu.init> | null = null
function getRoot() {
  rootPromise ??= tgpu.init()
  return rootPromise
}

// Grain is per pixel, so the canvas renders at device resolution. The cap keeps 4K presenter
// screens from paying for two Perlin samples on 8M pixels.
const MAX_RENDER_WIDTH = 2560

// Classic one-liner hash: good enough for film grain, no integer ops needed
const hash = (p: d.v2f): number => {
  'use gpu'
  return std.fract(std.sin(std.dot(p, d.vec2f(12.9898, 78.233))) * 43758.5453)
}

function toParams(s: ShaderBgSettings) {
  return {
    angle: s.angle,
    broadFreq: d.vec2f(s.broadFreqX, s.broadFreqY),
    detailFreq: d.vec2f(s.detailFreqX, s.detailFreqY),
    detailSpeed: s.detailSpeed,
    detailWeight: s.detailWeight,
    gain: s.gain,
    shadeLow: s.shadeLow,
    shadeHigh: s.shadeHigh,
    lumMin: s.lumMin,
    lumMax: s.lumMax,
    curve: s.curve,
    grain: s.grain,
  }
}

/**
 * Animated version of styles/bg.png: soft diagonal bands of grey that drift slowly, with film grain.
 * Reads the shared shaderBgSettings every frame, so the controls panel edits it live.
 * Layouts that mount this set --as-grain to 0 so the CSS overlay does not double the grain.
 * Resolves to null when WebGPU is unavailable so the caller can keep the static image.
 */
export async function createShaderBg(canvas: HTMLCanvasElement, onFirstFrame?: () => void): Promise<ShaderBg | null> {
  if (typeof navigator === 'undefined' || !navigator.gpu)
    return null

  let root: Awaited<ReturnType<typeof tgpu.init>>
  try {
    root = await getRoot()
  }
  catch {
    return null
  }

  const settings = shaderBgSettings
  const params = root.createUniform(Params, { aspect: 16 / 9, phase: 0, ...toParams(settings) })

  const pipeline = root.createRenderPipeline({
    vertex: common.fullScreenTriangle,
    fragment: ({ uv, $position }) => {
      'use gpu'
      const P = params.$
      const p = d.vec2f(uv.x * P.aspect, uv.y)

      // Tilt the domain so the bands run diagonally like the still image
      const ca = std.cos(P.angle)
      const sa = std.sin(P.angle)
      const r = d.vec2f(p.x * ca - p.y * sa, p.x * sa + p.y * ca)

      // Bands are long across x and tight across y. Phase is the third axis, so the field
      // morphs in place instead of scrolling.
      const broad = perlin3d.sample(d.vec3f(r.x * P.broadFreq.x, r.y * P.broadFreq.y, P.phase))
      const detail = perlin3d.sample(d.vec3f(r.x * P.detailFreq.x + 3.1, r.y * P.detailFreq.y + 1.7, P.phase * P.detailSpeed + 10))
      const n = std.mix(broad, detail, P.detailWeight) * P.gain

      const shade = std.smoothstep(P.shadeLow, P.shadeHigh, n)
      const base = std.mix(P.lumMin, P.lumMax, std.pow(shade, P.curve))

      // Static grain, like the baked grain in bg.png. Any stepped re-seed reads as a low frame
      // rate over the slow bands, so the pattern never changes.
      const grain = hash($position.xy) - 0.5
      const lum = base + grain * P.grain
      return d.vec4f(lum, lum, lum, 1)
    },
  })

  const context = root.configureContext({ canvas, alphaMode: 'opaque' })

  let disposed = false
  let raf = 0
  let visible = true
  let firstFrame = true
  let phase = 0
  let last = performance.now()

  const resize = () => {
    // Slidev scales the 960px slide with a CSS transform, so clientWidth lies about the on-screen size
    const rect = canvas.getBoundingClientRect()
    const w = rect.width || 960
    const h = rect.height || 540
    const scale = Math.min(window.devicePixelRatio || 1, MAX_RENDER_WIDTH / w)
    canvas.width = Math.max(1, Math.round(w * scale))
    canvas.height = Math.max(1, Math.round(h * scale))
    params.patch({ aspect: w / h })
  }

  const frame = () => {
    if (disposed)
      return
    const now = performance.now()
    // Clamp dt so a tab that was throttled does not lurch when it wakes up
    phase += Math.min((now - last) / 1000, 0.1) * settings.speed
    last = now
    params.patch({ phase, ...toParams(settings) })
    pipeline.withColorAttachment({ view: context }).draw(3)
    if (firstFrame) {
      firstFrame = false
      onFirstFrame?.()
    }
    if (visible)
      raf = requestAnimationFrame(frame)
  }

  const setVisible = (next: boolean) => {
    if (next === visible)
      return
    visible = next
    if (visible) {
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    else {
      cancelAnimationFrame(raf)
    }
  }

  // Hidden overview thumbnails and background tabs should not burn frames
  const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && document.visibilityState === 'visible'))
  io.observe(canvas)
  const onVisibility = () => setVisible(document.visibilityState === 'visible')
  document.addEventListener('visibilitychange', onVisibility)

  // ResizeObserver reports layout size, which never changes under a transform, so also listen to the window
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  window.addEventListener('resize', resize)

  resize()
  raf = requestAnimationFrame(frame)

  return {
    destroy() {
      disposed = true
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
      context.unconfigure()
      params.destroy()
    },
  }
}
