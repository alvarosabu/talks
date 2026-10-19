<script setup lang="ts">
import { computed } from 'vue'
import { useDarkMode } from '@slidev/client'
import { TresCanvas } from '@tresjs/core'
import { EffectComposerPmndrs, NoisePmndrs } from '@tresjs/post-processing'
import { BlendFunction } from 'postprocessing'

const { isDark } = useDarkMode()
const clearColor = computed(() => isDark.value ? '#111111' : '#EBEBEB')
</script>

<template>
  <div class="absolute inset-0 opacity-80 -z-1">
    <TresCanvas :clear-color="clearColor">
      <EffectComposerPmndrs>
        <NoisePmndrs premultiply :blend-function="BlendFunction.SCREEN" />
      </EffectComposerPmndrs>
    </TresCanvas>
  </div>
</template>