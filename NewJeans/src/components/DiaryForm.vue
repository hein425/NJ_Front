<template>
  <div class="diary-form">
    <form @submit.prevent="submitDiary">
      <!-- Title과 Category -->
      <div class="row">
        <div class="title-section">
          <label for="title">Title</label>
          <input id="title" v-model="title" class="input-field" />
        </div>

        <div class="category-section">
          <label for="category">Category</label>
          <select v-model="category" id="category" class="input-field">
            <option value="Daily">#일기</option>
            <option value="GROWTH">#성장일지</option>
            <option value="'EXERCISE">#운동</option>
            <option value="TRIP">#여행</option>
            <option value="ETC">#기타</option>
          </select>
        </div>
      </div>

      <!-- Date -->
      <div class="row">
        <div class="icon-label">
          <i class="icon-calendar"></i>
          <label for="date">Add Date</label>
        </div>
        <input id="date" v-model="date" type="date" class="input-field" />
      </div>

      <!-- Note -->
      <div class="row">
        <div class="icon-label">
          <i class="icon-note"></i>
          <label for="content">Add Note</label>
        </div>
        <textarea id="content" v-model="content" placeholder="Enter your note" class="input-field textarea-field"></textarea>
      </div>

      <div class="button-row">
        <!-- 저장 버튼 -->
        <button type="submit" class="submit-button">
          <font-awesome-icon :icon="['fas', 'check']" style="font-size: 24px; color: white" />
        </button>

        <!-- 취소 버튼 -->
        <button type="button" @click="cancelForm" class="cancel-button">
          <font-awesome-icon :icon="['fas', 'times']" style="font-size: 24px; color: white" />
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const props = defineProps({
  selectedDate: String,
});

const emit = defineEmits(['closeForm']);

const title = ref('');
const date = ref(props.selectedDate || '');
const content = ref('');
const category = ref('Daily'); // 선택된 카테고리

const submitDiary = async () => {
  const diaryData = {
    title: title.value,
    date: date.value,
    content: content.value,
    category: category.value,
    calendarsIdx: 1,
  };
  console.log(diaryData);
  try {
    const response = await axios.post('http://192.168.0.17:8080/diary/create', diaryData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Diary Submitted Successfully', response.data);
    emit('closeForm');
  } catch (error) {
    console.error('Failed to submit diary:', error);
  }
};
</script>

<style scoped>
.diary-form {
  border: 1px solid #ccc;
  margin-top: 10vh;
  padding: 20px;
  border-radius: 10px;
}

/* 전체 레이아웃 */
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ccc;
  padding: 10px 0;
}

.title-section {
  flex: 2;
}

.category-section {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.icon-label {
  display: flex;
  align-items: center;
  gap: 5px;
}

.icon-calendar::before {
  content: '\1F4C5'; /* Calendar icon */
}

.icon-note::before {
  content: '\270E'; /* Pencil icon */
}

/* 입력 필드 스타일 */
.input-field {
  border: none;
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  font-size: 1rem;
}

.textarea-field {
  height: 100px;
  resize: none;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.submit-button,
.cancel-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  font-size: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.submit-button {
  background-color: #343434;
  color: white;
}

.cancel-button {
  background-color: #808080;
  color: white;
}
</style>
