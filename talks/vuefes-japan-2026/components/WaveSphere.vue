<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { OrbitControls } from '@tresjs/cientos'
import type { TresRendererSetupContext } from '@tresjs/core'
import { TresCanvas } from '@tresjs/core'
import { useDevicePixelRatio } from '@vueuse/core'
import { mix, sin, time, uv, vec3 } from 'three/tsl'
import { MeshStandardNodeMaterial, WebGPURenderer } from 'three/webgpu'
import { computed, onUnmounted, toValue } from 'vue'

// Same node graph as the TSL step on the "Why WebGPU?" slide
const material = new MeshStandardNodeMaterial({ roughness: 0.4 })
material.colorNode = mix(
  vec3(0.1, 0.3, 0.9), vec3(1.0, 0.5, 0.1),
  sin(uv().y.mul(20).add(time)).mul(0.5).add(0.5),
)

onUnmounted(() => material.dispose())

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
  <div class="size-full">
    <TresCanvas :renderer="createWebGPURenderer" :clear-alpha="0" :dpr="dpr">
      <TresPerspectiveCamera :position="[0, 0, 3.2]" />
      <OrbitControls auto-rotate :enable-zoom="false" />
      <TresAmbientLight :intensity="1.5" />
      <TresDirectionalLight :position="[3, 3, 3]" :intensity="3" />
      <TresMesh :material="material">
        <TresSphereGeometry :args="[1, 64, 64]" />
      </TresMesh>
    </TresCanvas>
  </div>
</template>
