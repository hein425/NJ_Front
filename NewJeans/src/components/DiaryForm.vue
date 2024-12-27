<template>
  <div class="diary-form">
    <form @submit.prevent="submitDiary">
      <!-- Title과 Category -->
      <div class="row">
        <div class="title-category-row">
          <div class="title-section">
            <label for="title" style="width: 50px">제목</label>
            <input id="title" v-model="title" class="input-field" @input="checkTitleLength" />
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

      <!-- 공개 범위 설정 -->
      <div class="row">
        <label for="share" style="width: 80px">공개 설정</label>
        <select v-model="share" id="share" class="input-field" @change="handleShareChange">
          <option value="ALL">전체공개</option>
          <option value="CHOOSE">친구공개</option>
          <option value="NONE">비공개</option>
        </select>
      </div>

      <!-- 친구 목록 (친구공개 선택 시 표시) -->
      <div v-if="share === 'CHOOSE'" class="friend-selection">
        <h4>공개할 친구 선택</h4>
        <div v-for="friend in friends" :key="friend.idx" class="friend-item">
          <input type="checkbox" :value="friend.idx" v-model="selectedFriends" />
          <span>{{ friend.userName }}</span>
        </div>
      </div>

      <!-- 제목 비어있음 경고 모달 -->
      <BaseModal :visible="showEmptyTitleModal" :message="'제목을 입력해주세요.'" @close="() => closeModal('emptyTitle')" class="modal-title-limit" />

      <!-- 제목 글자수 경고 모달 -->
      <BaseModal :visible="showTitleLimitModal" :message="'제목은 최대 50자까지 입력할 수 있습니다.'" @close="() => closeModal('titleLimit')" class="modal-empty-title" />

      <!-- 일정 저장 성공 모달 -->
      <BaseModal :visible="showSuccessModal" :message="'일기가 저장되었습니다.'" @close="() => closeModal('success')" class="modal-title-success" />

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
        <div class="image-section">
          <label for="image" style="width: 80px">이미지</label>
          <input id="image" type="file" @change="handleImageUpload" multiple class="input-field" />
        </div>
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
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { BASE_URL } from '@/config';
import { useAuthStore } from '@/stores/authStore';
import BaseModal from './BaseModal.vue';

const props = defineProps({
  selectedDate: String,
});

const emit = defineEmits(['closeForm', 'updateList']);

const title = ref('');
const showTitleLimitModal = ref(false);
const showEmptyTitleModal = ref(false);
const showSuccessModal = ref(false);

const date = ref(props.selectedDate || '');
const content = ref('');
const category = ref('DAILY');
const share = ref('ALL'); // 공개 범위 설정
const images = ref([]); // 이미지 리스트
const friends = ref([]); // 친구 목록
const selectedFriends = ref([]); // 선택한 친구 목록

const authStore = useAuthStore();

// 이미지 업로드 처리
const handleImageUpload = event => {
  const files = Array.from(event.target.files);
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      images.value.push({ file, url: e.target.result });
    };
    reader.readAsDataURL(file);
  });
  event.target.value = ''; // 입력 초기화
};

// 제목 길이 확인
const checkTitleLength = () => {
  if (title.value.length > 50) {
    showTitleLimitModal.value = true;
    title.value = title.value.slice(0, 50);
  }
};

// 모달 닫기 로직
const closeModal = modalName => {
  if (modalName === 'emptyTitle') showEmptyTitleModal.value = false;
  if (modalName === 'titleLimit') showTitleLimitModal.value = false;
  if (modalName === 'success') {
    showSuccessModal.value = false;
    emit('closeForm');
  }
};

