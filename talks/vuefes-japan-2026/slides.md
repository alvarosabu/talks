---
theme: as
title: How I recreated Vue Fes Japan 2025 website using TresJS and TSL (WebGPU)
info: |
  ## How I recreated Vue Fes Japan 2025 website using TresJS and TSL (WebGPU)
  Slides by Alvaro Saburido
author: Alvaro Saburido
colorSchema: dark
transition: slide-left
mdc: true
layout: cover
eyebrow: Talk
event: Vue Fes Japan · 2026
---

# Recreating Vue Fes Japan 2025

With TresJS and TSL (WebGPU)

---
layout: presenter
image: '/alvaro.jpg'
---

# こんにちは、アルバロサブです 👋🏻

Hi, my name is Alvarosabu

<v-clicks>

- Venezuelan 🇻🇪 living in Barcelona.
- Dad of 2 cats 🐈 🐈‍⬛
- Author of TresJS
- Working at Directus
- I enjoy traveling, photography 📸 and art.

</v-clicks>

---
layout: default
class: p-0
clicks: 6
---

<!-- The default layout wraps content in a div with no height, so the grid sets the full slide height itself -->
<div class="grid grid-cols-2 h-[540px]">
<div class="flex flex-col justify-center pl-24 pr-12 pb-20">

# 日本の思い出

Some memories from Japan

</div>
<JapanPolaroids :step="$clicks" />
</div>

<!--
[click] The lion head at Namba Yasaka shrine, in Osaka. This is one of my best photos.

[click] And the torii gates at Fushimi Inari, in Kyoto. My other favourite.

[click] In Japan I met beautiful people.

[click] I eat a lot of delicious food. Takoyaki, every time.

[click] I love Japanese culture. Here I am with No-Face, on the Ghibli train.

[click] And this one is the most important. Here in Japan, I asked my wife to marry me.
-->

---
layout: intro
section: '01'
eyebrow: The challenge
---

# The Vue Fes Japan 2025 website

What I saw, I was completely amazed by it.


---
layout: default
class: p-0
---

<!-- Absolute so the title floats over the canvas instead of pushing it down -->
<ChromeFade class="absolute top-8 left-10 z-10 pointer-events-none">
  <h1>The original site</h1>
</ChromeFade>

<!-- The default layout wraps content in a div with no height, so the canvas needs an explicit size -->
<div class="w-full h-[540px]">
  <LaptopScene />
</div>

---
layout: default
class: p-0
---

<!-- Absolute so the title floats over the canvas, the same as "The original site" -->
<ChromeFade class="absolute top-8 left-10 z-10 pointer-events-none">
  <h1>Credits for the original site</h1>
</ChromeFade>

<div class="w-full h-[540px]">
  <CreditsScene />
</div>

<!--
Before I show you anything I built, the credit goes to the people who made the original.
The art direction and design are by IE3 (ie3.jp), a creative unit of visual artists, engineers and designers.
The Vue.js Japan User Group (vuejs-jp.org) organized the event and built the site. They also translate the Vue.js docs into Japanese.
And these are the contributors. Thank you all, this talk exists because of your work.

Tip: click a bubble and it wobbles.
-->

---
layout: blackboard
eyebrow: The main visual
title: A V for Vue, a circle for the Hinomaru
meta: Suminagashi marbling in TSL · palette changes every 15s
---

<SumiScene />

---
layout: full-video
video: /suminagashi.mp4
eyebrow: Inspiration
title: Suminagashi (墨流し, "floating ink") 
meta: youtube.com/watch?v=qArb6Z-gUZc
---

<!-- Suminagashi (墨流し, "floating ink") is a traditional Japanese marbling technique.
  The ink does not mix with the water. It floats on the surface, and that is what makes the patterns.

  The artist fills a shallow tray with still water and holds two brushes.
  One brush holds sumi ink. The other holds a surfactant (traditionally pine resin),
  a substance that lowers the surface tension of the water.

  First, the artist touches the center of the water with the ink brush.
  The ink spreads out into a thin, dark circle.
  Then the artist touches the same point with the surfactant brush.
  The surfactant pushes the ink outward, so the dark circle becomes a ring
  with a clear circle inside it. Then the artist repeats the process, alternating
  the brushes, until the pattern is complete.

  To make the pattern less regular, the artist can blow gently on the surface, fan it,
  or pull a single hair or thread through it. These movements bend the rings into
  flowing lines that look like water, wood grain, or smoke.

  To finish, the artist lays a sheet of absorbent paper (usually washi) flat on the
  water. The paper picks up the floating ink in one contact. The artist lifts the
  paper, rinses it, and lets it dry. Every print is unique, because the ink pattern is
  destroyed when the paper touches it.
 -->

---
layout: intro
section: '02'
eyebrow: The stack
---

# TresJS + WebGPU

Declarative 3D in Vue, on the next graphics API

---
layout: two-cols
cols: 1fr 1.8fr
---

## What is TresJS?

<div class="flex flex-col gap-6 mt-6 leading-snug">

<div :class="$clicks === 0 ? '' : 'opacity-40'">
  <span class="opacity-50 font-mono">01</span>
  Three.js: create, add and render every object by hand
</div>

<div v-click="1">
  <span class="opacity-50 font-mono">02</span>
  TresJS: write the scene as Vue components
</div>

<div v-click="2">
  <span class="opacity-50 font-mono">03</span>
  Every Three.js class becomes a <code>Tres</code> component, props map to its properties
</div>

</div>

::right::

````md magic-move {at:1}
```ts
import * as THREE from 'three'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
camera.position.set(3, 3, 3)
camera.lookAt(0, 0, 0)

const mesh = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1, 0.3),
  new THREE.MeshNormalMaterial(),
)
scene.add(mesh)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(innerWidth, innerHeight)
document.body.append(renderer.domElement)

renderer.setAnimationLoop(() => {
  renderer.render(scene, camera)
})
```

```vue
<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
</script>

<template>
  <TresCanvas>
    <TresPerspectiveCamera
      :position="[3, 3, 3]"
      :look-at="[0, 0, 0]"
    />
    <TresMesh>
      <TresTorusKnotGeometry :args="[1, 0.3]" />
      <TresMeshNormalMaterial />
    </TresMesh>
  </TresCanvas>
</template>
```

```vue {7-14}
<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
</script>

<template>
  <TresCanvas>
    <TresPerspectiveCamera
      :position="[3, 3, 3]"
      :look-at="[0, 0, 0]"
    />
    <TresMesh>
      <TresTorusKnotGeometry :args="[1, 0.3]" />
      <TresMeshNormalMaterial />
    </TresMesh>
  </TresCanvas>
</template>
```
````

<!--
In plain Three.js, you build the scene imperatively. You create the scene, the camera and the renderer, add the mesh, size the canvas and run the render loop yourself.

[click] TresJS is a Vue custom renderer for Three.js. The same scene is a template. TresCanvas creates the scene, the renderer and the render loop for you, and it resizes the canvas.

