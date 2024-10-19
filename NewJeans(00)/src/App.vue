<script setup>
import { RouterLink, RouterView } from 'vue-router'
import MenuBar from './components/MenuBar.vue'
import HeaderTop from './components/HeaderTop.vue'
</script>

<template>
  <HeaderTop />
  <MenuBar />

  <RouterView />
</template>

<style scoped>

</style>
