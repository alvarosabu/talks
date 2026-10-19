<script setup lang="ts">
import { ContactShadows, Html, OrbitControls, useGLTF } from '@tresjs/cientos'
import { TresCanvas } from '@tresjs/core'
import { useIsSlideActive, useSlideContext } from '@slidev/client'
import { useDevicePixelRatio } from '@vueuse/core'
import gsap from 'gsap'
import { useSlideChrome } from 'slidev-theme-as/utils/chrome'
import type { Group, PerspectiveCamera } from 'three'
import { Vector3 } from 'three'
import { computed, onBeforeUnmount, onMounted, reactive, ref, shallowRef, watch } from 'vue'

const props = defineProps<{
  // Skips the live site and shows the screenshot. For a slow network that still passes the probe.
  fallback?: boolean
}>()

const SITE_URL = 'https://vuefes.jp/2025/en'
const PROBE_TIMEOUT_MS = 4000

// A cross-origin iframe cannot report a failure: Chrome fires load on its own offline page too.
// A no-cors fetch can, because it rejects only when the host does not answer.
const siteReachable = ref(false)
onMounted(async () => {
  if (props.fallback) { return }
  try {
    await fetch(SITE_URL, { mode: 'no-cors', cache: 'no-store', signal: AbortSignal.timeout(PROBE_TIMEOUT_MS) })
    siteReachable.value = true
  }
  catch {}
})
const showSite = computed(() => !props.fallback && siteReachable.value)

const { state: model, nodes } = useGLTF('/models/mac-draco.glb', { draco: true })

// Slidev lays the slide out at canvasWidth and upscales it with a CSS transform,
// so the renderer must draw that many extra pixels or the canvas gets stretched and blurry.
// Capped at 3 to keep the GPU cost sane on big 4K projectors.
const { $scale } = useSlideContext()
const { pixelRatio } = useDevicePixelRatio()
const dpr = computed(() => Math.min(pixelRatio.value * $scale.value, 3))

// Hinge angles from the pmndrs floating-laptop example, which uses this same model
const CLOSED = 1.575
const OPEN = -0.425
const START_POSITION = new Vector3(-11, 7, 19.5)
const START_TARGET = new Vector3(0, 0.5, 2.5)
// Far enough that the 5.4 unit tall display fills about 80% of the 40° vertical fov
const ZOOM_DISTANCE = 9.5

const Step = { Closed: 0, LidOpen: 1, Zoomed: 2 } as const
type Step = typeof Step[keyof typeof Step]

const lid = reactive({ hinge: CLOSED })
const step = ref<Step>(Step.Closed)
const isOpen = computed(() => step.value !== Step.Closed)
const isAnimating = ref(false)
// The iframe stays mounted so the site loads before the lid opens, and is only hidden
// while closed. A CSS3D element shows its back face, so it would poke through the lid.
const showScreen = computed(() => lid.hinge < 1)

// The pivot sits under the middle of the closed laptop, so it grows in place instead of from the hinge
const INTRO_PIVOT = new Vector3(0, -0.2, 3)
// Not 0: a zero scale gives a matrix that cannot be inverted, which the Html occlusion raycast needs
const HIDDEN_SCALE = 0.001
const intro = reactive({ scale: HIDDEN_SCALE })

// Slidev mounts neighbouring slides ahead of time, so anything started on mount would play before
// the audience sees the slide. Start the intro on slide enter and reset on leave so it replays.
const isSlideActive = useIsSlideActive()
const showCallout = ref(false)
let introTween: gsap.core.Tween | undefined
let calloutTimer: ReturnType<typeof setTimeout> | undefined
watch(isSlideActive, (active) => {
  introTween?.kill()
  clearTimeout(calloutTimer)
  showCallout.value = false
  // Coming back to an open laptop keeps it as it is
  if (isOpen.value) { return }
  intro.scale = HIDDEN_SCALE
  if (!active) { return }
  isAnimating.value = true
  introTween = gsap.to(intro, {
    scale: 1,
    duration: 1.2,
    delay: 0.2,
    // Amplitude 1 and period 0.6 give one or two small bounces, not a long wobble
    ease: 'elastic.out(1, 0.6)',
    onComplete: () => { isAnimating.value = false },
  })
  calloutTimer = setTimeout(() => { showCallout.value = true }, 1200)
}, { immediate: true })
onBeforeUnmount(() => {
  introTween?.kill()
  clearTimeout(calloutTimer)
})

