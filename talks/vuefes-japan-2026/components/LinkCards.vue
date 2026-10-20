<script setup lang="ts">
import { renderSVG } from 'uqr'
import { computed } from 'vue'

export interface LinkCard {
  title: string
  url: string
}

const props = defineProps<{ links: LinkCard[] }>()

const cards = computed(() => props.links.map(link => ({
  ...link,
  // Split before each dot, so a long host breaks at a dot and not at a hyphen
  labelParts: link.url.replace(/^https?:\/\//, '').replace(/\/$/, '').split(/(?=\.)/),
  // Dark modules on a light ground: some phone cameras fail to read inverted QR codes
  qr: renderSVG(link.url, { border: 2, whiteColor: '#ffffff', blackColor: '#171717' }),
})))
</script>

<template>
  <div class="link-cards">
    <a
      v-for="card in cards"
      :key="card.url"
      class="link-card"
      :href="card.url"
      target="_blank"
      rel="noopener"
    >
      <div class="qr" v-html="card.qr" />
      <span class="title">{{ card.title }}</span>
      <span class="url">
        <template v-for="(part, i) in card.labelParts" :key="i"><wbr v-if="i"><span class="url-part">{{ part }}</span></template>
      </span>
    </a>
  </div>
</template>

<style scoped>
.link-cards {
  display: grid;
  gap: 24px;
  margin-top: 24px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.link-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px;
  border: 1px solid var(--as-border);
  border-radius: 12px;
  background: var(--as-inline-bg);
  color: var(--as-text);
  text-decoration: none;
}

.qr {
  width: 100%;
  max-width: 170px;
  margin-bottom: 10px;
  border-radius: 8px;
  overflow: hidden;
}

.qr :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
}

.title {
  color: var(--as-strong);
  font-family: var(--slidev-theme-font-display);
  font-size: 24px;
  line-height: 1.2;
}

.url {
  color: var(--as-muted);
  font-family: var(--slidev-code-font-family);
  font-size: 13px;
  text-align: center;
}

.url-part {
  white-space: nowrap;
}
</style>
