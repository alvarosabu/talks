<script setup lang="ts">
withDefaults(defineProps<{ size?: number, strokeWidth?: number }>(), {
  size: 34,
  strokeWidth: 2.4,
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 34 34"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M4 12 L17 4 L30 12 L17 20 Z" />
    <path d="M4 22 L17 14 L30 22 L17 30 Z" opacity=".55" />
  </svg>
</template>
