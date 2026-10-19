<script setup lang="ts">
import { TresLeches, useControls } from '@tresjs/leches'
import { toRefs } from 'vue'
import { resetShaderBgSettings, shaderBgSettings } from '../utils/shader-bg-settings'

// Leches keeps the refs we hand it, so editing the panel writes straight into shaderBgSettings
const s = toRefs(shaderBgSettings)

useControls('Motion', {
  speed: { value: s.speed, min: 0, max: 0.3, step: 0.005 },
  angle: { value: s.angle, min: -Math.PI / 2, max: Math.PI / 2, step: 0.01 },
})

useControls('Broad noise', {
  broadFreqX: { value: s.broadFreqX, label: 'freq x', min: 0.05, max: 3, step: 0.05 },
  broadFreqY: { value: s.broadFreqY, label: 'freq y', min: 0.05, max: 6, step: 0.05 },
})

useControls('Detail noise', {
  detailFreqX: { value: s.detailFreqX, label: 'freq x', min: 0.05, max: 6, step: 0.05 },
  detailFreqY: { value: s.detailFreqY, label: 'freq y', min: 0.05, max: 12, step: 0.05 },
  detailSpeed: { value: s.detailSpeed, label: 'speed ×', min: 0, max: 5, step: 0.05 },
  detailWeight: { value: s.detailWeight, label: 'weight', min: 0, max: 1, step: 0.01 },
})

useControls('Tone', {
  gain: { value: s.gain, min: 0.2, max: 5, step: 0.05 },
  shadeLow: { value: s.shadeLow, label: 'shade low', min: -2, max: 2, step: 0.01 },
  shadeHigh: { value: s.shadeHigh, label: 'shade high', min: -2, max: 2, step: 0.01 },
  curve: { value: s.curve, min: 0.25, max: 6, step: 0.05 },
  lumMin: { value: s.lumMin, label: 'lum min', min: 0, max: 1, step: 0.005 },
  lumMax: { value: s.lumMax, label: 'lum max', min: 0, max: 1, step: 0.005 },
  grain: { value: s.grain, min: 0, max: 0.3, step: 0.005 },
})

// Leches reads label/variant/onClick from the button's value object
useControls('Presets', {
  copy: {
    type: 'button',
    value: {
      label: 'Copy as JSON',
      variant: 'primary',
      size: 'block',
      onClick: () => {
        const json = JSON.stringify(shaderBgSettings, null, 2)
        navigator.clipboard?.writeText(json)
        console.info('[ShaderBg] settings\n', json)
      },
    },
  },
  reset: {
    type: 'button',
    value: {
      label: 'Reset defaults',
      variant: 'secondary',
      size: 'block',
      onClick: resetShaderBgSettings,
    },
  },
})
</script>

<template>
  <!-- The slide is CSS-transformed, which would trap a fixed panel inside it, so the panel lives on body -->
  <Teleport to="body">
    <TresLeches float />
  </Teleport>
</template>
