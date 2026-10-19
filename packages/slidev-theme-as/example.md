---
theme: ./
title: Animating Grass with Wind in TSL
colorSchema: dark
layout: cover
eyebrow: Talk
event: Vue.js Amsterdam · 2026
bgControls: true
---

# Animating Grass with Wind in TSL

10,000 instanced blades bending in a noise-driven wind field, on WebGPU with Three.js Shading Language.

---
layout: intro
section: '02'
eyebrow: Part two
---

# A wind field, not per-blade jitter

One noise texture drives every blade. Neighbours agree, so the field reads as weather instead of static.

---

# Why per-vertex wind is cheap

- One `mx_noise_float` sample per blade, not per vertex
- Lean scales with `tipness`, so roots stay planted
- `.min(height.mul(0.35))` clamps the drop on violent gusts
- All of it runs in the vertex stage, zero CPU per frame

---
layout: two-cols
title: The downwind lean
---

```ts [wind.ts]
const windDir = vec2(
  cos(WIND_ANGLE), sin(WIND_ANGLE)
)

const gust = mx_noise_float(
  worldPos.xz.mul(0.08)
    .add(windDir.mul(time.mul(0.6)))
)

const lean = gust
  .mul(tipness)
  .mul(STRENGTH)

pos.xz.addAssign(windDir.mul(lean))
```

::right::

<div class="pt-[26px]">

Noise is sampled in **world space** and scrolled along the wind direction, so the gust travels across the field.

`tipness` is 0 at the root and 1 at the tip. Multiplying by it keeps the base fixed.

<p class="meta">Only the last line runs per frame.</p>

</div>

---
layout: two-cols
title: 'Live: strength and frequency'
cols: 1fr 1.15fr
---

```vue [GrassField.vue]
<template>
  <TresCanvas renderer="webgpu">
    <TresPerspectiveCamera
      :position="[0, 4, 9]" />
    <GrassField
      :count="10_000"
      :wind-strength="0.6"
      :wind-frequency="0.08" />
  </TresCanvas>
</template>
```

::right::

<div class="card aspect-[4/3]">
  <span class="card-label top-right">webgpu · 10,000 blades</span>
  <span class="card-label">drag to orbit</span>
</div>

---
layout: two-cols
title: Where the wind idea came from
cols: 1fr 1.1fr
valign: center
---

Real grass does not jitter. A gust arrives, the field leans together, and the wave rolls past.

<div class="list-sm">

- Neighbours move together
- Tips travel further than roots
- The wave has a direction

</div>

<p class="meta">Namba Yasaka Shrine, Osaka · 2025</p>

::right::

<figure>
  <img class="card aspect-[4/3]" src="/namba-shrine.jpg" alt="Namba Yasaka Shrine in Osaka, a giant lion head stage">
  <figcaption>Same 1px border and 6px radius as code blocks and scenes</figcaption>
</figure>

---
layout: blackboard
eyebrow: Result
title: 10,000 blades, one noise sample each
meta: WebGPU · 120 fps on M2
---

<div class="w-full h-full bg-[radial-gradient(ellipse_at_50%_80%,#2f5a24,#0a0a0a_70%)]" />

---
layout: presenter
image: /alvaro.jpg
---

# Hi, I'm Alvaro

- 🇻🇪 in 🇪🇸 since 2013
- Dad of 2 🐈 🐈‍⬛
