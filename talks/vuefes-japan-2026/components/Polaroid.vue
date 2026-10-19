<script setup lang="ts">
import { useLoop } from '@tresjs/core'
import gsap from 'gsap'
import type { Group, Texture } from 'three'
import { CanvasTexture, SRGBColorSpace, TextureLoader } from 'three'
import { onBeforeUnmount, reactive, shallowRef, watch } from 'vue'

export interface Pose {
  x: number
  y: number
  z: number
  rotX: number
  rotY: number
  rotZ: number
}

const props = defineProps<{
  // Without a src the card shows a labelled placeholder, so the scene works before the photos exist
  src?: string
  orientation: 'landscape' | 'portrait'
  label: string
  rest: Pose
  visible: boolean
}>()

// Instax proportions: thin border on three sides, the thick strip at the bottom
const SIDE = 0.1
const BOTTOM = 0.42
const DEPTH = 0.012
const PHOTO = props.orientation === 'landscape' ? { w: 2.2, h: 1.5 } : { w: 1.5, h: 1.95 }
const frame = { w: PHOTO.w + SIDE * 2, h: PHOTO.h + SIDE + BOTTOM }
const photoY = frame.h / 2 - SIDE - PHOTO.h / 2

function placeholderTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = Math.round(512 * PHOTO.h / PHOTO.w)
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, '#3a3f58')
  gradient.addColorStop(1, '#8c5a6b')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#f4f1ea'
  ctx.font = '600 36px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(props.label, canvas.width / 2, canvas.height / 2)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

// Crops the photo like object-fit: cover, so a 3:2 or 16:9 file still fills the window without stretching
function cover(texture: Texture) {
  const image = texture.image as { width: number, height: number }
  const imageAspect = image.width / image.height
  const windowAspect = PHOTO.w / PHOTO.h
  if (imageAspect > windowAspect) {
    texture.repeat.set(windowAspect / imageAspect, 1)
  }
  else {
    texture.repeat.set(1, imageAspect / windowAspect)
  }
  texture.offset.set((1 - texture.repeat.x) / 2, (1 - texture.repeat.y) / 2)
}

const texture = shallowRef<Texture>(placeholderTexture())
watch(() => props.src, (src) => {
  if (!src) return
  new TextureLoader().load(src, (loaded) => {
    loaded.colorSpace = SRGBColorSpace
    loaded.anisotropy = 8
    cover(loaded)
    texture.value.dispose()
    texture.value = loaded
  })
}, { immediate: true })
onBeforeUnmount(() => texture.value.dispose())

// Tossed in from below the right edge of the slide, still turning, then it lands flat on the pile
const hidden: Pose = {
  x: props.rest.x + 3.5,
  y: props.rest.y - 4.5,
  z: 2.5,
  rotX: -0.5,
  rotY: 0.4,
  rotZ: props.rest.rotZ - 0.9,
}

const pose = reactive<Pose>({ ...hidden })
let tween: gsap.core.Animation | undefined
watch(() => props.visible, (visible, previous) => {
  tween?.kill()
  // Slidev can mount the slide already at its last click (going back), so the first pose is set without a tween
  if (previous === undefined) {
    Object.assign(pose, visible ? props.rest : hidden)
    return
  }
  const { x, y, z, rotX, rotY, rotZ } = visible ? props.rest : hidden
  tween = visible
    ? gsap.timeline()
        .to(pose, { x, y, z, duration: 1.1, ease: 'power3.out' })
        // The overshoot on the rotation only is what reads as the card settling, not bouncing
        .to(pose, { rotX, rotY, rotZ, duration: 1.3, ease: 'back.out(1.6)' }, '<')
    : gsap.to(pose, { x, y, z, rotX, rotY, rotZ, duration: 0.6, ease: 'power2.in' })
}, { immediate: true })
onBeforeUnmount(() => tween?.kill())

// A small idle sway so the pile does not look like a still image. Different per card, so they do not move in step.
const sway = shallowRef<Group>()
const phase = Math.random() * Math.PI * 2
const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed }) => {
  if (!sway.value) return
  sway.value.rotation.z = Math.sin(elapsed * 0.6 + phase) * 0.012
  sway.value.position.y = Math.sin(elapsed * 0.8 + phase) * 0.015
})
</script>

<template>
  <TresGroup :position="[pose.x, pose.y, pose.z]" :rotation="[pose.rotX, pose.rotY, pose.rotZ]">
    <TresGroup ref="sway">
      <TresMesh cast-shadow receive-shadow>
        <TresBoxGeometry :args="[frame.w, frame.h, DEPTH]" />
        <TresMeshStandardMaterial color="#f4f1ea" :roughness="0.85" />
      </TresMesh>
      <!-- Just in front of the paper, so it does not z-fight with the box face -->
      <TresMesh :position="[0, photoY, DEPTH / 2 + 0.001]" receive-shadow>
        <TresPlaneGeometry :args="[PHOTO.w, PHOTO.h]" />
        <!-- Clearcoat gives the glossy print a highlight that the matte paper border does not have.
             The emissive copy of the photo lifts it back to the brightness of the file, and the shadows still darken it. -->
        <TresMeshPhysicalMaterial
          :map="texture"
          :emissive-map="texture"
          emissive="#ffffff"
          :emissive-intensity="0.35"
          :roughness="0.5"
          :clearcoat="0.6"
          :clearcoat-roughness="0.3"
        />
      </TresMesh>
    </TresGroup>
  </TresGroup>
</template>
