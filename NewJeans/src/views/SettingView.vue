<template>
  <div class="settings-container">
    <!-- 프로필 섹션 -->
    <div class="profile-section">
      <div class="profile-image-container">
        <img :src="profileImage" alt="Profile Image" class="profile-image" />
        <button @click="changeProfileImage" class="change-img-btn">
          프로필 사진 변경
        </button>
      </div>
      <div class="profile-details">
        <div class="name-edit">
          <h1 class="profile-name">{{ userName }}</h1>
          <button @click="editProfile" class="edit-btn">닉네임 변경</button>
        </div>
        <p class="profile-email">{{ userEmail }}</p>

        <!-- 계정 삭제 섹션 -->
        <div class="delete-section">
          <div class="delete-container">
            <div class="delete-text-container">
              <button @click="deleteAccount" class="delete-btn">
                내 계정 삭제
              </button>
              <p class="delete-description">
                계정을 영구적으로 삭제하고 모든 워크 스페이스에서 액세스 권한을
                제거합니다.
              </p>
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
          <input
            type="radio"
            name="theme"
            :value="theme.value"
            v-model="selectedTheme"
            class="radio-input"
            @change="applyTheme"
          />
          <div class="theme-preview"></div>
          <!-- 테마 미리보기 -->
        </label>
      </div>
      <p>선택된 테마: {{ selectedTheme }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

// 사용자 정보
const userName = ref('건전한소환사이름')
const userEmail = ref('hhhii@gmail.com')
const profileImage = ref('https://via.placeholder.com/150')

// 테마 데이터 및 선택된 테마 관리
const themes = [
  { value: 'light', label: 'Light Theme' },
  { value: 'dark', label: 'Dark Theme' },
  { value: 'blue', label: 'Blue Theme' },
  { value: 'green', label: 'Green Theme' },
]

const selectedTheme = ref(themes[0].value) // 초기 선택 테마

// 다크 모드 적용 함수
const applyTheme = () => {
  // 기존 테마 제거
  document.documentElement.classList.remove(
    'light-theme',
    'dark-theme',
    'blue-theme',
    'green-theme',
  )

  // 선택된 테마 적용
  document.documentElement.classList.add(`${selectedTheme.value}-theme`)
}

// watch로 테마 변경을 감지하고 적용
watch(selectedTheme, applyTheme, { immediate: true })

// 함수들
const editProfile = () => {
  console.log('닉네임 변경 클릭')
}

const changeProfileImage = () => {
  console.log('프로필 사진 변경 클릭')
}

const deleteAccount = () => {
  console.log('계정 삭제 클릭')
}
</script>

<style scoped>
.settings-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background-color: var(--background-color); /* 배경색 */
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
  border: 1px solid var(--border-color); /* 테두리 색상 */
  padding: 10px;
}

.change-img-btn {
  border: 1px solid var(--border-color);
  color: var(--button-text-color);
  border-radius: 20px;
  padding: 10px 15px;
  cursor: pointer;
  background-color: var(--button-background); /* 버튼 배경 */
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
  color: var(--text-color); /* 텍스트 색상 */
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

/* 삭제 버튼과 설명을 묶는 컨테이너 */
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

/* 테마 선택 섹션 스타일 */
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
