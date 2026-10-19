<script setup lang="ts">
import { onSlideEnter, onSlideLeave, useSlideContext } from '@slidev/client'
import { ref } from 'vue'

const { $frontmatter } = useSlideContext()
const video = ref<HTMLVideoElement>()

// Slidev keeps nearby slides mounted, so autoplay alone would start the clip
// before the slide is visible. Restart it each time the slide is shown.
onSlideEnter(() => {
  if (!video.value)
    return
  video.value.currentTime = 0
  video.value.play().catch(() => {})
})
onSlideLeave(() => video.value?.pause())
</script>

<template>
  <div class="slidev-layout full-video as-dark">
    <video
      ref="video"
      class="full-video-bg"
      :src="$frontmatter.video"
      :poster="$frontmatter.poster"
      :loop="$frontmatter.loop !== false"
      :muted="$frontmatter.muted !== false"
      playsinline
      preload="auto"
    />
    <div class="full-video-content">
      <slot />
    </div>
    <div
      v-if="$frontmatter.eyebrow || $frontmatter.title || $frontmatter.meta"
      class="full-video-cap"
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
.full-video {
  padding: 0;
  background: #0a0a0a;
}

.full-video-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.full-video-content {
  position: absolute;
  inset: 0;
  z-index: 2;
}

/* Same label boxes as blackboard */
.full-video-cap {
  position: absolute;
  left: 52px;
  bottom: 76px;
  z-index: 3;
  display: grid;
  gap: 4px;
  justify-items: start;
}

.full-video-cap > * {
  background: rgba(0, 0, 0, 0.8);
  padding: 5px 10px;
}

.full-video-cap h2 {
  margin: 0;
  padding: 6px 12px;
  color: #fff;
}
</style>