[click] There is no wrapper per class. Tres reads the Three.js catalogue, so TresMesh is new THREE.Mesh. The args prop holds the constructor arguments, and the other props set properties on the instance. Reactivity works like in any Vue component.
-->

<style>
/* The imperative version is long on purpose, it must fit without a scrollbar */
.slidev-layout {
  --slidev-code-font-size: 11px;
  --slidev-code-line-height: 1.5;
}
</style>

---
layout: two-cols
cols: 1fr 1.8fr
---

## Why WebGPU + TSL?

<div class="flex flex-col gap-6 mt-6 leading-snug">

<div :class="$clicks === 0 ? '' : 'opacity-40'">
  <span class="opacity-50 font-mono">01</span>
  WebGL: patch the material's GLSL as strings
</div>

<div v-click="1">
  <span class="opacity-50 font-mono">02</span>
  WebGPU: give the material a TSL node
</div>

</div>

<div class="h-52 mt-4">
  <WaveSphere />
</div>

::right::

````md magic-move {at:1}
```ts
import { MeshStandardMaterial } from 'three'

const uTime = { value: 0 }
const material = new MeshStandardMaterial()
material.defines = { USE_UV: '' }

material.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = uTime
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', `#include <common>
      uniform float uTime;`)
    .replace('#include <color_fragment>', `
      #include <color_fragment>
      diffuseColor.rgb = mix(
        vec3(0.1, 0.3, 0.9), vec3(1.0, 0.5, 0.1),
        sin(vUv.y * 20.0 + uTime) * 0.5 + 0.5
      );`)
}

useLoop().onBeforeRender(({ elapsed }) => {
  uTime.value = elapsed
})
```

```ts
import { MeshStandardNodeMaterial } from 'three/webgpu'
import { mix, sin, time, uv, vec3 } from 'three/tsl'

const material = new MeshStandardNodeMaterial()

material.colorNode = mix(
  vec3(0.1, 0.3, 0.9), vec3(1.0, 0.5, 0.1),
  sin(uv().y.mul(20).add(time)).mul(0.5).add(0.5),
)
```
````

<!--
In WebGL, to change one part of a built-in material, you patch its shader source. You find an #include chunk by string, inject GLSL, and hope the chunk name does not change in the next three.js release. USE_UV makes three.js declare vUv for us. You also add the uniform and update time yourself.

[click] In TSL, the same material has a colorNode slot. You assign a node graph. Lighting still works, time is built in, and it compiles to WGSL on WebGPU or GLSL on the WebGL fallback.
-->

<style>
/* The GLSL version is long on purpose, it must fit without a scrollbar */
.slidev-layout {
  --slidev-code-font-size: 11px;
  --slidev-code-line-height: 1.45;
}
</style>


---
layout: two-cols
cols: 1fr 1.8fr
---

## Setting up the renderer

<div class="flex flex-col gap-6 mt-6 leading-snug">

<div>
  <span class="opacity-50 font-mono">01</span>
  A plain <code>TresCanvas</code>
</div>

<div v-click="1">
  <span class="opacity-50 font-mono">02</span>
  Write a factory that returns a <code>WebGPURenderer</code>
</div>

<div v-click="2">
  <span class="opacity-50 font-mono">03</span>
  Pass it to <code>:renderer</code>
</div>

</div>

::right::

````md magic-move {at:1}
```vue {6-9}
<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
</script>

<template>
  <TresCanvas>
    <Experience />
  </TresCanvas>
</template>
```

```vue {2,4-5,7-11}
<script setup lang="ts">
import type { TresRendererSetupContext } from '@tresjs/core'
import { TresCanvas } from '@tresjs/core'
import { WebGPURenderer } from 'three/webgpu'
import { toValue } from 'vue'

function createRenderer(ctx: TresRendererSetupContext) {
  return new WebGPURenderer({
    canvas: toValue(ctx.canvas),
  })
}
</script>

<template>
  <TresCanvas>
    <Experience />
  </TresCanvas>
</template>
```

```vue {2}
<template>
  <TresCanvas :renderer="createRenderer">
    <Experience />
  </TresCanvas>
</template>
```
````

<!--
A normal TresCanvas uses the WebGL renderer.

[click] Write a factory. Import WebGPURenderer from three/webgpu, not from three. Tres calls the factory with its canvas, so unwrap the ref and give it to the renderer.

[click] Pass the factory to the renderer prop. Tres awaits renderer.init() for you.
-->

<style>
/* The full SFC has to fit next to the steps without a scrollbar */
.slidev-layout {
  --slidev-code-font-size: 12px;
  --slidev-code-line-height: 1.5;
}
</style>

---
layout: blackboard
title: Main shapes
---

<SumiScene />

---
layout: two-cols
title: Experience.vue
cols: 1.6fr 1fr
---

````md magic-move {at:1}
```vue {2-6}
<template>
  <TresOrthographicCamera
    :position="[0, 0, 1000]"
    :near="0.1"
    :far="9999"
  />
</template>
```

```vue {8-10}
<template>
  <TresOrthographicCamera
    :position="[0, 0, 1000]"
    :near="0.1"
    :far="9999"
  />

  <TresMesh>
    <TresConeGeometry :args="[192, 330, 128]" />
  </TresMesh>
</template>
```

```vue {9}
<template>
  <TresOrthographicCamera
    :position="[0, 0, 1000]"
    :near="0.1"
    :far="9999"
  />

  <TresMesh
    :rotation="[Math.PI, 0, 0]"
  >
    <TresConeGeometry :args="[192, 330, 128]" />
  </TresMesh>
</template>
```

```vue {9}
<template>
  <TresOrthographicCamera
    :position="[0, 0, 1000]"
    :near="0.1"
    :far="9999"
  />

  <TresMesh
    :position="[-146, 0, 0]"
    :rotation="[Math.PI, 0, 0]"
  >
    <TresConeGeometry :args="[192, 330, 128]" />
  </TresMesh>
</template>
```

```vue {15-17}
<template>
  <TresOrthographicCamera
    :position="[0, 0, 1000]"
    :near="0.1"
    :far="9999"
  />

  <TresMesh
    :position="[-146, 0, 0]"
    :rotation="[Math.PI, 0, 0]"
  >
    <TresConeGeometry :args="[192, 330, 128]" />
  </TresMesh>

  <TresMesh>
    <TresSphereGeometry :args="[165, 64, 64]" />
  </TresMesh>
</template>
```

```vue {15}
<template>
  <TresOrthographicCamera
    :position="[0, 0, 1000]"
    :near="0.1"
    :far="9999"
  />

  <TresMesh
    :position="[-146, 0, 0]"
    :rotation="[Math.PI, 0, 0]"
  >
    <TresConeGeometry :args="[192, 330, 128]" />
  </TresMesh>

  <TresMesh :position="[172, 0, 0]">
    <TresSphereGeometry :args="[165, 64, 64]" />
  </TresMesh>
</template>
```
````

::right::

<div class="h-[340px] rounded-lg border border-white/10">
  <ShapesDemo :step="$clicks" />
