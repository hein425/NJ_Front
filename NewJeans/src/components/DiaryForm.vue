<template>
  <div class="diary-form">
    <form @submit.prevent="submitDiary">
      <!-- Title과 Category -->
      <div class="row">
        <div class="title-category-row">
          <div class="title-section">
            <label for="title" style="width: 50px">제목</label>
            <input id="title" v-model="title" class="input-field" />
          </div>

          <div class="category-section">
            <select v-model="category" id="category" class="input-field" style="width: 100px">
              <option value="DAILY">#일기</option>
              <option value="GROWTH">#성장일지</option>
              <option value="'EXERCISE">#운동</option>
              <option value="TRIP">#여행</option>
              <option value="ETC">#기타</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Date -->
      <div class="row">
        <div class="icon-label">
          <!-- <i class="icon-calendar"></i> -->
          <label for="date" style="width: 80px">작성일</label>
        </div>
        <input id="date" v-model="date" type="date" class="input-field" />
      </div>

      <!-- Note -->
      <div class="row">
        <div class="icon-label">
          <!-- <i class="icon-note"></i> -->
          <label for="content" style="width: 80px">내용</label>
        </div>
        <textarea id="content" v-model="content" placeholder="Enter your note" class="input-field textarea-field"></textarea>
      </div>
      
      <!-- 이미지추가 -->
      <div class="row">
        <label for="image" style="width: 80px">이미지</label>
        <input id="image" type="file" @change="handleImageUpload" class="input-field" />
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
const category = ref('DAILY');
const imageFiles = ref(null); // 이미지 파일 저장

// 이미지 업로드 핸들러
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    imageFiles.value = file;
  }
};

const submitDiary = async () => {
  const formData = new FormData();
  formData.append('title', title.value);
  formData.append('date', date.value);
  formData.append('content', content.value);
  formData.append('category', category.value);
  formData.append('calendarsIdx', 1);
  
  // 이미지 파일이 선택된 경우 FormData에 추가
  if (imageFiles.value) {
    formData.append('image', imageFiles.value);
  }

  try {
    const response = await axios.post('http://192.168.0.17:8080/diary/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Diary Submitted Successfully', response.data);
    emit('closeForm');
  } catch (error) {
    console.error('Failed to submit diary:', error);
    emit('closeForm');
  }
};

const cancelForm = () => {
  emit('closeForm');
};
</script>


<style scoped>
.diary-form {
  border: 1px solid #ccc;
  margin-top: 10vh;
  padding: 20px;
  border-radius: 10px;
  height: 550px;
}

/* 전체 레이아웃 */
.row {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #ccc;
  padding: 10px 0;
}

.title-category-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 2;
}

.category-section {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.diary-form label {
  margin-bottom: 15px;
  font-weight: bold;
}

.icon-label {
  display: flex;
  align-items: center;
  gap: 15px;
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
  height: 220px;
  resize: none;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
  margin-bottom: 10px;
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
