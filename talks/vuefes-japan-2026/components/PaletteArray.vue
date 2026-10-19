<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { colorSets } from '../utils/vuefes-tsl/color-sets'

// The four palettes of the site, then the same twelve colors as one flat uniformArray,
// then the lookup setIndex * 3 + slot. step comes from $clicks, a click on a set picks it live.
const props = defineProps<{ step: number }>()

const COLORS = {
  bg: '#303446',
  text: '#a5adce',
  accent: '#e78284',
}

const hex = (i: number, slot: number) => {
  const set = colorSets[i]!
  return `#${[set.color1, set.color2, set.color3][slot]!.getHexString().toUpperCase()}`
}

const cells = colorSets.flatMap((_, i) => [0, 1, 2].map(slot => ({ set: i, slot, hex: hex(i, slot) })))

const setIndex = ref(2)
watch(() => props.step, () => {
  setIndex.value = 2
})

const lookup = computed(() => props.step >= 2)
const base = computed(() => setIndex.value * 3)
</script>

<template>
  <div class="rounded-lg p-4 flex flex-col gap-3 font-mono text-xs" :style="{ background: COLORS.bg, color: COLORS.text }">
    <div class="flex flex-col gap-2">
      <button
        v-for="(set, i) in colorSets"
        :key="i"
        type="button"
        class="flex items-center gap-3 rounded px-2 py-1 text-left transition-opacity"
        :class="lookup && i !== setIndex ? 'opacity-30' : ''"
        :style="lookup && i === setIndex ? { boxShadow: `0 0 0 1px ${COLORS.accent}` } : {}"
        @click="setIndex = i"
      >
        <span class="w-10 shrink-0">set {{ i }}</span>
        <span v-for="slot in 3" :key="slot" class="flex flex-col items-center gap-0.5">
          <span class="w-12 h-6 rounded-sm" :style="{ backgroundColor: hex(i, slot - 1) }" />
          <span class="text-[9px] opacity-70">{{ hex(i, slot - 1) }}</span>
        </span>
        <span class="flex flex-col items-center gap-0.5 ml-2">
          <span class="w-12 h-6 rounded-sm ring-1 ring-white/20" :style="{ backgroundColor: set.bg }" />
          <span class="text-[9px] opacity-70">bg</span>
        </span>
      </button>
    </div>

    <div class="transition-opacity duration-500" :class="step >= 1 ? 'opacity-100' : 'opacity-0'">
      <div class="mb-1">colorArray, 12 colors</div>
      <div class="grid grid-cols-12 gap-0.5">
        <div v-for="(cell, i) in cells" :key="i" class="flex flex-col items-center gap-0.5">
          <span
            class="w-full h-6 rounded-sm transition-shadow"
            :style="{
              backgroundColor: cell.hex,
              boxShadow: lookup && cell.set === setIndex ? `0 0 0 2px ${COLORS.accent}` : 'none',
            }"
          />
          <span :class="lookup && cell.set === setIndex ? 'text-white' : 'opacity-60'">{{ i }}</span>
        </div>
      </div>
    </div>

    <div class="transition-opacity duration-500" :class="lookup ? 'opacity-100' : 'opacity-0'">
      base = {{ setIndex }} × 3 = {{ base }} →
      <span :style="{ color: COLORS.accent }">{{ base }}, {{ base + 1 }}, {{ base + 2 }}</span>
    </div>
  </div>
</template>
