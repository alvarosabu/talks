<script setup lang="ts">
import { Environment } from '@tresjs/cientos'
import { TresCanvas } from '@tresjs/core'
import { useIsSlideActive, useSlideContext } from '@slidev/client'
import { useCssVar, useDevicePixelRatio } from '@vueuse/core'
import type { PerspectiveCamera } from 'three'
import { Plane, Raycaster, Vector2, Vector3 } from 'three'
import { computed, ref, shallowRef } from 'vue'
import { contributors, organizations } from '../utils/credits'

// Same reason as LaptopScene: Slidev upscales the slide with a CSS transform, so the renderer
// draws the extra pixels to stay sharp. Capped at 2 because every bubble is a transmission pass sample.
const { $scale } = useSlideContext()
const { pixelRatio } = useDevicePixelRatio()
const dpr = computed(() => Math.min(pixelRatio.value * $scale.value, 2))

const isSlideActive = useIsSlideActive()

// The canvas is opaque in the slide color, not transparent. Additive blending on a transparent
// canvas also adds alpha, which paints every bubble as a black disc over the slide.
const wrapper = shallowRef<HTMLElement>()
const background = useCssVar('--as-bg', wrapper, { initialValue: '#171717' })

// The organizations come in first, then the contributors one after another
const credits = [
  ...organizations.map(credit => ({ credit, delay: 0.2 })),
  ...contributors.map((credit, i) => ({ credit, delay: 0.6 + i * 0.05 })),
]

const cameraRef = shallowRef<PerspectiveCamera>()
const pointer = shallowRef<Vector3 | null>(null)
const raycaster = new Raycaster()
const ndc = new Vector2()
const zPlane = new Plane(new Vector3(0, 0, 1), 0)

function onPointerMove(event: PointerEvent) {
  const camera = cameraRef.value
  if (!camera) return
  // getBoundingClientRect includes the Slidev scale transform, so the math works at any window size
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  ndc.set(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  )
  raycaster.setFromCamera(ndc, camera)
  const hit = new Vector3()
  pointer.value = raycaster.ray.intersectPlane(zPlane, hit) ? hit : null
}

const hovered = ref(0)
function onHover(isHovered: boolean) {
  hovered.value = Math.max(0, hovered.value + (isHovered ? 1 : -1))
}
</script>

<template>
  <div
    ref="wrapper"
    class="size-full"
    :class="{ 'cursor-pointer': hovered > 0 }"
    @pointermove="onPointerMove"
    @pointerleave="pointer = null"
  >
    <TresCanvas :clear-color="background" :dpr="dpr">
      <TresPerspectiveCamera ref="cameraRef" :position="[0, 0, 16]" :fov="35" />
      <!-- A local file, not a preset: presets download from a CDN, and the venue Wi-Fi cannot be trusted -->
      <!-- Environment has an async setup, so Vue renders it only inside a Suspense -->
      <Suspense>
        <Environment files="/credits/studio_1k.hdr" />
      </Suspense>
      <!-- The HDR is mostly dark, so this light adds the small bright highlight a soap bubble has -->
      <TresDirectionalLight :position="[-4, 6, 8]" :intensity="3" />
      <CreditBubble
        v-for="{ credit, delay } in credits"
        :key="credit.id"
        :credit="credit"
        :pointer="pointer"
        :active="isSlideActive"
        :delay="delay"
        @hover="onHover"
      />
    </TresCanvas>
  </div>
</template>
