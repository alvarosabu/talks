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
```ts {6}
const cube = new Mesh(
  new BoxGeometry(1, 1, 1), // Geometry
  new MeshNormalMaterial(), // Material
);

cube.position.set(1, -4, 0);
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
```html {2,5}
<template>
    <TresMesh name="cube" :position="[1, -4, 0]">
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshNormalMaterial />
    </TresMesh>
</template>
```
````

</v-click>

---
layout: two-cols
---

````md magic-move

```ts
const cube = new Mesh(
  new BoxGeometry(1, 1, 1), // Geometry
  new MeshNormalMaterial(), // Material
);
```
```ts {6}
const cube = new Mesh(
  new BoxGeometry(1, 1, 1), // Geometry
  new MeshNormalMaterial(), // Material
);

cube.position.x = 1;
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
```html {2}
<template>
    <TresMesh name="cube" :position-x="1">
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshNormalMaterial />
    </TresMesh>
</template>
```
````

</v-click>

---
layout: two-cols
---

````md magic-move

```ts
const cube = new Mesh(
  new BoxGeometry(1, 1, 1), // Geometry
  new MeshNormalMaterial(), // Material
);
```
```ts {6}
const cube = new Mesh(
  new BoxGeometry(1, 1, 1), // Geometry
  new MeshNormalMaterial(), // Material
);

cube.rotation.set(Math.PI / 2, 0, Math.PI / 4);
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
```html {2-5}
<template>
    <TresMesh 
        name="cube" 
        :rotation="[Math.PI / 2, 0, Math.PI / 4]"
    >
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshNormalMaterial />
    </TresMesh>
</template>
```
````

</v-click>

---
layout: two-cols
---

````md magic-move

```ts
const cube = new Mesh(
  new BoxGeometry(1, 1, 1), // Geometry
  new MeshNormalMaterial(), // Material
);
```
```ts {6}
const cube = new Mesh(
  new BoxGeometry(1, 1, 1), // Geometry
  new MeshNormalMaterial(), // Material
);

cube.rotation.x = Math.PI / 2;
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
```html {2}
<template>
    <TresMesh name="cube" :rotation-x="Math.PI / 2">
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshNormalMaterial />
    </TresMesh>
</template>
```
````

</v-click>

---
layout: two-cols
---

````md magic-move

```ts
const cube = new Mesh(
  new BoxGeometry(1, 1, 1), // Geometry
  new MeshNormalMaterial(), // Material
);
```
```ts {6}
const cube = new Mesh(
  new BoxGeometry(1, 1, 1), // Geometry
  new MeshNormalMaterial(), // Material
);

cube.scale.setScalar(3);
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
```html {2}
<template>
    <TresMesh name="cube" :scale="3">
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshNormalMaterial />
    </TresMesh>
</template>
```
````

</v-click>

---
layout: two-cols
---

````md magic-move

```ts
const cube = new Mesh(
  new BoxGeometry(1, 1, 1), // Geometry
  new MeshNormalMaterial(), // Material
);
```
```ts {6}
const cube = new Mesh(
  new BoxGeometry(1, 1, 1), // Geometry
  new MeshNormalMaterial(), // Material
);

cube.scale.set(2, 2, 2);
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
```html {2}
<template>
    <TresMesh name="cube" :scale="[2, 2, 2]">
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshNormalMaterial />
    </TresMesh>
</template>
```
````

</v-click>

---
layout: two-cols
---

````md magic-move

```ts
const cube = new Mesh(
  new BoxGeometry(1, 1, 1), // Geometry
  new MeshNormalMaterial(), // Material
);
```
```ts {6}
const cube = new Mesh(
  new BoxGeometry(1, 1, 1), // Geometry
  new MeshNormalMaterial(), // Material
);

cube.scale.x = 2;
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
```html {2}
<template>
    <TresMesh name="cube" :scale-x="2">
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshNormalMaterial />
    </TresMesh>
</template>
```
````

</v-click>

---