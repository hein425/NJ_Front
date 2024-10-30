<template>
  <div class="settings-container">
    <!-- 프로필 섹션 -->
    <div class="profile-section">
      <div class="profile-image-container">
        <!-- 로그인한 사용자의 프로필 이미지 표시 -->
        <img :src="profileImage || defaultProfileImage" alt="Profile Image" class="profile-image" />
        <button @click="openFilePicker" class="change-img-btn">프로필 사진 변경</button>
        <!-- 숨겨진 파일 입력 -->
        <input type="file" ref="fileInput" @change="handleFileChange" style="display: none" accept="image/*" />
      </div>
      <div class="profile-details">
        <div class="name-edit">
          <!-- 로그인한 사용자의 닉네임 표시 및 수정 기능 -->
          <h1 v-if="!isEditingName" class="profile-name">{{ userName }}</h1>
          <input v-else v-model="newUserName" class="name-input" placeholder="새 닉네임 입력" />

          <button @click="isEditingName ? saveUserName() : startEditingName()" class="edit-btn">
            {{ isEditingName ? '저장' : '닉네임 변경' }}
          </button>
        </div>

        <!-- 로그인한 사용자의 이메일 표시 -->
        <p class="profile-email">{{ userEmail }}</p>

        <!-- 계정 삭제 섹션 -->
        <div class="delete-section">
          <div class="delete-container">
            <div class="delete-text-container">
              <button @click="deleteAccount" class="delete-btn">내 계정 삭제</button>
              <p class="delete-description">계정을 영구적으로 삭제하고 모든 워크 스페이스에서 액세스 권한을 제거합니다.</p>
            </div>
            <span class="delete-arrow">›</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 테마 선택 섹션 -->
    <div class="theme-section">
      <h4>Theme</h4>
      <div class="theme-options">
        <!-- 각 테마를 선택할 수 있는 radio 버튼과 연결 -->
        <label v-for="(theme, index) in themes" :key="index" class="theme-box">
          <input type="radio" name="theme" :value="theme.value" v-model="selectedTheme" class="radio-input" @change="applyTheme" />
          <div class="theme-preview"></div>
        </label>
      </div>
      <p>선택된 테마: {{ selectedTheme }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore'; // Pinia 스토어 가져오기
import defaultProfileImage from '@/assets/profile2.jpg'; // 기본 프로필 이미지
import axios from 'axios';

// Pinia 스토어 사용
const authStore = useAuthStore();
const userName = computed(() => authStore.userName); // 로그인한 사용자 이름
const userEmail = computed(() => authStore.email); // 로그인한 사용자 이메일
const profileImage = computed(() => authStore.profile); // 로그인한 사용자 프로필 이미지

// 상태 관리
const isEditingName = ref(false); // 닉네임 수정 중인지 여부
const newUserName = ref(userName.value); // 새 닉네임

// 닉네임 변경 시작 함수
const startEditingName = () => {
  isEditingName.value = true;
  newUserName.value = userName.value; // 기존 닉네임을 입력 필드에 설정
};

// 닉네임 저장 함수
const saveUserName = async () => {
  try {
    // 서버에 닉네임 업데이트 요청
    await axios.put('http://http://192.168.0.17:8080/update', { newUserName: newUserName.value });

    // 성공 시 Pinia 상태 업데이트
    authStore.userName = newUserName.value;
    isEditingName.value = false;
  } catch (error) {
    console.error('닉네임 저장 중 오류:', error);
  }
};

// 테마 데이터 및 선택된 테마 관리
const themes = [
  { value: 'light', label: 'Light Theme' },
  { value: 'dark', label: 'Dark Theme' },
  { value: 'pink', label: 'Pink Theme' },
  { value: 'sky', label: 'Sky Theme' },
];

const selectedTheme = ref(themes[0].value); // 초기 선택 테마

// 파일 입력 요소 참조
const fileInput = ref(null);

// 프로필 이미지 변경 핸들러
const openFilePicker = () => {
  fileInput.value.click();
};

// 파일 선택 후 변경 처리
const handleFileChange = async event => {
  const file = event.target.files[0];
  if (file) {
    // 파일을 미리 보기 및 업로드 처리 로직 (예: base64로 인코딩하여 미리보기)
    const reader = new FileReader();
    reader.onload = () => {
      authStore.profile = reader.result; // Pinia 스토어의 프로필 상태 업데이트
      uploadProfileImage(file); // 서버 업로드
    };
    reader.readAsDataURL(file);
  }
};

// 서버에 프로필 이미지 업로드
const uploadProfileImage = async file => {
  const formData = new FormData();
  formData.append('profileImage', file);

  try {
    const response = await axios.post('http://112.222.157.156:10004/update', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Profile image uploaded successfully:', response.data);
    // 성공 시 프로필 이미지 URL을 업데이트합니다.
    authStore.profile = response.data.profileImageUrl; // 예: 서버가 URL을 반환한다고 가정
  } catch (error) {
    console.error('Error uploading profile image:', error);
  }
};

// 테마 적용 함수
const applyTheme = () => {
  document.documentElement.classList.remove('light-theme', 'dark-theme', 'pink-theme', 'sky-theme');
  document.documentElement.classList.add(`${selectedTheme.value}-theme`);
};

// 클릭 이벤트 핸들러들
const editProfile = () => {
  console.log('닉네임 변경 클릭');
};

const deleteAccount = () => {
  console.log('계정 삭제 클릭');
};
</script>

<style scoped>
.settings-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background-color: var(--background-color);
  background-image: var(--background-image);
  background-repeat: var(--background-repeat);
  background-size: var(--background-size);
  background-position: var(--background-position);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 70%;
  height: 75vh;
  margin-left: 5vh;
}

.profile-section {
  display: flex;
  align-items: center;
  gap: 140px;
  margin-bottom: 30px;
  margin-top: 50px;
  margin-right: 50px;
  width: 85vh;
}

.profile-image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 100px;
}

