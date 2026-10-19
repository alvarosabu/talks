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
  <div class="slidev-layout presenter">
    <div class="presenter-body">
      <slot />
    </div>
    <div class="presenter-image" :style="style" />
  </div>
</template>

<style scoped>
.presenter {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 0;
}

.presenter-body {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 48px 80px 96px;
}

.presenter-image { width: 100%; height: 100%; }
</style>