</div>

<!--
Experience.vue is the component inside the TresCanvas. It holds the whole scene. The original site is a flat poster, so I start with an orthographic camera. It has no perspective, so the shapes keep the same size at any depth.

[click] The V is a cone. A mesh with a cone geometry, at the center of the scene. It points up.

[click] I rotate it Math.PI on the X axis, so it points down. Now it is a V.

[click] Then I move it to the left.

[click] The circle of the Hinomaru is a sphere. With an orthographic camera, it looks like a flat disc.

[click] And I move it to the right.
-->

<style>
/* The final SFC has to fit above the footer without a scrollbar */
.slidev-layout {
  --slidev-code-font-size: 11px;
  --slidev-code-line-height: 1.4;
}
</style>

---
layout: intro
section: '03'
eyebrow: TSL
---

# Three.js Shading Language

Shaders as JavaScript functions

---
layout: two-cols
title: What is TSL?
cols: 1fr 1.4fr
---

<div class="flex flex-col gap-6 mt-2 leading-snug">

<div :class="$clicks === 0 ? '' : 'opacity-40'">
  <span class="opacity-50 font-mono">01</span>
  Shaders written in JavaScript, imported from <code>three/tsl</code>
</div>

<div v-click="1" :class="$clicks === 1 ? '' : 'opacity-40'">
  <span class="opacity-50 font-mono">02</span>
  Every call returns a node, not a value
</div>

<div v-click="2" :class="$clicks === 2 ? '' : 'opacity-40'">
  <span class="opacity-50 font-mono">03</span>
  <code>Fn()</code> groups nodes into a function you can reuse
</div>

<div v-click="3">
  <span class="opacity-50 font-mono">04</span>
  Give the graph to a material slot. three.js compiles it to WGSL, or to GLSL on WebGL
</div>

</div>

::right::

```ts {1-3|5-6|8-11|13}{at:1}
import {
  Fn, float, sin, time, uv, vec3,
} from 'three/tsl'

const speed = float(2) // a node, not the number 2
const wave = sin(time.mul(speed))

const stripes = Fn(() => {
  const y = uv().y.mul(10).add(wave)
  return vec3(sin(y).mul(0.5).add(0.5))
})

material.colorNode = stripes()
```

<!--
TSL is the Three.js Shading Language. You write the shader in JavaScript, with functions from three/tsl.

[click] The important idea: these functions do not calculate anything on the CPU. float(2) is not the number 2, it is a node. time.mul(speed) is a new node that multiplies two nodes. You build a graph.

[click] Fn wraps a part of the graph in a function, so you can reuse it and give it parameters. Inside, you write code that looks like a normal shader.

[click] Then you give the graph to a slot of a node material, like colorNode. three.js compiles the graph to WGSL for WebGPU, or to GLSL when it falls back to WebGL. One source, two targets.
-->

<style>
.slidev-layout {
  --slidev-code-font-size: 12px;
  --slidev-code-line-height: 1.6;
}
</style>

---
layout: two-cols
title: Node materials
cols: 1.6fr 1fr
---

````md magic-move {at:1}
```vue
<template>
  <TresMesh
    :position="[-146, 0, 0]"
    :rotation="[Math.PI, 0, 0]"
  >
    <TresConeGeometry :args="[192, 330, 128]" />
  </TresMesh>

  <TresMesh :position="[172, 0, 0]">
    <TresSphereGeometry :args="[165, 64, 64]" />
  </TresMesh>
</template>
```

```vue {1-6}
<script setup lang="ts">
import { MeshBasicNodeMaterial } from 'three/webgpu'

const coneMaterial = new MeshBasicNodeMaterial()
const sphereMaterial = new MeshBasicNodeMaterial()
</script>

<template>
  <TresMesh
    :position="[-146, 0, 0]"
    :rotation="[Math.PI, 0, 0]"
  >
    <TresConeGeometry :args="[192, 330, 128]" />
  </TresMesh>

  <TresMesh :position="[172, 0, 0]">
    <TresSphereGeometry :args="[165, 64, 64]" />
  </TresMesh>
</template>
```

```vue {12,17}
<script setup lang="ts">
import { MeshBasicNodeMaterial } from 'three/webgpu'

const coneMaterial = new MeshBasicNodeMaterial()
const sphereMaterial = new MeshBasicNodeMaterial()
</script>

<template>
  <TresMesh
    :position="[-146, 0, 0]"
    :rotation="[Math.PI, 0, 0]"
    :material="coneMaterial"
  >
    <TresConeGeometry :args="[192, 330, 128]" />
  </TresMesh>

  <TresMesh :position="[172, 0, 0]" :material="sphereMaterial">
    <TresSphereGeometry :args="[165, 64, 64]" />
  </TresMesh>
</template>
```

```vue {2,7-8}
<script setup lang="ts">
import { color } from 'three/tsl'
import { MeshBasicNodeMaterial } from 'three/webgpu'

const coneMaterial = new MeshBasicNodeMaterial()
const sphereMaterial = new MeshBasicNodeMaterial()
coneMaterial.colorNode = color('#42b883')
sphereMaterial.colorNode = color('#bc002d')
</script>

<template>
  <TresMesh
    :position="[-146, 0, 0]"
    :rotation="[Math.PI, 0, 0]"
    :material="coneMaterial"
  >
    <TresConeGeometry :args="[192, 330, 128]" />
  </TresMesh>

  <TresMesh :position="[172, 0, 0]" :material="sphereMaterial">
    <TresSphereGeometry :args="[165, 64, 64]" />
  </TresMesh>
</template>
```
````

::right::

<div class="h-[340px] rounded-lg border border-white/10">
  <ShapesDemo :step="5 + $clicks" />
</div>

<!--
This is where we left Experience.vue. I hide the camera to save space, it did not change.

[click] To use TSL, each mesh needs a node material. MeshBasicNodeMaterial is the node version of MeshBasicMaterial. It ignores lights, which is what we want for a flat poster. Import it from three/webgpu, not from three.

[click] Pass each material to its mesh with the material prop. Nothing changes yet, a node material without nodes looks like the default material.

[click] Now the important part. A node material has slots, like colorNode. You give a slot a TSL node, and three.js compiles it to the shader. Here the node is only a constant color: Vue green for the V, and red for the Hinomaru. In the next section, this node becomes the suminagashi ink.
-->

<style>
/* The final SFC has to fit above the footer without a scrollbar */
.slidev-layout {
  --slidev-code-font-size: 11px;
  --slidev-code-line-height: 1.3;
}
</style>

---
layout: two-cols
title: Carving the V
cols: 1fr 1.7fr
---

<div class="flex flex-col gap-5 mt-2 leading-snug">

<div :class="$clicks === 0 ? '' : 'opacity-40'">
  <span class="opacity-50 font-mono">01</span>
  Local space: <code>y</code> goes from -165 to 165. The mesh is rotated, so -y is up.
</div>

