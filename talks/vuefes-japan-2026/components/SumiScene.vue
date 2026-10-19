<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import type { TresRendererSetupContext } from '@tresjs/core'
import { TresCanvas } from '@tresjs/core'
import { useDevicePixelRatio } from '@vueuse/core'
import { NoToneMapping } from 'three'
import { WebGPURenderer } from 'three/webgpu'
import { computed, ref, toValue } from 'vue'
import { colorSets } from '../utils/vuefes-tsl/color-sets'

const paletteOffset = ref(0)
const activePalette = ref(0)

const background = computed(() => colorSets[activePalette.value]?.bg ?? '#fae8e4')

// Slidev upscales the slide with a CSS transform, so the renderer draws the extra pixels
// to stay sharp. Capped lower than the laptop scene because this shader runs many fbm octaves per pixel.
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

function pickPalette(index: number) {
  // The stage adds this offset to its automatic cycle, so a click jumps to the
  // chosen set and the cycle continues from there.
  paletteOffset.value = (index - (activePalette.value - paletteOffset.value) + colorSets.length * 2) % colorSets.length
}
</script>

<template>
  <div
    class="relative size-full transition-colors duration-500"
    :style="{ backgroundColor: background }"
  >
    <TresCanvas
      :renderer="createWebGPURenderer"
      :clear-alpha="0"
      :tone-mapping="NoToneMapping"
      :dpr="dpr"
    >
      <SumiStage :palette-offset="paletteOffset" @palette="activePalette = $event" />
    </TresCanvas>

    <div class="absolute top-6 right-6 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5">
      <button
        v-for="(set, i) in colorSets"
        :key="i"
        type="button"
        class="size-5 rounded-full border-2 transition-transform"
        :class="i === activePalette ? 'scale-110 border-white' : 'border-transparent opacity-70'"
        :style="{ background: `linear-gradient(135deg, ${set.color1.getStyle()} 33%, ${set.color2.getStyle()} 33% 66%, ${set.color3.getStyle()} 66%)` }"
        :aria-label="`Palette ${i + 1}`"
        @click="pickPalette(i)"
      />
    </div>
  </div>
</template>
