<script setup lang="ts">
import { computed } from 'vue'

// Slidev strips `title` from frontmatter props, so fall back to the full frontmatter object
const props = defineProps<{ title?: string, frontmatter?: Record<string, any> }>()

const heading = computed(() => props.title ?? props.frontmatter?.title)
</script>

<template>
  <div class="slidev-layout blackboard noise noise-subtle">
    <header
      v-if="heading"
      class="blackboard-title"
    >
      {{ heading }}
    </header>
    <div class="blackboard-canvas">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.blackboard {
  background: var(--slidev-code-background);
  color: var(--slidev-code-foreground);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.blackboard-title {
  text-align: center;
  font-size: 1.75rem;
  line-height: 1.2;
  letter-spacing: 0.02em;
  opacity: 0.9;
  flex-shrink: 0;
}

.blackboard-canvas {
  flex: 1;
  min-height: 0;
}
</style>