<div v-click="1" :class="$clicks === 1 ? '' : 'opacity-40'">
  <span class="opacity-50 font-mono">02</span>
  Rows the wedge covers: <code>y &lt; -90</code>
</div>

<div v-click="2" :class="$clicks === 2 ? '' : 'opacity-40'">
  <span class="opacity-50 font-mono">03</span>
  Inside the wedge: <code>|x| &lt; wedgeHalfWidth</code>, from 64 at y = -200 to 0 at y = -90
</div>

<div v-click="3">
  <span class="opacity-50 font-mono">04</span>
  <code>Discard</code> pixels in both. z is not used, so the cut goes through the whole depth.
</div>

</div>

::right::

<img
  src="/cone-tail-mask.svg"
  alt="Front view of the inverted cone. A red hatched wedge at the top center marks the discarded region: y below -90, and |x| smaller than wedgeHalfWidth, where wedgeHalfWidth shrinks from 64 at y = -200 to 0 at y = -90. An inset seen from above shows the wedge is a slab through the whole depth."
  class="w-full rounded-lg"
/>

<!--
The site does not use a V model. It is the same cone, and the shader cuts the notch.

The shader works in local space, so the numbers do not change when I move or scale the mesh. The cone is 330 units tall, so y goes from -165 to 165. Remember the rotation: local -y now points up, to the wide part of the V.

[click] First condition: inWedgeRange. Only the rows the wedge covers, the top part above y = -90.

[click] Second condition: insideWedge. Its half width is wedgeHalfWidth. It starts at 64 on a line at y = -200, outside the mesh, and gets to 0 at y = -90. Inside the mesh, at the base, the gap is 2 × 43.6 units wide.

[click] When a pixel is in both, Discard drops it. The GPU does not draw it. The test only uses x and y, so it is a slab through the whole cone, seen from above in the small diagram.
-->

<style>
/* Keep each condition on one line, so a comparison does not split in two */
.col code { white-space: nowrap; }
</style>

---
layout: two-cols
title: Carving the V
cols: 1.6fr 1fr
---

````md magic-move {at:1}
```ts
import { color } from 'three/tsl'

coneMaterial.colorNode = color('#42b883')
```

```ts {2,5-6,9}
import {
  color, Fn, positionLocal,
} from 'three/tsl'

coneMaterial.colorNode = Fn(() => {
  const pos = positionLocal

  return color('#42b883')
})()
```

```ts {2,7-8}
import {
  color, Discard, Fn, positionLocal,
} from 'three/tsl'

coneMaterial.colorNode = Fn(() => {
  const pos = positionLocal
  const inWedgeRange = pos.y.lessThan(-90)
  Discard(inWedgeRange)

  return color('#42b883')
})()
```

```ts {2,8-13}
import {
  color, Discard, float, Fn, positionLocal,
} from 'three/tsl'

coneMaterial.colorNode = Fn(() => {
  const pos = positionLocal
  const inWedgeRange = pos.y.lessThan(-90)
  const wedgeProgress = pos.y.add(200).div(110)
  const wedgeHalfWidth = float(64).mul(
    float(1).sub(wedgeProgress),
  )
  const insideWedge = pos.x.abs().lessThan(wedgeHalfWidth)
  Discard(inWedgeRange.and(insideWedge))

  return color('#42b883')
})()
```
````

::right::

<div class="h-[340px] rounded-lg border border-white/10">
  <ShapesDemo :step="8 + $clicks" />
</div>

<!--
We start from the flat green color.

[click] To write logic, wrap it in Fn and call it. positionLocal is the position of the pixel on the mesh, in local space. Nothing changes yet.

[click] Discard every pixel in the wedge range. The top of the triangle is gone. This is the first condition alone.

[click] Now add the wedge. wedgeProgress goes from 0 at y = -200 to 1 at y = -90, so wedgeHalfWidth goes from 64 to 0. Discard only where both conditions are true, and we get the V.
-->

<style>
.slidev-layout {
  --slidev-code-font-size: 12px;
  --slidev-code-line-height: 1.5;
}
</style>

---
layout: default
center: true
---

<img src="/mathematical.gif" alt="Mathematical!" class="mx-auto h-[360px] rounded-lg" />

---
layout: intro
section: '04'
eyebrow: The ink
---

# Noise as art

Smooth randomness for the floating ink

---
layout: two-cols
title: Sphere coordinates
cols: 1.6fr 1fr
---

````md magic-move {at:1}
```ts
import { color } from 'three/tsl'

sphereMaterial.colorNode = color('#bc002d')
```

```ts {1,5}
import { checker, color, mix, uv } from 'three/tsl'

sphereMaterial.colorNode = mix(
  color('#000000'), color('#ffffff'),
  checker(uv().mul(8.0)),
)
```

```ts {6-13,17}
import {
  acos, atan, checker, color, mix,
  normalize, normalView, PI, vec2,
} from 'three/tsl'

const n = normalize(normalView)
const phi = acos(n.y)
const theta = atan(n.z, n.x)

const sphereUV = vec2(
  theta.div(PI.mul(2.0)),
  phi.div(PI),
).mul(0.5)

sphereMaterial.colorNode = mix(
  color('#000000'), color('#ffffff'),
  checker(sphereUV.mul(8.0)),
)
```

```ts {3,8}
import {
  acos, atan, checker, color, mix,
  normalize, normalView, PI, time, vec2,
} from 'three/tsl'

const n = normalize(normalView)
const phi = acos(n.y)
const theta = atan(n.z, n.x).add(time.mul(0.1))

const sphereUV = vec2(
  theta.div(PI.mul(2.0)),
  phi.div(PI),
).mul(0.5)

sphereMaterial.colorNode = mix(
  color('#000000'), color('#ffffff'),
  checker(sphereUV.mul(8.0)),
)
```
````

::right::

<div class="h-[340px] rounded-lg border border-white/10">
  <ShapesDemo :step="12 + $clicks" controls />
</div>

<!--
To draw a pattern on the sphere, every pixel needs a 2D coordinate.

[click] The easy way: the sphere geometry has UVs. uv() gives them, and checker paints alternating cells. Now I drag the scene. The checker turns with the mesh, because geometry UVs are fixed to the mesh. The original does not want that. It wants the front of the marble to always face you, and it wants to spin the pattern without spinning the mesh.

[click] So it builds its own coordinate from the normal. normalView is the direction the surface points, relative to the camera. On a sphere, that is also the direction from the center to the pixel. Two angles: phi is how far down from the top pole, acos of n.y. theta is how far around the vertical axis, atan of n.z and n.x. Divide each by its range, and the sphere unrolls onto a rectangle. The 0.5 zooms the pattern.

Now I drag again. The cone turns, but the checker stays facing the camera. The cells pinch toward the poles. That is normal for spherical coordinates, and the poles face away from the camera, so the original accepts it.

[click] Add time to theta and every point slides around the axis. That is the spin. One full turn takes about a minute. Every pattern from now on reads sphereUV.
-->

<style>
.slidev-layout {
  --slidev-code-font-size: 12px;
  --slidev-code-line-height: 1.5;
}
</style>

