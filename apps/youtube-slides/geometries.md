---
theme: ./
colorSchema: dark
layout: two-cols
---

````md magic-move

```ts
const cube = new Mesh(
  new BoxGeometry(1, 1, 1), // Geometry
  new MeshNormalMaterial(), // Material
);
```
```ts {2}
const cube = new Mesh(
  new BoxGeometry(1, 1, 1), // Geometry
  new MeshNormalMaterial(), // Material
);
```

````

::right::

<v-click>

````md magic-move
```html
<template>
    <TresMesh name="cube">
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshNormalMaterial />
    </TresMesh>
</template>
```
```html {3}
<template>
    <TresMesh name="cube">
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshNormalMaterial />
    </TresMesh>
</template>
```
```html
<template>
    <TresMesh 
        name="cube" 
        :geometry="new BoxGeometry(1, 1, 1)"
    >
        <TresMeshNormalMaterial />
    </TresMesh>
</template>
```
````
</v-click>

---
layout: blackboard
title: Geometries
---


