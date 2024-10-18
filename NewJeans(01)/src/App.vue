<script setup>
import { RouterLink, RouterView } from 'vue-router'
import MenuBar from './components/MenuBar.vue'
import CalendarGrid from './components/CalendarGrid.vue';
</script>

<template>
  <MenuBar> </MenuBar>
  <CalendarGrid class=""></CalendarGrid> 
  
  <RouterView />
</template>

<style scoped></style>