---
layout: two-cols
title: Value noise
cols: 1.6fr 1fr
---

````md magic-move {at:1}
```ts
export const noise = Fn(([st]: [Node<'vec2'>]) => {
  return random(st)
})

sphereMaterial.colorNode = vec3(noise(sphereUV.mul(20.0)))
```

```ts {2,4}
export const noise = Fn(([st]: [Node<'vec2'>]) => {
  const i = st.floor()

  return random(i)
})

sphereMaterial.colorNode = vec3(noise(sphereUV.mul(20.0)))
```

```ts {3,5-8,10-14}
export const noise = Fn(([st]: [Node<'vec2'>]) => {
  const i = st.floor()
  const f = fract(st)

  const r00 = random(i)
  const r10 = random(i.add(vec2(1.0, 0.0)))
  const r01 = random(i.add(vec2(0.0, 1.0)))
  const r11 = random(i.add(vec2(1.0, 1.0)))

  return mix(
    mix(r00, r10, f.x),
    mix(r01, r11, f.x),
    f.y,
  )
})

sphereMaterial.colorNode = vec3(noise(sphereUV.mul(20.0)))
```

```ts {4,12-14}
export const noise = Fn(([st]: [Node<'vec2'>]) => {
  const i = st.floor()
  const f = fract(st)
  const u = f.mul(f).mul(sub(3.0, mul(2.0, f)))

  const r00 = random(i)
  const r10 = random(i.add(vec2(1.0, 0.0)))
  const r01 = random(i.add(vec2(0.0, 1.0)))
  const r11 = random(i.add(vec2(1.0, 1.0)))

  return mix(
    mix(r00, r10, u.x),
    mix(r01, r11, u.x),
    u.y,
  )
})

sphereMaterial.colorNode = vec3(noise(sphereUV.mul(20.0)))
```
````

::right::

<div class="h-[340px] rounded-lg border border-white/10">
  <ShapesDemo :step="16 + $clicks" />
</div>

<!--
random is the classic shader hash: one number between 0 and 1 for each input. I feed it sphereUV times 20, so the front of the sphere is about 5 cells wide and 10 cells high. A new value at every pixel is TV static, not ink.

[click] floor rounds st down to the cell corner. All the pixels in a cell get the same random value, so we get a grid of flat tiles.

[click] fract is the position inside the cell, from 0 to 1. I take the random value at the four corners of the cell and mix them, first along x, then along y. The tiles blend, but you can still see the grid lines.

[click] The fix is u, the smoothstep curve 3f² - 2f³. It starts and ends flat, so the blend has no corner at the cell border. This is value noise, the base of the suminagashi ink.
-->

<style>
.slidev-layout {
  --slidev-code-font-size: 11px;
  --slidev-code-line-height: 1.4;
}
</style>

---
layout: two-cols
title: Fractal Brownian motion
cols: 1.6fr 1fr
---

<script setup>
import { ref } from 'vue'

const octaves = ref(6)
</script>

````md magic-move {at:1}
```ts
export const fbm = Fn(([
  st, amplitude, frequency, lacunarity, gain, octaves,
]: [
  Node<'vec2'>, Node<'float'>, Node<'float'>,
  Node<'float'>, Node<'float'>, Node<'int'>,
]) => {
  const value = float(0).toVar()
  const amp = amplitude.toVar()
  const freq = frequency.toVar()

  value.addAssign(amp.mul(noise(st.mul(freq))))

  return value
})

const octaves = uniform(6, 'int')
sphereMaterial.colorNode = vec3(fbm(
  sphereUV.mul(3.0),
  float(0.6), float(2), float(1.8), float(0.5), octaves,
))
```

```ts {11-14}
export const fbm = Fn(([
  st, amplitude, frequency, lacunarity, gain, octaves,
]: [
  Node<'vec2'>, Node<'float'>, Node<'float'>,
  Node<'float'>, Node<'float'>, Node<'int'>,
]) => {
  const value = float(0).toVar()
  const amp = amplitude.toVar()
  const freq = frequency.toVar()

  Loop(octaves, () => {
    value.addAssign(amp.mul(noise(st.mul(freq))))
    freq.mulAssign(lacunarity)
  })

  return value
})

const octaves = uniform(6, 'int')
sphereMaterial.colorNode = vec3(fbm(
  sphereUV.mul(3.0),
  float(0.6), float(2), float(1.8), float(0.5), octaves,
))
```

```ts {14}
export const fbm = Fn(([
  st, amplitude, frequency, lacunarity, gain, octaves,
]: [
  Node<'vec2'>, Node<'float'>, Node<'float'>,
  Node<'float'>, Node<'float'>, Node<'int'>,
]) => {
  const value = float(0).toVar()
  const amp = amplitude.toVar()
  const freq = frequency.toVar()

  Loop(octaves, () => {
    value.addAssign(amp.mul(noise(st.mul(freq))))
    freq.mulAssign(lacunarity)
    amp.mulAssign(gain)
  })

  return value
})

const octaves = uniform(6, 'int')
sphereMaterial.colorNode = vec3(fbm(
  sphereUV.mul(3.0),
  float(0.6), float(2), float(1.8), float(0.5), octaves,
))
```

```ts {20}
export const fbm = Fn(([
  st, amplitude, frequency, lacunarity, gain, octaves,
]: [
  Node<'vec2'>, Node<'float'>, Node<'float'>,
  Node<'float'>, Node<'float'>, Node<'int'>,
]) => {
  const value = float(0).toVar()
  const amp = amplitude.toVar()
  const freq = frequency.toVar()

  Loop(octaves, () => {
    value.addAssign(amp.mul(noise(st.mul(freq))))
    freq.mulAssign(lacunarity)
    amp.mulAssign(gain)
  })

  return value
})

const octaves = uniform(6, 'int')
sphereMaterial.colorNode = vec3(fbm(
  sphereUV.mul(3.0),
  float(0.6), float(2), float(1.8), float(0.5), octaves,
))
```
````

::right::

<div class="h-[300px] rounded-lg border border-white/10">
  <ShapesDemo :step="20 + $clicks" :octaves="octaves" />
</div>

<label v-click="3" class="flex items-center gap-3 mt-3 font-mono text-sm">
  <span class="opacity-60">octaves</span>
  <input v-model.number="octaves" type="range" min="1" max="8" step="1" class="flex-1 accent-[#42b883]">
  <span class="w-4 text-right">{{ octaves }}</span>
</label>

<!--
One layer of noise is too smooth for ink. fbm stacks layers, called octaves. value, amp and freq are toVar, so the shader can change them. This first version adds one octave only: the same value noise as before, at 60% brightness.

[click] Loop repeats the body once per octave. After each octave, freq is multiplied by the lacunarity, so the next layer has smaller cells and adds finer detail. But every layer adds the same amount, so the sum burns out to white.

[click] gain fixes it. After each octave, amp is multiplied by 0.5, so each layer of detail is half as strong as the one before. The big shapes stay, the small layers add texture.

