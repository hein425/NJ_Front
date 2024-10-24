<template>
    <div class="year-calendar-wrapper">
      <h1 class="year-title">{{ now.format('YYYY') }} Year Calendar</h1>
      <div class="year-grid">
        <div v-for="month in 12" :key="month" class="month-cell" @click="selectMonth(month)">
          <h3>{{ now.month(month - 1).format('MMMM') }}</h3>
        </div>
      </div>
      <button @click="goBackToToday" class="back-today-button">Today</button>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import dayjs from 'dayjs';
  
  const now = ref(dayjs());
  
  const selectMonth = (month) => {
    now.value = dayjs().month(month - 1); // 선택한 월로 이동
    console.log(`Selected Month: ${month}`);
  };
  
  const goBackToToday = () => {
    now.value = dayjs();
  };
  </script>
  
  <style scoped>
  .year-calendar-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: white;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    width: 80%;
    margin: auto;
  }
  
  .year-title {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 20px;
  }
  
  .year-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    text-align: center;
  }
  
  .month-cell {
    background-color: #f7f7f7;
    border-radius: 5px;
    padding: 20px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .month-cell:hover {
    background-color: #e0e0e0;
  }
  
  .back-today-button {
    margin-top: 30px;
    background-color: #333;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .back-today-button:hover {
    background-color: #555;
  }
  </style>
  