// 친구 목록 로드
const loadFriends = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/friend/${authStore.idx}/list`);
    friends.value = response.data.map(friend => ({
      ...friend,
      profileImageUrl: `${BASE_URL}${friend.profileImageUrl}`,
    }));
  } catch (error) {
    console.error('Failed to load friends:', error);
  }
};

// 공개 범위 변경
const handleShareChange = () => {
  if (share.value !== 'CHOOSE') {
    selectedFriends.value = []; // 친구 선택 초기화
  }
};

// 다이어리 저장
const submitDiary = async () => {
  if (!title.value.trim()) {
    showEmptyTitleModal.value = true;
    return;
  }

  const diaryRequest = {
    title: title.value,
    date: date.value,
    content: content.value,
    category: category.value,
    share: share.value,
    calendarIdx: authStore.calendarIdx,
    friendIdxList: share.value === 'CHOOSE' ? selectedFriends.value : null,
  };

  const formData = new FormData();
  formData.append('diaryRequest', new Blob([JSON.stringify(diaryRequest)], { type: 'application/json' }));
  images.value.forEach(image => formData.append('imageFiles', image.file));

  try {
    const response = await axios.post(`${BASE_URL}/diary/create`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Diary saved:', response.data);
    showSuccessModal.value = true; // 저장 성공 모달 표시
  } catch (error) {
    console.error('Failed to save diary:', error);
    alert('일기 저장에 실패했습니다.');
  }
};

// 취소
const cancelForm = () => {
  title.value = '';
  content.value = '';
  date.value = '';
  category.value = 'DAILY';
  share.value = 'ALL';
  images.value = [];
  selectedFriends.value = [];
  emit('closeForm'); // 폼 닫기 이벤트
};

// 이미지 삭제
const removeImage = index => {
  images.value.splice(index, 1);
};

// 컴포넌트 로드시 친구 목록 로드
onMounted(() => {
  loadFriends();
});
</script>

<style scoped>
.diary-form {
  border: 1px solid #ccc;
  margin-top: 10vh;
  padding: 20px;
  border-radius: 10px;
  height: auto;
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

/* 입력 필드 스타일 */
.input-field {
  font-size: 1.05rem;
  color: #333;
  padding: 10px 12px; /* 양쪽 패딩을 추가하여 입력 필드 안의 텍스트 위치를 조정 */
  margin: 0 5px; /* 외부 마진을 적용하여 양쪽 밸런스를 맞추기 */
  width: calc(100% - 34px); /* 좌우 패딩과 마진을 포함하여 전체 넓이에 맞추기 */
}

.textarea-field {
  height: 220px;
  resize: none;
}

/* 이미지 미리보기 */
.image-preview {
  display: flex;
  flex-wrap: wrap; /* 여러 줄로 표시 */
  margin-top: 10px;
}

.image-container {
  margin: 5px;
  position: relative;
}

.image-container img {
  width: 100px;
  height: 100px;
  border: 1px solid #ddd;
  border-radius: 8px;
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

.delete-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: red;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.diary-form {
  border: 1px solid #ccc;
  margin-top: 10vh;
  padding: 25px;
  border-radius: 10px;
  background-color: #ffffff;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.row {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #e6e6e6;
  padding: 15px 0;
  font-weight: bold;
}

.title-category-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
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
  margin-bottom: 10px;
  font-weight: bold;
  font-size: 1rem;
  color: #333;
}

.input-field {
  border: 1px solid #ccc;
  padding: 12px;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;
}

.input-field:focus {
  border-color: #2196f3;
}

.textarea-field {
  height: 180px;
  resize: none;
}

/* 이미지 미리보기 스타일 */
.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.image-container {
  margin: 5px;
  position: relative;
}

.image-container img {
  width: 100px;
  height: 100px;
  border: 1px solid #ddd;
  border-radius: 8px;
  object-fit: cover;
}

.delete-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s ease;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

/* 버튼 행 스타일 */
.button-row {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.submit-button,
.cancel-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: none;
  font-size: 24px;
  transition: background-color 0.3s ease;
}

.submit-button {
  background-color: #343434;
  color: white;
}

.submit-button:hover {
  background-color: #505050;
}

.cancel-button {
  background-color: #808080;
  color: white;
}

.cancel-button:hover {
  background-color: #666666;
}

/* 파일 선택 버튼 스타일 */
input[type='file'] {
  display: none;
}

label[for='image'] {
  display: inline-block;
  padding: 10px 20px;
  background-color: #222222;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
  text-align: center;
}

label[for='image']:hover {
  background-color: #525151;
}
</style>
