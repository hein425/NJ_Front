<template>
  <div class="diary-form">
    <form @submit.prevent="submitDiary">
      <!-- 녹음 상태 모달 -->
      <div v-if="isRecording" class="modal-overlay">
        <div class="modal">
          <p>마이크에 입력하고 싶은 음성을 녹음하세요</p>
          <p>녹음 중입니다...🎙️</p>
          <button @click="stopRecording" class="stop-recording-button">녹음 중지</button>
        </div>
      </div>

      <!-- 녹음 제목 쪽 - 기본 숨김 -->

      <div class="language-recording-container" v-if="isRecordingMenuVisible">
        <!-- 닫기 버튼 -->
        <button type="button" class="close-button" @click="closeLanguageRecordingContainer"><strong>X</strong></button>
        <!-- 언어 선택 -->
        <div class="row">
          <label style="width: 80px; margin-bottom: 5px">언어 선택</label>
          <div class="language-options">
            <button v-for="(lang, index) in languages" :key="index" :class="{ 'active-lang': selectedLanguage === lang.code }" @click="changeLanguage(lang.code)" type="button">
              {{ lang.name }}
            </button>
          </div>
        </div>
        <button type="button" @click="startRecording('title')" class="play-button">녹음하기⏺️</button>
        <button type="button" @click="playText('title')" class="play-button">듣기▶️</button>
      </div>

      <!-- 녹음 본문 쪽쪽- 기본 숨김 -->
      <div class="language-recording-container-memo" v-if="isMemoRecordingMenuVisible">
        <!-- 닫기 버튼 -->
        <button type="button" class="close-button" @click="closeMemoLanguageRecordingContainer"><strong>X</strong></button>
        <!-- 언어 선택 -->
        <div class="row">
          <label style="width: 80px; margin-bottom: 5px">언어 선택</label>
          <div class="language-options">
            <button v-for="(lang, index) in languages" :key="index" :class="{ 'active-lang': selectedLanguage === lang.code }" @click="changeLanguage(lang.code)" type="button">
              {{ lang.name }}
            </button>
          </div>
        </div>
        <div class="button-container">
          <!-- 시작하기 버튼 -->
          <button type="button" @click="startRecording('description')" class="play-button">녹음하기⏺️</button>
          <button type="button" @click="playText('description')" class="play-button">듣기▶️</button>
        </div>
      </div>

      <!-- Title과 Category -->
      <div class="row">
        <div class="title-category-row">
          <div class="title-section">
            <label for="title" style="width: 50px">제목</label>

            <button type="button" @click="toggleRecordingMenu" class="split-button tooltip-btn" data-tooltip="음성으로 입력하기">
              <span class="split-button-icon"><i class="fa-solid fa-microphone"></i></span>
            </button>

            <input id="title" v-model="title" class="input-field" @input="checkTitleLength" />
          </div>

          <div class="category-section">
            <select v-model="category" id="category" class="input-field tooltip-btn" data-tooltip="카테고리" style="width: 114px">
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
        <label for="description" style="width: 80px; display: flex; gap: 10px"
          >내용
          <button type="button" @click="toggleMemoRecordingMenu" class="split-button tooltip-btn" data-tooltip="음성으로 입력하기">
            <span class="split-button-icon"><i class="fa-solid fa-microphone"></i></span>
          </button>
        </label>

        <textarea id="description" v-model="description" placeholder="Enter your note" class="input-field textarea-field"></textarea>
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
        <button type="submit" class="submit-button tooltip-btn" data-tooltip="저장">
          <font-awesome-icon :icon="['fas', 'check']" style="font-size: 24px; color: white" />
        </button>

        <!-- 취소 버튼 -->
        <button type="button" @click="cancelForm" class="cancel-button tooltip-btn" data-tooltip="취소">
          <font-awesome-icon :icon="['fas', 'times']" style="font-size: 24px; color: white" />
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { BASE_URL } from '@/config';
import { useAuthStore } from '@/stores/authStore';
import BaseModal from './BaseModal.vue';
import 'tippy.js/dist/tippy.css';
import tippy from 'tippy.js';
import { toRaw } from 'vue';

