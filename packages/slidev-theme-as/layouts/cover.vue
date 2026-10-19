<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import Logo from '../components/Logo.vue'
import ShaderBg from '../components/ShaderBg.vue'

const { $slidev, $frontmatter } = useSlideContext()
const handle = computed(() => $slidev.themeConfigs?.socials?.[0]?.name)
</script>

<template>
  <div class="slidev-layout cover as-dark">
    <ShaderBg :controls="$frontmatter.bgControls" />
    <div class="cover-body">
      <div v-if="$frontmatter.eyebrow" class="eyebrow">
        {{ $frontmatter.eyebrow }}
      </div>
      <slot />
    </div>
    <Logo class="cover-mark" />
    <div class="cover-where meta">
      <template v-if="$frontmatter.event">
        {{ $frontmatter.event }}<br>
      </template>
      <template v-if="handle">
        @{{ handle }}
      </template>
    </div>
  </div>
</template>

<style scoped>
.cover {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 96px 112px;
  background: #171717 url('../styles/bg.png') center / cover no-repeat;
  /* ShaderBg renders its own grain, and the fallback image has grain baked in */
  --as-grain: 0;
}

.cover-body { position: relative; z-index: 2; }
.cover-body .eyebrow { margin-bottom: 18px; }

.cover :deep(h1) {
  font-size: 56px;
  line-height: 1.15;
  max-width: 14ch;
  text-wrap: balance;
  margin-bottom: 0;
}

.cover :deep(h1 + p) {
  margin-top: 20px;
  font-size: 20px;
  color: #b3b3b3;
  max-width: 40ch;
}

.cover-mark {
  position: absolute;
  left: 112px;
  bottom: 56px;
  z-index: 3;
  color: #fff;
}

.cover-where {
  position: absolute;
  right: 112px;
  bottom: 56px;
  z-index: 3;
  text-align: right;
}
</style>