[click] octaves is a uniform, not a constant. The shader compiles once and the loop reads the count on the GPU, so I can change it live. One octave is plain value noise. Each new octave adds finer detail, and after about 6 you do not see a difference.
-->

<style>
/* The signature is long, it must fit next to the demo without a scrollbar */
.slidev-layout {
  --slidev-code-font-size: 10px;
  --slidev-code-line-height: 1.4;
}
</style>

---
layout: default
clicks: 2
---

## Pushing the ink around

Read the noise at <code>p + offset</code>, not at <code>p</code>. The offset is another noise field.

<DomainWarp :step="$clicks" />

<!--
This is the trick that turns clouds into marble. It is called domain warping. Before we look up the pattern at a point, we move the point.

On the left, the rings of a suminagashi drop, drawn at p. On the right, the same rings, but each point is pushed by a flow field first. For now the strength is 0, so they are the same.

[click] The flow field is the breath on the water. It is a 2D vector built from two fbm reads, how far to push in x and how far in y. The rings stretch where the field pulls and bunch up where it pushes. The field drifts with time, so the ink keeps flowing.

[click] Too much push and the rings tear into strands. In the shader, the push is only 0.1, on purpose.
-->

---
layout: two-cols
title: Layers of flow
cols: 1.9fr 1fr
---

<script setup>
// The clicks where the magic move sets a new colorNode, so the sphere changes only there
const colorNodeClicks = [2, 7, 11]
</script>

````md magic-move {at:1}
```ts
// The fbm from the last slide: same settings, 6 octaves
const clouds = (st: Node) =>
  fbm(st, float(0.6), float(2), float(1.8), float(0.5), 6)

const st = sphereUV.mul(3.0)
sphereMaterial.colorNode = vec3(clouds(st))
```

```ts {5-9}
// The fbm from the last slide: same settings, 6 octaves
const clouds = (st: Node) =>
  fbm(st, float(0.6), float(2), float(1.8), float(0.5), 6)

export const flowField = Fn(([p, t]: [Node, Node]) => {
  const fx = clouds(p.add(vec2(0.0, t.mul(0.1))))
  const fy = clouds(p.add(vec2(t.mul(0.1), 0.0)))
  return vec2(fx, fy)
})

const st = sphereUV.mul(3.0)
sphereMaterial.colorNode = vec3(clouds(st))
```

```ts {12}
// The fbm from the last slide: same settings, 6 octaves
const clouds = (st: Node) =>
  fbm(st, float(0.6), float(2), float(1.8), float(0.5), 6)

export const flowField = Fn(([p, t]: [Node, Node]) => {
  const fx = clouds(p.add(vec2(0.0, t.mul(0.1))))
  const fy = clouds(p.add(vec2(t.mul(0.1), 0.0)))
  return vec2(fx, fy)
})

const st = sphereUV.mul(3.0)
sphereMaterial.colorNode = vec3(clouds(st.add(flowField(st, time))))
```

```ts {1-3|5-11|13|15-18|21-23}
export const generateSumiPattern = Fn(([uvNode, t, scale]) => {
  const timeScale = t.mul(0.15)
  const st = uvNode.mul(scale)

  const flow = flowField(st.mul(2.0), timeScale)
  const flow2 = flowField(
    st.mul(4.0).add(flow.mul(0.2)), timeScale.mul(1.2),
  )
  const flow3 = flowField(
    st.mul(8.0).add(flow2.mul(0.15)), timeScale.mul(0.9),
  )

  const finalFlow = flow.mul(0.5).add(flow2.mul(0.3)).add(flow3.mul(0.2))

  const marbleNoise = clouds(st.add(finalFlow.mul(0.8)))
  const sumiPattern = clouds(st.add(finalFlow).mul(3.0).add(t.mul(0.05)))

  return marbleNoise.mul(0.5).add(sumiPattern.mul(0.5))
})

sphereMaterial.colorNode = vec3(generateSumiPattern(
  sphereUV, time.mul(0.25), float(0.3),
))
```

```ts {6-10|12-13|15-18}
export const generateSumiPattern = Fn(([uvNode, t, scale]) => {
  ...
})

// Outside generateSumiPattern: we push the uv we give it
const timeScale = time.mul(0.7)
const baseFlow = flowField(sphereUV.mul(1.5), timeScale)
const detailFlow = flowField(
  sphereUV.mul(3.0).add(baseFlow.mul(0.4)), timeScale.mul(1.2),
)

// n.z is 1 at the center of the disc and 0 at the rim
const edgeIntensity = n.dot(vec3(0.0, 0.0, 1.0)).mul(0.5).add(0.5)

const flowStrength = float(0.1)
const warpedUV = baseFlow.mul(0.7).add(detailFlow.mul(0.3))
  .add(edgeIntensity.mul(baseFlow).mul(1.5))
  .mul(flowStrength)

sphereMaterial.colorNode = vec3(generateSumiPattern(
  sphereUV, time.mul(0.25), float(0.3),
))
```

```ts {20-22}
export const generateSumiPattern = Fn(([uvNode, t, scale]) => {
  ...
})

// Outside generateSumiPattern: we push the uv we give it
const timeScale = time.mul(0.7)
const baseFlow = flowField(sphereUV.mul(1.5), timeScale)
const detailFlow = flowField(
  sphereUV.mul(3.0).add(baseFlow.mul(0.4)), timeScale.mul(1.2),
)

// n.z is 1 at the center of the disc and 0 at the rim
const edgeIntensity = n.dot(vec3(0.0, 0.0, 1.0)).mul(0.5).add(0.5)

const flowStrength = float(0.1)
const warpedUV = baseFlow.mul(0.7).add(detailFlow.mul(0.3))
  .add(edgeIntensity.mul(baseFlow).mul(1.5))
  .mul(flowStrength)

sphereMaterial.colorNode = vec3(generateSumiPattern(
  sphereUV.add(warpedUV), time.mul(0.25), float(0.3),
))
```
````

::right::

<div class="h-[340px] rounded-lg border border-white/10">
  <ShapesDemo :step="24 + colorNodeClicks.filter(c => $clicks >= c).length" />
</div>

<!--
Now the code. clouds is the fbm from the last slide, with the same settings and 6 octaves, so the lines fit on the slide.

[click] flowField is the offset from the rings figure. It must be a 2D vector, because we push in x and in y. So it reads the clouds twice, one drifting along y with time, one along x. Read it as "how far to push this point in x, and how far in y". The colorNode does not change, so the sphere still shows plain clouds.

[click] Read the clouds at st plus the flow, not at st. One line changes, and the clouds start to flow like ink. time is a TSL node, so it moves with no uniform to update.

[click] This is the function of the site. It takes the uv, the time and a scale. Look how slow it is: time times 0.15 here, and the caller already slows it to time times 0.25.

[click] The original warps three times. Each layer is sampled at a position already pushed by the layer before it, so the small swirls follow the big ones, like small eddies on a large current.