const props = defineProps({
  selectedDate: String,
});

const emit = defineEmits(['closeForm', 'updateList']);

const title = ref('');
const showTitleLimitModal = ref(false);
const showEmptyTitleModal = ref(false);
const showSuccessModal = ref(false);

const date = ref(props.selectedDate || '');
const description = ref('');
const category = ref('DAILY');
const share = ref('ALL'); // 공개 범위 설정
const images = ref([]); // 이미지 리스트
const friends = ref([]); // 친구 목록
const selectedFriends = ref([]); // 선택한 친구 목록

const isRecording = ref(false); // 녹음 상태
const recordingField = ref(null); // 현재 녹음 중인 필드 ('title' 또는 'content')
let recognition = null; // SpeechRecognition 객체 초기화
const selectedLanguage = ref('ko-KR'); // 기본 언어: 한국어
const isRecordingMenuVisible = ref(false);
const isMemoRecordingMenuVisible = ref(false); // 메모 녹음 메뉴 상태

const authStore = useAuthStore();

// 메모 언어 선택 및 듣기 버튼 컨테이너 닫기
const closeMemoLanguageRecordingContainer = () => {
  isMemoRecordingMenuVisible.value = false;
};
const closeLanguageRecordingContainer = () => {
  isRecordingMenuVisible.value = false; // 메뉴 닫기
};
// 메모 메뉴 토글
const toggleMemoRecordingMenu = () => {
  isMemoRecordingMenuVisible.value = !isMemoRecordingMenuVisible.value;
};
// 메뉴 토글 함수
const toggleRecordingMenu = () => {
  isRecordingMenuVisible.value = !isRecordingMenuVisible.value;
};

// 지원 언어 목록
const languages = ref([
  { name: '한국어', code: 'ko-KR' },
  { name: '영어', code: 'en-US' },
  { name: '일본어', code: 'ja-JP' },
  { name: '중국어', code: 'zh-CN' },
]);

// 녹음 시작
const startRecording = field => {
  if (isRecording.value) {
    alert('이미 녹음 중입니다.');
    return;
  }

  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
    alert('Web Speech API를 지원하지 않는 브라우저입니다.');
    return;
  }

  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = selectedLanguage.value;

  isRecording.value = true;
  recordingField.value = field;

  recognition.onresult = event => {
    const transcript = Array.from(event.results)
      .map(result => result[0].transcript)
      .join('');
    if (field === 'title') {
      title.value += transcript;
    } else if (field === 'description') {
      description.value += transcript;
    }
  };

  recognition.onend = () => {
    isRecording.value = false;
    recordingField.value = null;
  };

  recognition.onerror = error => {
    console.error('SpeechRecognition Error:', error);
    isRecording.value = false;
    recordingField.value = null;
  };

  recognition.start();
};

// 녹음 중지
const stopRecording = () => {
  if (!isRecording.value || !recognition) {
    alert('녹음 중이 아닙니다.');
    return;
  }

  recognition.stop();
  isRecording.value = false;
  recordingField.value = null;
};

// 텍스트 읽기
const playText = field => {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance();

  utterance.lang = selectedLanguage.value;
  utterance.text = field === 'title' ? title.value : description.value;

  synth.speak(utterance);
};

