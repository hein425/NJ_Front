
<template>
  <div class="diary-form">
    <h2>다이어리 작성</h2>
    <form @submit.prevent="submitDiary">
      
      <div>
        <label for="title">제목</label>
        <input id="title" v-model="title" />
      </div>

      <label for="category">카테고리</label>
      <select v-model="category" id="category">
          <option value="Daily">#일기</option>
          <option value="GROWTH">#성장일지</option>
          <option value="'EXERCISE">#운동</option>
          <option value="TRIP">#여행</option>
          <option value="ETC">#기타</option>
      </select>

      <div>
        <label for="date">날짜</label>
        <input id="date" v-model="date" type="date" />
      </div>

      <div>
        <label for="content">내용</label>
        <textarea id="content" v-model="content" placeholder="Enter your note"></textarea>
      </div>

      <button type="submit">저장</button>
      <button type="button" @click="cancelForm">취소</button>
    </form>
  </div>
</template>
 
<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter }from 'vue-router';
import dayjs from 'dayjs';


const props = defineProps({
  selectedDate: String,
});
// ㄴ 프롭스로 받은 선택날짜

const emit = defineEmits(['closeForm']);

const title = ref('');
const date = ref(props.selectedDate || '');
const content = ref('');
const category = ref('Daily');

const submitDiary = async () => {
  const diaryData = {
    title: title.value,
    date: date.value,
    content: content.value,
    category: category.value,
    calendarsIdx: 1,
  }
  console.log(diaryData); 
  try {
    const response = await axios.post(
      'http://localhost:8080/diary/create',
      diaryData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    console.log('Diary Submitted Successfully', response.data)
    emit('closeForm')
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
label {
  font-weight: bold;
}

input,
select,
textarea {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  padding: 10px 20px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 5px;
}

button:hover {
  background-color: #555;
}
</style>