[click] The weights 0.5, 0.3 and 0.2 keep the big layer in charge. Set them equal and you get fine noise with no direction.

[click] Then it reads the clouds twice through the combined flow and averages the two reads.

[click] And we give it to the colorNode. These are the exact arguments of the site. This layer only breathes. It gives the detail, not the motion.

[click] generateSumiPattern stays the same. The motion comes from two more flow layers in the material, outside it. They run on time times 0.7, about 20 times faster than the pattern inside.

[click] edgeIntensity pushes harder at the center of the disc than at the rim, so the outline of the circle stays calm.

[click] The push is only 0.1, on purpose: sphereUV is about a quarter unit wide, so 0.1 is already a big push. Set it to 1 and the pattern tears into strands. The colorNode does not change yet.

[click] Same trick as before, one level up: read the pattern at sphereUV plus warpedUV, not at sphereUV. This is the gray of the site. It flows like ink, but it has no edges yet. That is the next step.

Count the work: five flowField calls and two fbm calls, that is twelve fbm of six octaves, 72 noise reads, about 290 hashes per pixel per frame. Fine on a desktop GPU, the first thing to cut on a phone.
-->

<style>
/* The fourth step is 23 lines, it must fit above the footer */
.slidev-layout {
  --slidev-code-font-size: 10px;
  --slidev-code-line-height: 1.3;
}
</style>

---
layout: intro
section: '05'
eyebrow: From gray to color
---

# Ink bands and palettes

Contour lines, a color ramp, and four palettes

<!--
The pattern moves like ink now, but it is still gray. In this section we give it color: first we cut it into rings, then we paint the rings with a palette, and then we let the palette change.
-->

---
layout: default
clicks: 2
---

## Ink bands

<ColorRamp :step="$clicks" />

<!--
The gray from the last slide is smooth. Real suminagashi has sharp lines where one ring of ink meets the next. So we draw contour lines, like on a topographic map.

fract of noise times 5 repeats the 0 to 1 ramp five times. Each repeat is one ring. Where the noise is flat, the rings are far apart. Where it is steep, they crowd together, like contour lines on a hill.

Then each ring gets its colors. If you use Blender, you know this tool: it is a Color Ramp. Here it has three colors and no blend yet. floor of nv times 3 gives 0, 1 or 2, and that picks color1, color2 or color3.

[click] Now the blend. For the first 80% of each color it stays flat, for the last 20% it mixes into the next color. So every ring has a hard edge on one side and a soft edge on the other, like ink that spread a little on one side. On the bar, the bright handles all sit at 0.8 of their segment. I can drag one, and they all move, because it is one number in the shader.

[click] One more detail. A thin band, from 0.30 to 0.33, gets high-frequency detail noise, and its colors repeat faster. Some contour lines break into fine strokes. It is a small part of the picture, and it is what makes the marble look hand-made.
-->

---
layout: two-cols
title: Twelve colors, one uniform
cols: 1.3fr 1fr
---

```ts {1-5|7-12|14-21}
export const colorSets = [
  { color1: new Color('#007F62'), color2: new Color('#16C787'),
    color3: new Color('#C6A167'), bg: '#fae8e4' },
  // ...3 more sets
]

// TSL has no struct uniforms: 4 sets × 3 colors = 12 colors
export const colorArray = uniformArray(
  colorSets.flatMap(s => [s.color1, s.color2, s.color3]),
  'color',
)
export const paletteIndex = uniform(0, 'int')

export function paletteColors(setIndex: Node) {
  const base = setIndex.mul(int(3))
  return {
    color1: vec3(colorArray.element(base)),
    color2: vec3(colorArray.element(base.add(int(1)))),
    color3: vec3(colorArray.element(base.add(int(2)))),
  }
}
```

::right::

<PaletteArray :step="$clicks" />

<style>
/* The code must fit next to the palettes without a scrollbar */
.slidev-layout {
  --slidev-code-font-size: 10px;
  --slidev-code-line-height: 1.4;
}
</style>

<!--
The site has four palettes. Each one has three ink colors and a page background.

[click] The shader must read all of them, but TSL has no struct uniforms. So the four sets become one flat uniformArray of twelve colors. paletteIndex is the one value JavaScript changes at runtime.

[click] To read a set, multiply the index by 3. Set 2 starts at 6, so its colors are 6, 7 and 8. element() reads the array with a dynamic index, so one compiled shader serves all four palettes.
-->

---
layout: two-cols
title: calculateColor
cols: 1.9fr 1fr
---

<script setup>
// The clicks where the sphere gets a new colorNode: the ramp, the detail band, the V color, the palette cycle
const colorNodeClicks = [2, 5, 7, 8]
</script>

````md magic-move
```ts {1-5|7-15|17-22}
export const calculateColor = Fn(([noiseValue, setIndex]) => {
  const colors = paletteColors(setIndex)
  const nv = fract(noiseValue.mul(5.0))
  const segment3 = floor(nv.mul(3.0))
  const localPos3 = fract(nv.mul(3.0))

  const currentColor3 = vec3(0.0).toVar()
  const nextColor3 = vec3(0.0).toVar()
  If(segment3.equal(0.0), () => {
    currentColor3.assign(colors.color1); nextColor3.assign(colors.color2)
  }).ElseIf(segment3.equal(1.0), () => {
    currentColor3.assign(colors.color2); nextColor3.assign(colors.color3)
  }).Else(() => {
    currentColor3.assign(colors.color3); nextColor3.assign(colors.color1)
  })

  const result = vec3(currentColor3).toVar()
  If(localPos3.greaterThan(0.8), () => {
    const tt = localPos3.sub(0.8).div(0.2)
    result.assign(mix(currentColor3, nextColor3, tt))
  })
  return result
})
```

```ts {1-4|5-8|10-15}
// nv is a var now: the detail band changes it
const nv = fract(noiseValue.mul(5.0)).toVar()

If(nv.greaterThan(0.3).and(nv.lessThan(0.33)), () => {
  const sumiDetail = generateSumiDetail(
    noiseUV.add(warpedUV).mul(0.1), t.mul(0.1),
  )
  nv.assign(nv.mul(0.95).add(sumiDetail.mul(0.05)))

  const idx = int(mod(floor(nv.mul(24.0)), 3.0))
  const localPos9 = fract(nv.mul(9.0))
  // same pick and 0.8 blend as before, with idx and localPos9
}).Else(() => {
  // the ramp from the last step
})
```

```ts {1-3|5-6|8-12}
sphereMaterial.colorNode = calculateColor(
  noiseValue, paletteIndex, sphereUV, warpedUV, time,
)

// The V: color1 of the active set, in place of the green
const fill = vec3(colorArray.element(paletteIndex.mul(int(3))))

const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed }) => {
  const idx = Math.floor(elapsed / 15) % colorSets.length
  if (idx !== paletteIndex.value) paletteIndex.value = idx
})
```
````

::right::

<div class="h-[340px] rounded-lg border border-white/10">
  <ShapesDemo :step="27 + colorNodeClicks.filter(c => $clicks >= c).length" />