.profile-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 20px;
  border: 1px solid var(--border-color);
  padding: 10px;
}

.change-img-btn {
  border: 1px solid var(--border-color);
  color: var(--button-text-color);
  border-radius: 20px;
  padding: 10px 15px;
  cursor: pointer;
  background-color: var(--button-background);
}

.change-img-btn:hover {
  background-color: var(--border-color);
}

.profile-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.name-edit {
  display: flex;
  align-items: center;
  gap: 10px;
}

.edit-btn {
  margin-left: 40px;
  margin-top: 10px;
  border: 1px solid var(--border-color);
  color: var(--button-text-color);
  border-radius: 20px;
  padding: 8px 15px;
  cursor: pointer;
  background-color: var(--button-background);
}

.profile-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-color);
  margin-bottom: 10px;
}

.profile-email {
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 20px;
}

/* 계정 삭제 섹션 스타일 */
.delete-section {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  width: 100%;
}

.delete-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.delete-text-container {
  display: flex;
  flex-direction: column;
}

.delete-btn {
  background: none;
  border: none;
  color: red;
  font-size: 1rem;
  cursor: pointer;
  flex-grow: 1;
  display: flex;
}

.delete-arrow {
  font-size: 1.5rem;
  color: gray;
  margin-left: 70px;
}

.delete-description {
  color: var(--text-color);
  font-size: 0.9rem;
  margin-top: 5px;
}

/* 테마 선택 섹션 */
.theme-section {
  width: 100%;
  margin-top: 50px;
}

.theme-section h4 {
  margin-bottom: 30px;
  font-size: 1.4rem;
  font-weight: bold;
  margin-left: 100px;
}

.theme-options {
  display: flex;
  gap: 50px;
  justify-content: center;
}

.theme-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.theme-preview {
  width: 150px;
  height: 150px;
  background-color: #e1e1e1;
  border-radius: 10px;
}

.radio-input {
  display: none;
}

.radio-input:checked + .theme-preview {
  border: 3px solid green;
}
</style>
