<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { useSlideContext } from '@slidev/client'
import { useDevicePixelRatio } from '@vueuse/core'
import type { DirectionalLight } from 'three'
import { computed, shallowRef, watch } from 'vue'
import type { Pose } from './Polaroid.vue'

// step comes from $clicks on the slide: click N lands polaroid N on the pile
defineProps<{ step: number }>()

const DEG = Math.PI / 180

// Click order. The 1000w files are enough: a card is at most about 700 device pixels wide on a 4K projector.
// IMG_5644 is only 924px wide, so it uses its native size instead of an upscaled 1000w file.
// The z gap is wider than the tilt and the sway can close, so neighbouring cards never cut through each other.
const PHOTOS: { src?: string, orientation: 'landscape' | 'portrait', rest: Pose }[] = [
  { src: '/polaroids/namba-shrine-lion-grainy-1000.webp', orientation: 'landscape', rest: { x: -0.7, y: 1.15, z: 0, rotX: 0.02, rotY: -0.02, rotZ: -6 * DEG } },
  { src: '/polaroids/img-5644-924.webp', orientation: 'portrait', rest: { x: 1.05, y: 0.85, z: 0.1, rotX: -0.01, rotY: 0.02, rotZ: 8 * DEG } },
  { src: '/polaroids/img-3266-1000.webp', orientation: 'landscape', rest: { x: -0.8, y: -0.95, z: 0.2, rotX: 0.01, rotY: 0.02, rotZ: 5 * DEG } },
  { src: '/polaroids/img-2990-1000.webp', orientation: 'portrait', rest: { x: 1, y: -0.8, z: 0.3, rotX: -0.02, rotY: -0.01, rotZ: -7 * DEG } },
  { src: '/polaroids/img-2774-1000.webp', orientation: 'landscape', rest: { x: -0.55, y: 0.15, z: 0.4, rotX: 0.01, rotY: -0.01, rotZ: -4 * DEG } },
  // The proposal closes the slide, so it lands last, near the middle and on top of everything
  { src: '/polaroids/img-3197-1000.webp', orientation: 'portrait', rest: { x: 0.45, y: -0.1, z: 0.5, rotX: -0.01, rotY: 0.01, rotZ: 4 * DEG } },
]

// Same reason as LaptopScene: Slidev upscales the slide with a CSS transform, so the renderer draws the extra pixels
const { $scale } = useSlideContext()
const { pixelRatio } = useDevicePixelRatio()
const dpr = computed(() => Math.min(pixelRatio.value * $scale.value, 3))

// The default 512px shadow map makes the soft edge under each card look blocky
const light = shallowRef<DirectionalLight>()
watch(light, (l) => {
  if (!l) return
  l.shadow.mapSize.set(2048, 2048)
  l.shadow.bias = -0.0004
  l.shadow.normalBias = 0.02
})
</script>

<template>
  <!-- TresCanvas takes the size of its parent, so it needs a box of its own -->
  <div class="size-full">
    <TresCanvas :clear-alpha="0" :dpr="dpr" shadows>
      <TresPerspectiveCamera :position="[0, 0, 10.5]" :fov="35" />
      <TresAmbientLight :intensity="1.5" />
      <!-- From the top left and in front, so each card drops its shadow down and right onto the one below -->
      <TresDirectionalLight ref="light" :position="[-5, 6, 5]" :intensity="2" cast-shadow />
      <Polaroid
        v-for="(photo, i) in PHOTOS"
        :key="i"
        :src="photo.src"
        :orientation="photo.orientation"
        :label="`${i + 1} · ${photo.orientation}`"
        :rest="photo.rest"
        :visible="step > i"
      />
    </TresCanvas>
  </div>
</template>
