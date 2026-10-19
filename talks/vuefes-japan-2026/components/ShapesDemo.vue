<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import type { TresRendererSetupContext } from '@tresjs/core'
import { TresCanvas } from '@tresjs/core'
import { useDevicePixelRatio } from '@vueuse/core'
import { NoToneMapping } from 'three'
import { WebGPURenderer } from 'three/webgpu'
import { computed, ref, toValue } from 'vue'
import { colorSets } from '../utils/vuefes-tsl/color-sets'

// The build step across the slides, see ShapesDemoStage. octaves comes from the slider on the fbm slide.
defineProps<{ step: number, octaves?: number, controls?: boolean }>()

const highContrast = ref(false)

// Same as the dots under the final scene: a click jumps to a palette and the 15 s cycle goes on from there
const paletteOffset = ref(0)
const activePalette = ref(0)

function pickPalette(index: number) {
  paletteOffset.value = (index - (activePalette.value - paletteOffset.value) + colorSets.length * 2) % colorSets.length
}

// Slidev upscales the slide with a CSS transform, so the renderer draws the extra pixels to stay sharp
const { $scale } = useSlideContext()
const { pixelRatio } = useDevicePixelRatio()
const dpr = computed(() => Math.min(pixelRatio.value * $scale.value, 2))

function createWebGPURenderer(ctx: TresRendererSetupContext) {
  return new WebGPURenderer({
    canvas: toValue(ctx.canvas),
    alpha: true,
    antialias: true,
  })
}
</script>

<template>
  <div class="relative size-full">
    <!-- No tone mapping, so the flat colors on the "Node materials" slide match their hex values -->
    <TresCanvas
      :renderer="createWebGPURenderer"
      :clear-alpha="0"
      :tone-mapping="NoToneMapping"
      :dpr="dpr"
    >
      <ShapesDemoStage
        :step="step"
        :octaves="octaves"
        :controls="controls"
        :high-contrast="highContrast"
        :palette-offset="paletteOffset"
        @palette="activePalette = $event"
      />
    </TresCanvas>

    <!-- Only on the gray steps: fbm sits around 0.6, so the clouds look washed out -->
    <button
      v-if="step >= 20 && step < 28"
      type="button"
      class="absolute bottom-2 right-2 flex rounded-full bg-black/60 p-1 text-sm transition-opacity"
      :class="highContrast ? 'text-white' : 'opacity-50'"
      :aria-pressed="highContrast"
      aria-label="High contrast"
      title="High contrast"
      @click="highContrast = !highContrast"
    >
      <ph-circle-half-fill />
    </button>

    <div v-if="step >= 31" class="absolute bottom-2 right-2 flex gap-1.5 rounded-full bg-black/60 p-1.5">
      <button
        v-for="(set, i) in colorSets"
        :key="i"
        type="button"
        class="size-4 rounded-full border-2 transition-transform"
        :class="i === activePalette ? 'scale-110 border-white' : 'border-transparent opacity-60'"
        :style="{ background: `linear-gradient(135deg, ${set.color1.getStyle()} 33%, ${set.color2.getStyle()} 33% 66%, ${set.color3.getStyle()} 66%)` }"
        :aria-label="`Palette ${i + 1}`"
        @click="pickPalette(i)"
      />
    </div>
  </div>
</template>
