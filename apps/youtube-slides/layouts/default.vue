<template>
  <div
    class="slidev-layout"
    :class="{ grid: $attrs.center }"
  >
    <div class="my-auto z-10 relative">
        <slot></slot>
    </div>
    <NoisyBg/>
  </div>
</template>
  