// 언어 변경
const changeLanguage = langCode => {
  selectedLanguage.value = langCode;
};

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
// 새로운 loadFriends 함수
const loadFriends = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/friend/${authStore.idx}/list`);
    console.log('API 응답 데이터:', response.data); // 응답 데이터 구조 확인
    friends.value = response.data.map(friend => ({
      idx: friend.idx || friend.userId, // API 데이터의 키 확인 후 수정
      userName: friend.userName,
      profileImageUrl: `${BASE_URL}${friend.profileImageUrl}`,
    }));
    console.log('로드된 친구 목록:', friends.value);
  } catch (error) {
    console.error('Failed to load friends:', error);
  }
};

// 공개 범위 변경
const handleShareChange = () => {
  console.log('공개 범위 변경:', share.value);
  if (share.value !== 'CHOOSE') {
    selectedFriends.value = []; // 초기화
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
    content: description.value,
    category: category.value,
    share: share.value || 'ALL',
    calendarIdx: authStore.calendarIdx,
    friendIdxList: share.value === 'CHOOSE' ? toRaw(selectedFriends.value) : null,
  };

  console.log('Diary Request:', diaryRequest); // 서버로 보내는 데이터 확인

  const formData = new FormData();
  formData.append('diaryRequest', new Blob([JSON.stringify(diaryRequest)], { type: 'application/json' }));

  if (images.value.length > 0) {
    images.value.forEach(image => {
      formData.append('imageFiles', image.file);
    });
  } else {
    formData.append('imageFiles', new Blob([], { type: 'application/octet-stream' })); // 빈 필드 추가
  }

  try {
    const response = await axios.post(`${BASE_URL}/diary/create`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Diary saved:', response.data);
    console.log('전송된 friendIdxList:', diaryRequest.friendIdxList); // 디버깅용
    console.log('친구 목록:', friends.value);

    showSuccessModal.value = true; // 저장 성공 모달 표시
  } catch (error) {
    console.error('Failed to save diary:', error.response?.data || error.message);
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
onMounted(() => {
  const buttons = document.querySelectorAll('.tooltip-btn');

  buttons.forEach(button => {
    const tooltipContent = button.getAttribute('data-tooltip');
    tippy(button, {
      content: tooltipContent,
      interactive: true,
      trigger: 'mouseenter',
      duration: [300, 300],
      theme: 'light',
    });
  });
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
  padding-left: 0;
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

/* 녹음관련 css */

/* 녹음 상태 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.3s ease-in-out;
}

.modal p {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 20px;
}

.stop-recording-button {
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.stop-recording-button:hover {
  background-color: #d32f2f;
}

/* 언어 선택 및 듣기 버튼 */
.language-options {
  display: flex;
  gap: 10px;
}

.language-options button {
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  background-color: #fff;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.language-options button.active-lang {
  background-color: #555;
  color: white;
  font-weight: bold;
}

.language-options button:hover {
  background-color: #f0f0f0;
}

/* 언어 선택 및 듣기 버튼 컨테이너 */
.language-recording-container,
.language-recording-container-memo {
  position: absolute;
  top: 0%;
  left: 550px;
  width: 350px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  z-index: 1000;
  animation: slideIn 0.3s ease-in-out;
}

.language-recording-container {
  top: 0%;
}

.language-recording-container-memo {
  top: 64%;
}

/* 닫기 버튼 */
.language-recording-container .close-button,
.language-recording-container-memo .close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: transparent;
  border: none;
  font-size: 16px;
  color: #ff4d4d;
  cursor: pointer;
  transition: color 0.3s ease;
}

.language-recording-container .close-button:hover,
.language-recording-container-memo .close-button:hover {
  color: #d32f2f;
}

/* 듣기 버튼 */
.play-button {
  margin-top: 10px;
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  background-color: #fff;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.play-button:hover {
  background-color: #f0f0f0;
}

.play-button:active {
  box-shadow:
    0 1px 1px rgba(0, 0, 0, 0.1),
    0 1px 0 #999;
  transform: translateY(2px); /* 눌리는 효과 */
}

/* 슬라이드 애니메이션 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 페이드 인 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.split-button-icon {
  color: #555;
  font-size: 15px; /* 아이콘 크기 */
}
.split-button:hover {
  background: #ddd;
  border-color: #888;
}
.split-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom, #f6f6f6, #e0e0e0);
  border: 1px solid #aaa;
  border-radius: 5px;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  width: 30px;
  height: 30px;
  padding: 0;
  transition: all 0.3s ease;
}
</style>
