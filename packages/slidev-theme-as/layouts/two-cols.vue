<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'

const { $frontmatter } = useSlideContext()

// `cols` takes any grid-template-columns value, e.g. "1fr 1.15fr".
// `valign`, not `align`: Slidev passes frontmatter through as attrs, and `align` is a real HTML attribute that centers text
const grid = computed(() => ({
  gridTemplateColumns: $frontmatter.cols ?? '1fr 1fr',
  alignItems: $frontmatter.valign ?? 'start',
}))
</script>

<template>
  <div class="slidev-layout two-cols">
    <h2 v-if="$frontmatter.title">
      {{ $frontmatter.title }}
    </h2>
    <div class="cols" :style="grid">
      <div class="col">
        <slot />
      </div>
      <div class="col">
        <slot name="right" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.cols {
  position: relative;
  z-index: 2;
  display: grid;
  gap: 40px;
}

.col { min-width: 0; }
</style>
