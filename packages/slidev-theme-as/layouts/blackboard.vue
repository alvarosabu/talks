<script setup lang="ts">
import { useSlideContext } from '@slidev/client'

const { $frontmatter } = useSlideContext()
</script>

<template>
  <div class="slidev-layout blackboard as-dark">
    <div class="blackboard-canvas">
      <slot />
    </div>
    <div
      v-if="$frontmatter.eyebrow || $frontmatter.title || $frontmatter.meta"
      class="blackboard-cap"
    >
      <div v-if="$frontmatter.eyebrow" class="eyebrow">
        {{ $frontmatter.eyebrow }}
      </div>
      <h2 v-if="$frontmatter.title">
        {{ $frontmatter.title }}
      </h2>
      <span v-if="$frontmatter.meta" class="meta">{{ $frontmatter.meta }}</span>
    </div>
  </div>
</template>

<style scoped>
/* The scene is the slide: no padding, no frame */
.blackboard {
  padding: 0;
  background: #0a0a0a;
}

.blackboard-canvas {
  position: absolute;
  inset: 0;
}

/* Per-line label boxes, same as the YouTube thumbnails */
.blackboard-cap {
  position: absolute;
  left: 52px;
  bottom: 76px;
  z-index: 3;
  display: grid;
  gap: 4px;
  justify-items: start;
}

.blackboard-cap > * {
  background: rgba(0, 0, 0, 0.8);
  padding: 5px 10px;
}

.blackboard-cap h2 {
  margin: 0;
  padding: 6px 12px;
  color: #fff;
}
</style>
