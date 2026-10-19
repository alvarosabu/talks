<script setup lang="ts">
import { OrbitControls, useTexture } from '@tresjs/cientos'
import { useLoop, useTres } from '@tresjs/core'
import type { OrthographicCamera } from 'three'
import { RepeatWrapping } from 'three'
import { uniform } from 'three/tsl'
import type { MeshBasicNodeMaterial } from 'three/webgpu'
import { computed, onUnmounted, shallowRef, watch } from 'vue'
import { COLOR_CYCLE_SECONDS, colorSets } from '../utils/vuefes-tsl/color-sets'
import { createConeMaterial, createSphereMaterial } from '../utils/vuefes-tsl/materials'

const props = withDefaults(defineProps<{ paletteOffset?: number }>(), { paletteOffset: 0 })

const emit = defineEmits<{ palette: [index: number] }>()

// World units visible vertically. The original uses a 1:1 pixel frustum, but
// fitting a fixed world height keeps the shapes the same size at any canvas size.
const WORLD_HEIGHT = 680
// Moves both shapes up and right, clear of the blackboard caption in the bottom-left corner
const GROUP_OFFSET: [number, number, number] = [110, 60, 0]
const SCALE = 0.95
const CONE_POSITION: [number, number, number] = [-146 * SCALE, -2 * SCALE, 0]
const SPHERE_POSITION: [number, number, number] = [172 * SCALE, 2 * SCALE, 0]

const { sizes } = useTres()
const cameraRef = shallowRef<OrthographicCamera>()

watch([sizes.width, sizes.height, cameraRef], () => {
  const cam = cameraRef.value
  if (!cam || !sizes.width.value || !sizes.height.value) return
  const aspect = sizes.width.value / sizes.height.value
  cam.top = WORLD_HEIGHT / 2
  cam.bottom = -WORLD_HEIGHT / 2
  cam.left = -WORLD_HEIGHT * aspect / 2
  cam.right = WORLD_HEIGHT * aspect / 2
  cam.updateProjectionMatrix()
}, { immediate: true })

const paletteIndex = uniform(0, 'int')

const { state: noiseTexture } = useTexture('/sumi/noise.png')
watch(noiseTexture, (tex) => {
  if (!tex) return
  tex.wrapS = RepeatWrapping
  tex.wrapT = RepeatWrapping
}, { immediate: true })

// texture() nodes capture the sampler at build time, so the materials wait for the texture.
const materials = computed(() => {
  if (!noiseTexture.value) return null
  const options = { paletteIndex, noiseTexture: noiseTexture.value }
  return {
    cone: createConeMaterial(options),
    sphere: createSphereMaterial(options),
  }
})

watch(materials, (_next, previous) => {
  previous?.cone.dispose()
  previous?.sphere.dispose()
})

onUnmounted(() => {
  materials.value?.cone.dispose()
  materials.value?.sphere.dispose()
})

let lastIndex = -1
const { onBeforeRender } = useLoop()

onBeforeRender(({ elapsed }) => {
  const idx = (Math.floor(elapsed / COLOR_CYCLE_SECONDS) + props.paletteOffset) % colorSets.length
  if (idx !== lastIndex) {
    lastIndex = idx
    paletteIndex.value = idx
    emit('palette', idx)
  }
})
</script>

<template>
  <TresOrthographicCamera
    ref="cameraRef"
    :near="0.1"
    :far="9999"
    :position="[0, 0, 1000]"
    :look-at="[0, 0, 0]"
  />

  <TresGroup :position="GROUP_OFFSET">
    <TresMesh
      v-if="materials"
      :position="CONE_POSITION"
      :scale="SCALE"
      :rotation="[Math.PI, 0, 0]"
      :material="materials.cone as MeshBasicNodeMaterial"
    >
      <TresConeGeometry :args="[192, 330, 128]" />
    </TresMesh>

    <TresMesh
      v-if="materials"
      :position="SPHERE_POSITION"
      :scale="SCALE"
      :material="materials.sphere as MeshBasicNodeMaterial"
    >
      <TresSphereGeometry :args="[165, 64, 64]" />
    </TresMesh>
  </TresGroup>

  <OrbitControls :enable-zoom="false" :enable-pan="false" />
</template>
