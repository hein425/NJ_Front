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
            <select v-model="category" id="category" class="input-field" style="width: 114px">
              <option value="DAILY">#일기</option>
              <option value="GROWTH">#성장일지</option>
              <option value="EXERCISE">#운동</option>
              <option value="TRIP">#여행</option>
              <option value="ETC">#기타</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Date -->
      <div class="row">
        <label for="date" style="width: 80px">작성일</label>
        <input id="date" v-model="date" type="date" class="input-field" />
      </div>

      <!-- Note -->
      <div class="row">
        <label for="content" style="width: 80px">내용</label>
        <textarea id="content" v-model="content" placeholder="Enter your note" class="input-field textarea-field"></textarea>
      </div>

      <!-- 이미지 미리보기 -->
      <div class="row">
        <label for="image" style="width: 80px">이미지</label>
        <input id="image" type="file" @change="handleImageUpload" multiple class="input-field" />
      </div>

      <div class="image-preview">
        <div v-for="(image, index) in images" :key="index" class="image-container">
          <img :src="image.url" alt="Preview" />
          <button class="delete-btn" @click="removeImage(index)">X</button>
        </div>
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
import { BASE_URL } from '@/config';
import { useAuthStore } from '@/stores/authStore';

const props = defineProps({
  selectedDate: String,
});

const emit = defineEmits(['closeForm', 'updateList']);

const title = ref('');
const date = ref(props.selectedDate || '');
const content = ref('');
const category = ref('DAILY');
const images = ref([]); // 이미지 리스트

const authStore = useAuthStore();

const handleImageUpload = event => {
  const files = Array.from(event.target.files); // 선택한 모든 파일을 배열로 변환
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      images.value.push({ file, url: e.target.result }); // 이미지 파일과 URL을 모두 추가
    };
    reader.readAsDataURL(file);
  });
  event.target.value = ''; // 입력 초기화
};

const submitDiary = async () => {
  
  //제목없으면 얼럿 띄우고 중단
  if (!title.value.trim()) {
    alert("제목을 입력해주세요."); 
    return;
  }

  const diaryRequest = {
    title: title.value,
    date: date.value,
    content: content.value,
    category: category.value, 
    calendarIdx: authStore.calendarIdx,
  };

  const formData = new FormData();
  formData.append('diaryRequest', 
  new Blob([JSON.stringify(diaryRequest)], { type: 'application/json' }));

  // 이미지 파일 추가 여부를 확인
  if (images.value.length > 0) {
    images.value.forEach(image => {
      formData.append('imageFiles', image.file); // 이미지 파일 추가
    });
  } else {
    formData.append('imageFiles', new Blob([], { type: 'application/octet-stream' })); // 빈 Blob 추가
  }

  try {
    const response = await axios.post(`${BASE_URL}/diary/create`, formData, {
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

const removeImage = (index) => {
  images.value.splice(index, 1); // 선택한 이미지를 배열에서 제거
};

</script>


<style src="../../assets/styles/DiaryForm.css" scoped></style>


