<!-- global-top.vue -->

<template>
  <footer
  v-if="$slidev.themeConfigs?.socials?.length > 0"
    class="absolute bottom-0 p-4 px-14 mt-auto flex justify-between items-center w-full text-dark font-mono dark:text-white z-10"
  >
    <!-- <div class="mb-0 flex items-center">
      <a
        :href="$slidev.themeConfigs.eventUrl"
        target="_blank"
      ><img
        :src="$slidev.themeConfigs.eventLogo"
        class="h-8 mr-4"
        alt="Event image"
      /></a>
    </div> -->
    <!-- <ul>
      <li v-for="social in $slidev.themeConfigs?.socials" :key="social.name">
        <a :href="social.url" target="_blank">@{{ social.name }}</a>
      </li>
    </ul> -->
  </footer>
</template>
