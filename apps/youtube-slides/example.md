---
theme: ./
colorSchema: dark
---

---
````md magic-move
```ts
cube.position.set(1, -4, 0);
```
```ts
<TresMesh name="cube" :position="[1, -4, 0]" />
```
````
---
````md magic-move

```ts
import { ShaderMaterial } from 'three';
```
```ts
import { ShaderMaterial } from 'three';

const material = new ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uColorA: { value: new Color('#6366f1') },
    uColorB: { value: new Color('#ec4899') },
  },
})
```
```ts
const material = new ShaderMaterial({
  vertexShader: `
  varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,
  fragmentShader: `
  uniform vec3 uColorA;
uniform vec3 uColorB;
varying vec2 vUv;
void main() {
  gl_FragColor = vec4(mix(uColorA, uColorB, vUv.y), 1.0);
}`,
  uniforms: {
    uColorA: { value: new Color('#6366f1') },
    uColorB: { value: new Color('#ec4899') },
  },
})
```
````

---

````md magic-move
```ts
material.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = { value: 0 }
}
```
```ts
material.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = { value: 0 }
  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    `
      #include <begin_vertex>
      transformed.y += sin(position.x * 10.0 + uTime) * 0.1;
    `
  )
}
```
````

---

````md magic-move

```ts
import { mix, positionLocal, uniform } from 'three/tsl'                                                            
import { Color, MeshStandardNodeMaterial } from 'three/webgpu'                                                     
                                                                                                                    
const material = new MeshStandardNodeMaterial()  
```
```ts
import { mix, positionLocal, uniform } from 'three/tsl'                                                            
import { Color, MeshStandardNodeMaterial } from 'three/webgpu'                                                     
                                                                                                                    
const material = new MeshStandardNodeMaterial()                                                                    
                                                                                                                    
const topColor = uniform(new Color('#6366f1'))                                                                     
const bottomColor = uniform(new Color('#ec4899'))

const factor = positionLocal.y.mul(0.5).add(0.5)

material.colorNode = mix(bottomColor, topColor, factor)
```
````

::right::

<v-click>

````md magic-move
```html
<template>
  <TresCanvas>
  </TresCanvas>
</template>
```
```html
<template>
  <TresCanvas>
    <TresPerspectiveCamera />
  </TresCanvas>
</template>
```
```html
<template>
  <TresCanvas>
    <TresPerspectiveCamera 
      :args="[75, aspectRatio, 0.1, 1000]" 
    />
  </TresCanvas>
</template>
```
````

</v-click>

---
layout: two-cols
---

````md magic-move

```ts
import { AmbientLight} from 'three';
```
```ts
const light = new AmbientLight(); // 💡
```

```ts
const light = new AmbientLight(); // 💡

light.color.set(0xffffff);
```

```ts
const light = new AmbientLight(); // 💡

light.color.set(0xffffff);
light.intensity = 0.5;
```
````

::right::

<v-click>

````md magic-move
```html
<template>
  <TresCanvas>
  </TresCanvas>
</template>
```
```html
<template>
  <TresCanvas>
    <TresAmbientLight />
  </TresCanvas>
</template>
```
```html
<template>
  <TresCanvas>
    <TresAmbientLight 
      :color="0xffffff"
      :intensity="0.5"
    />
  </TresCanvas>
</template>
```
````

</v-click>

---
layout: two-cols
---

````md magic-move

```ts
import { Mesh } from 'three';
```
```ts
const donut = new Mesh();
```
```ts
const donut = new Mesh(
  new TorusGeometry(1, 0.4, 16, 64), // Geometry
);
```
```ts
const donut = new Mesh(
  new TorusGeometry(1, 0.4, 16, 64), // Geometry
  new MeshNormalMaterial(), // Material
);
```
```ts
const donut = new Mesh(
  new TorusGeometry(1, 0.4, 16, 64), // Geometry
  new MeshNormalMaterial(), // Material
);

scene.add(donut);
```


````

::right::

<v-click>

````md magic-move
```html
<template>
  <TresCanvas>
  </TresCanvas>
</template>
```
```html
<template>
  <TresCanvas>
    <TresMesh>
    </TresMesh>
  </TresCanvas>
</template>
```
```html
<template>
  <TresCanvas>
    <TresMesh>
      <TresTorusGeometry :args="[1, 0.4, 16, 64]" />
    </TresMesh>
  </TresCanvas>
</template>
```
```html
<template>
  <TresCanvas>
    <TresMesh>
      <TresTorusGeometry :args="[1, 0.4, 16, 64]" />
      <TresMeshNormalMaterial />
    </TresMesh>
  </TresCanvas>
</template>
```
````

</v-click>


---
layout: two-cols
---

````md magic-move

```html
<template>
  <TresCanvas>
    <TresMesh>
      <TresTorusGeometry :args="[1, 0.4, 16, 64]" />
      <TresMeshNormalMaterial />
    </TresMesh>
  </TresCanvas>
</template>
```
````

::right::