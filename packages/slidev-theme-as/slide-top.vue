<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import Logo from './components/Logo.vue'
import { useSlideChrome } from './utils/chrome'

const { $slidev, $page, $nav, $frontmatter } = useSlideContext()

// Same fallback Slidev uses: slide 1 without a layout renders as cover
const layout = computed(() => $frontmatter.layout || ($page.value === 1 ? 'cover' : 'default'))

// The cover carries its own handle, so the footer would repeat it
const visible = computed(() => $frontmatter.footer !== false && layout.value !== 'cover')
const boxed = computed(() => layout.value === 'blackboard')
const handle = computed(() => $slidev.themeConfigs?.socials?.[0]?.name)
const { hidden } = useSlideChrome()
const pad = (n: number) => String(n).padStart(2, '0')
</script>

<template>
  <footer
    v-if="visible"
    class="as-foot"
    :class="{ boxed, hidden }"
  >
    <span class="as-foot-handle">
      <template v-if="handle">
        <Logo :size="14" :stroke-width="3" />@{{ handle }}
      </template>
    </span>
    <span class="as-foot-num">{{ pad($page) }} / {{ pad($nav.total) }}</span>
  </footer>
</template>

<style scoped>
.as-foot {
  position: absolute;
  left: 52px;
  right: 52px;
  bottom: 40px;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-family: var(--slidev-code-font-family);
  font-size: 12px;
  line-height: 1.6;
  color: var(--as-muted);
  pointer-events: none;
  transition: opacity 0.5s ease;
}

.as-foot.hidden { opacity: 0; }

.as-foot-handle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.as-foot-num { font-variant-numeric: tabular-nums; }

/* Label boxes keep the footer readable over a full-bleed scene */
.as-foot.boxed { color: #9a9a9a; }
.as-foot.boxed > * {
  background: rgba(0, 0, 0, 0.8);
  padding: 4px 8px;
}
.as-foot.boxed > :empty { display: none; }
</style>
