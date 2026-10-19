<script setup lang="ts">
import { Billboard, Html, useTexture } from '@tresjs/cientos'
import { useLoop } from '@tresjs/core'
import gsap from 'gsap'
import type { Group, Vector3 } from 'three'
import { AdditiveBlending, SRGBColorSpace } from 'three'
import { onBeforeUnmount, reactive, shallowRef, watch } from 'vue'
import type { Credit } from '../utils/credits'

const props = defineProps<{
  credit: Credit
  // The cursor on the z = 0 plane, or null when it is outside the canvas
  pointer: Vector3 | null
  active: boolean
  delay: number
}>()

const emit = defineEmits<{ hover: [hovered: boolean] }>()

const { state: texture } = useTexture(props.credit.image)
watch(texture, (tex) => {
  if (tex) tex.colorSpace = SRGBColorSpace
}, { immediate: true })

const PUSH_RADIUS = 2.2
// Big bubbles are heavier and move less, so their wide labels do not run into their neighbours
const pushStrength = 0.45 / props.credit.radius
// Different per bubble, so they do not bob in step
const phase = Math.random() * Math.PI * 2
const [baseX, baseY, baseZ] = props.credit.position

const floatGroup = shallowRef<Group>()
const wobbleGroup = shallowRef<Group>()
const push = { x: 0, y: 0 }

const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed, delta }) => {
  const group = floatGroup.value
  if (!group) return

  let targetX = 0
  let targetY = 0
  if (props.pointer) {
    const dx = baseX - props.pointer.x
    const dy = baseY - props.pointer.y
    const distance = Math.hypot(dx, dy)
    if (distance > 0.0001 && distance < PUSH_RADIUS) {
      // Squared falloff, so the push fades out softly at the edge instead of stopping at a hard circle
      const strength = (1 - distance / PUSH_RADIUS) ** 2 * pushStrength
      targetX = (dx / distance) * strength
      targetY = (dy / distance) * strength
    }
  }
  // Frame-rate independent damping, so the bubble eases back the same on a 60 Hz and a 120 Hz screen
  const ease = 1 - Math.exp(-delta * 5)
  push.x += (targetX - push.x) * ease
  push.y += (targetY - push.y) * ease

  group.position.set(
    baseX + push.x + Math.cos(elapsed * 0.4 + phase) * 0.08,
    baseY + push.y + Math.sin(elapsed * 0.6 + phase) * 0.12 + intro.rise,
    baseZ,
  )
})

// Slidev mounts neighbouring slides ahead of time, so the intro starts on slide enter, not on mount
const HIDDEN_SCALE = 0.001
const intro = reactive({ rise: -3, scale: HIDDEN_SCALE })
let introTween: gsap.core.Tween | undefined
watch(() => props.active, (active) => {
  introTween?.kill()
  intro.rise = -3
  intro.scale = HIDDEN_SCALE
  if (!active) return
  introTween = gsap.to(intro, {
    rise: 0,
    scale: 1,
    duration: 1.6,
    delay: props.delay,
    ease: 'elastic.out(1, 0.7)',
  })
}, { immediate: true })

let wobble: gsap.core.Timeline | undefined
function pop() {
  const group = wobbleGroup.value
  if (!group) return
  wobble?.kill()
  wobble = gsap.timeline()
    .to(group.scale, { x: 1.18, y: 0.84, z: 1.18, duration: 0.12, ease: 'power2.out' })
    .to(group.scale, { x: 1, y: 1, z: 1, duration: 1.1, ease: 'elastic.out(1.2, 0.25)' })
}

onBeforeUnmount(() => {
  introTween?.kill()
  wobble?.kill()
})
</script>

<template>
  <TresGroup ref="floatGroup" :position="credit.position">
    <TresGroup :scale="intro.scale">
      <!-- Handlers on the group, so a hit on the avatar counts as a hit on the bubble -->
      <TresGroup
        ref="wobbleGroup"
        @click="pop"
        @pointerenter="emit('hover', true)"
        @pointerleave="emit('hover', false)"
      >
        <TresMesh>
          <TresSphereGeometry :args="[credit.radius, 64, 32]" />
          <!-- A soap film: a black base with additive blending adds only the reflections on top of the avatar.
               Transmission looked like gray glass, because it refracts the empty, transparent canvas.
               This needs an opaque canvas, see the clear color in CreditsScene. -->
          <TresMeshPhysicalMaterial
            color="#000000"
            :roughness="0"
            :metalness="0"
            :iridescence="1"
            :iridescence-i-o-r="1.3"
            :iridescence-thickness-range="[100, 800]"
            :env-map-intensity="4"
            transparent
            :depth-write="false"
            :blending="AdditiveBlending"
          />
        </TresMesh>
        <Billboard>
          <TresMesh v-if="texture">
            <TresCircleGeometry :args="[credit.radius * 0.6, 64]" />
            <TresMeshBasicMaterial :map="texture" :tone-mapped="false" />
          </TresMesh>
        </Billboard>
      </TresGroup>
    </TresGroup>
    <Html center :position="[0, -credit.radius - 0.32, 0]">
      <div class="credit-label" :class="{ 'is-org': credit.role }" :style="{ opacity: Math.min(intro.scale, 1) }">
        <span class="name">{{ credit.label }}</span>
        <span v-if="credit.role" class="role">{{ credit.role }}</span>
      </div>
    </Html>
  </TresGroup>
</template>

<style scoped>
.credit-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
  color: var(--as-strong);
  font-family: var(--slidev-code-font-family);
  font-size: 13px;
  line-height: 1.3;
}

.credit-label.is-org .name {
  font-family: var(--slidev-theme-font-display);
  font-size: 18px;
}

.credit-label .role {
  color: var(--as-muted);
  font-size: 12px;
}
</style>
