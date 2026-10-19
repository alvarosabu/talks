<script setup lang="ts">
import { useSlideChrome } from '../utils/chrome'

const { hidden } = useSlideChrome()
</script>

<template>
  <div class="transition-opacity duration-500" :class="{ 'opacity-0': hidden }">
    <slot />
  </div>
</template>
