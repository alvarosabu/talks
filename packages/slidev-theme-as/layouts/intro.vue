<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import ShaderBg from '../components/ShaderBg.vue'

const { $frontmatter } = useSlideContext()
</script>

<template>
  <div class="slidev-layout intro as-dark">
    <ShaderBg :controls="$frontmatter.bgControls" />
    <div v-if="$frontmatter.section" class="ghost" aria-hidden="true">
      {{ $frontmatter.section }}
    </div>
    <div class="intro-body">
      <div v-if="$frontmatter.eyebrow" class="eyebrow">
        {{ $frontmatter.eyebrow }}
      </div>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.intro {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 128px;
  background: #171717 url('../styles/bg.png') center / cover no-repeat;
  /* ShaderBg renders its own grain, and the fallback image has grain baked in */
  --as-grain: 0;
}

.intro-body {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.intro-body :deep(h1),
.intro-body :deep(p) { margin: 0; }

.intro-body :deep(h1 + p) {
  color: var(--as-muted);
  max-width: 44ch;
}

/* Outlined number, the year motif from the blog index */
.ghost {
  position: absolute;
  left: 96px;
  top: 150px;
  z-index: 1;
  font-family: var(--slidev-theme-font-display);
  font-size: 200px;
  line-height: 1;
  letter-spacing: -0.02em;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255, 255, 255, 0.1);
  user-select: none;
}
</style>
