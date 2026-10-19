<script setup lang="ts">
  import { computed } from 'vue'
  import { handleBackground } from '../utils/layout-helper'
  
  const props = defineProps({
    image: {
      type: String,
    },
    class: {
      type: String,
    },
    backgroundSize: {
      type: String,
      default: 'cover',
    },
  })
  
  const style = computed(() => handleBackground(props.image, false, props.backgroundSize))
  </script>

<template>
  <div class="grid grid-cols-2 h-full w-full">
    <NoisyBg />
    <div class="slidev-layout default">
      <div class="my-auto">
          <slot />
      </div>
    </div>
    <div class="w-full h-full" :style="style"  />
  </div>
</template>
  