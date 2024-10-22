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
        <div class="theme-box"></div>
        <div class="theme-box"></div>
        <div class="theme-box"></div>
        <div class="theme-box"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const userName = ref('건전한소환사이름')
const userEmail = ref('hhhii@gmail.com')
const profileImage = ref('https://via.placeholder.com/150')

// 프로필 수정, 프로필 이미지 변경, 계정 삭제를 위한 예시 함수
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
  background-color: white;
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
  align-items: center; /* 중앙 정렬 */
  margin-left: 100px;
}

.profile-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px; /* 버튼과 이미지 사이 간격 */
}

.change-img-btn {
  background-color: #333;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  cursor: pointer;
}

.change-img-btn:hover {
  background-color: #555;
}

.profile-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.name-edit {
  display: flex;
  align-items: center;
  gap: 10px; /* 닉네임과 변경 버튼 간격 */
}

.profile-name {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.profile-email {
  font-size: 1.5rem;
  font-weight: 500;
  color: black;
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
  justify-content: space-between; /* 텍스트와 화살표가 양 끝에 위치 */
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
  flex-grow: 1; /* 버튼이 가능한 넓은 영역 차지 */
  display: flex;
}

.delete-arrow {
  font-size: 1.5rem;
  color: gray;
  margin-left: 70px; /* 화살표를 버튼에서 떨어뜨리기 위한 마진 */
}

.delete-description {
  color: gray;
  font-size: 0.9rem;
  margin-top: 5px;
}

/* 테마 선택 섹션 스타일 */
.theme-section {
  width: 100%;
  margin-top: 70px;
}

.theme-section h4 {
  margin-bottom: 20px;
  font-size: 1.4rem;
  font-weight: bold;
  margin-left: 80px;
}

.theme-options {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.theme-box {
  width: 100px;
  height: 100px;
  border-radius: 10px;
  background-color: #e1e1e1;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.theme-box:hover {
  background-color: #ccc;
}
</style>
