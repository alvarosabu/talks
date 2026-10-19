<script setup lang="ts">
import NoisyBg from '../components/NoisyBg.vue'
</script>

<template>
  <div class="slidev-layout cover">
    <div class="my-auto w-full z-10">
      <slot />
    </div>
    <NoisyBg />
  </div>
</template>