// Fade the title and footer only once the zoom has landed, and bring them back as soon as it leaves
const { setHidden } = useSlideChrome()
watch(() => step.value === Step.Zoomed && !isAnimating.value, setHidden)
onBeforeUnmount(() => setHidden(false))

const cameraRef = shallowRef<PerspectiveCamera>()
const controlsRef = shallowRef<{ instance: any }>()
const screenAnchor = shallowRef<Group>()

watch(() => [nodes.value.screenflip, lid.hinge] as const, ([screenflip, hinge]) => {
  if (screenflip) { screenflip.rotation.x = hinge }
}, { immediate: true })

function zoomTargets() {
  const anchor = screenAnchor.value!
  anchor.updateWorldMatrix(true, false)
  const center = anchor.getWorldPosition(new Vector3())
  // The Html faces its local +Z, so the camera sits along that axis in front of the display
  const normal = anchor.getWorldDirection(new Vector3())
  return { center, position: center.clone().addScaledVector(normal, ZOOM_DISTANCE) }
}

function moveCamera(position: Vector3, target: Vector3) {
  const controls = controlsRef.value!.instance
  // OrbitControls owns the camera orientation, so tween its target too and let update() aim the camera
  return gsap.timeline({ defaults: { duration: 1.6, ease: 'power3.inOut' } })
    .to(cameraRef.value!.position, { x: position.x, y: position.y, z: position.z, onUpdate: () => controls.update() })
    .to(controls.target, { x: target.x, y: target.y, z: target.z }, '<')
}

function transition(from: Step, to: Step) {
  if (from === Step.Closed) { return gsap.to(lid, { hinge: OPEN, duration: 1.2, ease: 'power2.out' }) }
  if (to === Step.Closed) { return gsap.to(lid, { hinge: CLOSED, duration: 1, ease: 'power2.in' }) }
  if (to === Step.Zoomed) {
    // The display position depends on the open lid, so it is read only once the lid is open
    const { center, position } = zoomTargets()
    return moveCamera(position, center)
  }
  return moveCamera(START_POSITION, START_TARGET)
}

// Walks one step at a time so a jump (a click from closed to zoomed) plays every transition in between
async function goTo(target: Step) {
  if (isAnimating.value || !cameraRef.value || !controlsRef.value || target === step.value) { return }
  isAnimating.value = true
  try {
    while (step.value !== target) {
      const from = step.value
      const next = (from + Math.sign(target - from)) as Step
      // Going forward, the state changes first so the callout hides and rotation locks at once.
      // Going back, it changes after, so the callout only returns once the lid has closed.
      if (next > from) { step.value = next }
      await transition(from, next)
      step.value = next
    }
  }
  finally {
    isAnimating.value = false
  }
}

function toggle() {
  goTo(step.value === Step.Zoomed ? Step.Closed : Step.Zoomed)
}

// A trackpad sends a burst of wheel events plus momentum, so one gesture must move one step only.
// The wheel unlocks after it has been quiet for WHEEL_QUIET_MS, not when the animation ends.
const WHEEL_THRESHOLD = 40
const WHEEL_QUIET_MS = 250
let wheelDelta = 0
let wheelLocked = false
let wheelQuietTimer: ReturnType<typeof setTimeout> | undefined

function onWheel(event: WheelEvent) {
  clearTimeout(wheelQuietTimer)
  wheelQuietTimer = setTimeout(() => {
    wheelLocked = false
    wheelDelta = 0
  }, WHEEL_QUIET_MS)
  if (wheelLocked || isAnimating.value) { return }

  wheelDelta += event.deltaY
  if (Math.abs(wheelDelta) < WHEEL_THRESHOLD) { return }
  const direction = Math.sign(wheelDelta)
  wheelDelta = 0
  const next = step.value + direction
  if (next < Step.Closed || next > Step.Zoomed) { return }
  wheelLocked = true
  goTo(next as Step)
}
onBeforeUnmount(() => clearTimeout(wheelQuietTimer))
</script>

