<script setup lang="ts">
import type { ShaderBg } from '../utils/shader-bg'
import { defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { createShaderBg } from '../utils/shader-bg'

// Lazy so @tresjs/leches only ships to decks that turn the panel on
const ShaderBgControls = defineAsyncComponent(() => import('./ShaderBgControls.vue'))

const props = defineProps<{
  /** Show the TresLeches tweak panel. Set `bgControls: true` in the slide frontmatter. */
  controls?: boolean
}>()

const canvas = ref<HTMLCanvasElement>()
const ready = ref(false)

let bg: ShaderBg | null = null
let unmounted = false

// Slidev mounts the same slide more than once (transitions, presenter view), one panel is enough
const ownsPanel = ref(false)

onMounted(async () => {
  if (props.controls && !panelOwner) {
    panelOwner = true
    ownsPanel.value = true
  }
  if (!canvas.value)
    return
  const created = await createShaderBg(canvas.value, () => {
    ready.value = true
  })
  // The slide can unmount while the device is still initialising
  if (unmounted)
    created?.destroy()
  else
    bg = created
})

onBeforeUnmount(() => {
  unmounted = true
  if (ownsPanel.value)
    panelOwner = false
  bg?.destroy()
  bg = null
})
</script>

<script lang="ts">
let panelOwner = false
</script>

<template>
  <canvas
    ref="canvas"
    class="shader-bg"
    :class="{ 'is-ready': ready }"
    aria-hidden="true"
  />
  <ShaderBgControls v-if="ownsPanel" />
</template>

<style scoped>
/* Sits over the layout's static bg.png and fades in once the first frame is drawn, so no-WebGPU falls back silently */
.shader-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
  opacity: 0;
  transition: opacity 600ms ease;
}

.shader-bg.is-ready { opacity: 1; }
</style>
