<template>
  <div
    class="slidev-layout default"
    :class="{ 'flex flex-col justify-center': $attrs.center }"
  >
    <div class="relative z-2">
      <slot />
    </div>
  </div>
</template>