<template>
  <!-- The listener sits on the canvas wrapper, so the wheel steps only while the pointer is over the scene.
       Over the iframe the site gets the wheel instead, because events inside a cross-origin iframe do not bubble out. -->
  <div class="size-full" @wheel.passive="onWheel">
    <TresCanvas :clear-alpha="0" :dpr="dpr" shadows>
      <TresPerspectiveCamera ref="cameraRef" :position="START_POSITION.toArray()" :fov="40" />
      <OrbitControls
        ref="controlsRef"
        :target="START_TARGET.toArray()"
        :enable-zoom="false"
        :enable-rotate="!isOpen"
      />
      <template v-if="model">
        <TresGroup :position="INTRO_PIVOT.toArray()" :scale="intro.scale">
          <TresGroup :position="INTRO_PIVOT.clone().negate().toArray()">
            <primitive :object="model.scene" @click="toggle" />
            <!--
              A primitive would re-parent the lid node out of the scene, so these groups copy
              the lid transforms (screenflip > screen) to put the Html on the display surface.
            -->
            <TresGroup :position="nodes.screenflip.position" :rotation-x="lid.hinge">
              <TresGroup :position="nodes.screen.position" :quaternion="nodes.screen.quaternion">
                <!-- Offsets from the pmndrs "mixing-html-and-webgl" example, which uses this same model -->
                <TresGroup ref="screenAnchor" :rotation-x="-Math.PI / 2" :position="[0, 0.05, -0.09]">
                  <!--
                    distance-factor 2.5 maps 160 CSS px to one world unit, so the 1336px iframe fills
                    the 8.35 unit wide display at its native size. Scaling a small iframe up looks pixelated.
                  -->
                  <Html transform occlude :distance-factor="2.5">
                    <!-- opacity, not visibility: Chrome throttles cross-origin iframes it considers hidden -->
                    <div
                      class="relative w-[1336px] h-[864px] overflow-hidden rounded-[12px] bg-white transition-opacity duration-500"
                      :class="showScreen ? 'opacity-100' : 'opacity-0 pointer-events-none'"
                    >
                      <!-- Under the iframe, so it also covers the time the site takes to paint -->
                      <img class="absolute inset-0 size-full" src="/vuefes-2025-fallback.webp" alt="" draggable="false">
                      <iframe
                        v-if="showSite"
                        class="absolute inset-0 size-full"
                        :src="SITE_URL"
                        frameborder="0"
                      ></iframe>
                    </div>
                  </Html>
                </TresGroup>
              </TresGroup>
            </TresGroup>
          </TresGroup>
        </TresGroup>

        <Html v-if="!isOpen" :position="[2.2, 0.3, 1.2]">
          <div class="callout" :class="{ 'is-visible': showCallout }">
            <svg class="callout-line" width="140" height="90" viewBox="0 0 140 90">
              <circle cx="4" cy="86" r="4" />
              <line x1="4" y1="86" x2="136" y2="4" />
            </svg>
            <button class="callout-label" @click="toggle">
              Click to open
            </button>
          </div>
        </Html>
      </template>
      <ContactShadows :position-y="-0.25" :blur="3.5" :resolution="512" :opacity="0.8" />
      <TresAmbientLight :intensity="1" />
      <TresDirectionalLight :intensity="2" :position="[2, 6, 4]" cast-shadow />
    </TresCanvas>
  </div>
</template>

<style scoped>
/* Zero-size box at the projected point, so the dot of the line lands on the laptop */
.callout {
  position: relative;
  width: 0;
  height: 0;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.6s ease, transform 0.6s ease;
  pointer-events: none;
}

.callout.is-visible {
  opacity: 1;
  transform: none;
  pointer-events: auto;
}

.callout-line {
  position: absolute;
  left: -4px;
  bottom: -4px;
  overflow: visible;
  pointer-events: none;
}

.callout-line circle { fill: var(--as-strong); }
.callout-line line { stroke: var(--as-muted); stroke-width: 1; }

.callout-label {
  position: absolute;
  left: 136px;
  bottom: 86px;
  transform: translateY(50%);
  white-space: nowrap;
  padding: 6px 12px;
  border: 1px solid var(--as-border);
  border-radius: 999px;
  background: var(--as-bg);
  color: var(--as-strong);
  font-family: var(--slidev-code-font-family);
  font-size: 13px;
  cursor: pointer;
}

.callout-label:hover { border-color: var(--as-muted); }
</style>