</div>

<!--
This is the ramp from two slides ago, in TSL. nv is the contour value. segment3 says which color we are in, localPos3 says how far into that color.

[click] An If ladder picks the current color and the next color. In TSL, If is a real shader branch, so the two colors must be variables that every branch can assign.

[click] Then the blend. Below 0.8 we keep the current color. Above it, tt maps 0.8 to 1 onto 0 to 1, and mix fades into the next color. The sphere has ink now.

[click] The detail band wraps all of this. nv becomes a variable, because this branch changes it.

[click] Inside the band, we nudge nv by 5% of a detail noise. generateSumiDetail is the same three-layer warp with higher frequencies.

[click] Then the same pick and blend with idx and localPos9, so the colors cycle three times faster. Look for the fine strokes on some of the lines.

[click] These are the arguments of the site: the noise, the palette index, and the uv and warp for the detail noise.

[click] The V reads color1 of the active set, so the two shapes always match.

[click] And the palette cycle. It is CPU logic, so it lives in the render loop, and it only touches the uniform when the index changes. Every 15 seconds the whole visual changes color. I can also click the dots to jump.
-->

<style>
/* The first step is 23 lines, it must fit above the footer */
.slidev-layout {
  --slidev-code-font-size: 10px;
  --slidev-code-line-height: 1.3;
}
</style>

---
layout: two-cols
title: Paper grain
cols: 1.9fr 1fr
---

<script setup>
// The clicks where the shapes get a new colorNode: the raw grain, then the soft light blend
const colorNodeClicks = [2, 5]
</script>

````md magic-move {at:1}
```ts
const { state: noiseTexture } = useTexture('/sumi/noise.png')

watch(noiseTexture, (tex) => {
  if (!tex) return
  tex.wrapS = RepeatWrapping
  tex.wrapT = RepeatWrapping
}, { immediate: true })
```

```ts {9-17|19}
const { state: noiseTexture } = useTexture('/sumi/noise.png')

watch(noiseTexture, (tex) => {
  if (!tex) return
  tex.wrapS = RepeatWrapping
  tex.wrapT = RepeatWrapping
}, { immediate: true })

// Object space, not uv: the grain has the same size on both shapes
function grainNoise(tex: Texture) {
  const pos = positionLocal
  const nUV = vec2(
    pos.x.mul(0.01).add(time.mul(0.05)),
    pos.y.mul(0.01),
  )
  return texture(tex, nUV).rgb
}

sphereMaterial.colorNode = grainNoise(noiseTexture.value)
```

```ts {1-8|10-18}
// Pegtop soft light: < 0.5 darkens, > 0.5 lightens, 0.5 does nothing
const softLightChannel = Fn(([base, blend]) => {
  const dark = base.mul(blend).mul(2.0)
    .add(base.mul(base).mul(blend.mul(2.0).oneMinus()))
  const light = sqrt(base).mul(blend.mul(2.0).sub(1.0))
    .add(base.mul(float(2.0).sub(blend.mul(2.0))))
  return blend.lessThan(0.5).select(dark, light)
})

export const blendSoftLight = Fn(([base, blend, opacity]) => {
  const blended = vec3(
    softLightChannel(base.x, blend.x),
    softLightChannel(base.y, blend.y),
    softLightChannel(base.z, blend.z),
  )
  // Layer opacity: opacity 0 gives back the base color
  return mix(base, blended, opacity)
})
```

```ts {4-6,13-15}
coneMaterial.colorNode = Fn(() => {
  // ...the V notch
  const baseColor = vec3(colorArray.element(paletteIndex.mul(int(3))))
  return vec4(blendSoftLight(
    baseColor, grainNoise(tex), float(0.7),
  ), 1.0)
})()

sphereMaterial.colorNode = Fn(() => {
  // ...sphereUV, flow and warp
  const baseColor = calculateColor(
    noiseValue, paletteIndex, sphereUV, warpedUV, time,
  )
  return vec4(blendSoftLight(
    baseColor, grainNoise(tex), float(0.7),
  ), 1.0)
})()
```
````

::right::

<div class="h-[340px] rounded-lg border border-white/10">
  <ShapesDemo :step="31 + colorNodeClicks.filter(c => $clicks >= c).length" />
</div>

<!--
The colors are right, but the flat areas look digital. The last step puts paper grain on top. The grain is a small noise image, 256 by 256 pixels. RepeatWrapping tiles it.

[click] grainNoise reads the texture in object space. It takes positionLocal x and y, times 0.01, so one tile is 100 world units, on the V and on the circle. The geometry UVs would stretch it differently on each shape. x also scrolls with time, so the grain drifts slowly, like dust on the water.

[click] Here is the raw grain, alone, on the circle. One gotcha: a texture() node captures its sampler when the node is built. If you build the material before the image loads, the shader samples an empty texture forever. So the materials wait for the texture.

[click] We do not add the grain on top. We blend it with soft light, the Photoshop blend mode. Below 0.5 the grain darkens a little, like a weak multiply. Above 0.5 it lightens a little, like a weak screen. At 0.5 it does nothing. It never pushes a channel past 0 or 1, so the palette keeps its identity. select is a per-channel ternary: the GPU computes both branches, and the boolean picks one.

[click] mix is the layer opacity, like the opacity slider of a Photoshop layer.

[click] Both materials end the same way: 70% soft light, 30% the clean color. Look at the flat areas. The original GLSL also did a manual gamma correction after this. The WebGPU renderer handles the output color space, so that line is gone. If your port looks washed out, you probably correct twice.
-->

<style>
/* The soft light lines are long, they must fit next to the demo */
.slidev-layout {
  --slidev-code-font-size: 10px;
  --slidev-code-line-height: 1.4;
}
</style>

---
layout: intro
section: '06'
eyebrow: Lessons
---

# What I learned

---

# Takeaways

<v-clicks>

- **TresJS + WebGPU** is a great combo for creative Vue development
- You can carry the soul of an art technique into a shader
- The creativity is ours, always

</v-clicks>

<!--
[click] TresJS gives us the Vue way of working: components, reactivity, the DevTools. TSL and WebGPU give us the shaders, in JavaScript, with no strings of GLSL. Together, they make creative Vue development feel natural.

[click] Suminagashi is a technique that is hundreds of years old. Ink that floats on water, two brushes, a breath of air. We did not copy a picture of it. We copied how it behaves: the rings, the flow, the colors. That is the soul of the technique, and a shader can carry it.

[click] The tools help us, and they will change. But the idea, the eye, the decision of what is beautiful, that comes from us. That creativity is ours, always.
-->

---

# Links

<LinkCards
  :links="[
    { title: 'Slides', url: 'https://vuefesjapan-2026.alvarosabu.dev/' },
    { title: 'TresJS', url: 'https://tresjs.org' },
    { title: 'Portfolio', url: 'https://alvarosabu.dev' },
  ]"
/>

---
layout: cover
---

# ありがとうございます

Questions?
