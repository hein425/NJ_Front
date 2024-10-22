<template>
  <div class="diary-form">
    <h2>다이어리 작성</h2>
    <form @submit.prevent="submitDiary">
      <!-- 다이어리 작성 폼 예시 -->
      <div>
        <label for="title">제목</label>
        <input id="title" v-model="title" />
      </div>
      <div>
        <label for="date">날짜</label>
        <input id="date" v-model="date" type="date" />
      </div>
      <div>
        <label for="content">내용</label>
        <textarea id="content" v-model="content"></textarea>
      </div>
      <button type="submit" @click="submitDiary()">저장</button>
    </form>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
import axios from 'axios'

const title = ref('')
const date = ref('')
const content = ref('')

const submitDiary = async () => {
  const diaryData = {
    title: title.value,
    date: date.value,
    content: content.value,
    "category": "DAILY",
    "calendarsIdx": 1
  }
  
  try {
    const response = await axios.post('http://localhost:8080/diary/create', diaryData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    console.log('Diary Submitted Successfully', response.data)
  } catch (error) {
    console.error('Failed to submit diary:', error)
  }
}
</script>

<style scoped>
/* 스타일링 */
.diary-form {
  padding: 20px;
  background-color: white;
  border-radius: 10px;
}
</style>