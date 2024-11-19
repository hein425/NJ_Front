<template>
    <div class="title-category-row">
      <div class="title-section">
        <label for="title">제목</label>
        <input id="title" v-model="title" class="input-field" />
      </div>
      <div class="category-section">
        <select v-model="category" id="category" class="input-field">
          <option value="DAILY">#일기</option>
          <option value="GROWTH">#성장일지</option>
          <option value="EXERCISE">#운동</option>
          <option value="TRIP">#여행</option>
          <option value="ETC">#기타</option>
        </select>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps(['title', 'category']);
  defineEmits(['update:title', 'update:category']);
  </script>
  
  <style scoped>
 
 
  </style>
  