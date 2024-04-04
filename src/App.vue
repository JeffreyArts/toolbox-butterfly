<template >
  <site-menu></site-menu>
  <section class="outlet-full"><router-view /></section>
</template>


<script setup lang="ts">
import siteMenu from "./components/site-menu.vue"
</script>

<style src="./app.scss"></style>
