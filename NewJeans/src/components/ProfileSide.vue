<template>
  <div class="profile">
    <div class="profile-container" v-if="isLoggedIn">
      <!-- 프로필 이미지와 사용자명을 함께 표시 -->
      <img :src="profileImage || defaultProfileImage" alt="Profile Picture" class="profile-image" />
      <p>Welcome, {{ userName }}!</p>
    </div>
    <div class="profile-container" v-else>
      <img :src="defaultProfileImage" alt="Default Profile Picture" class="profile-image" />
      <div class="welcome-text">
        <p class="f1">Welcome!</p>
        <p class="f2">로그인 후 이용해주세요</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { BASE_URL } from '@/config';
import defaultProfileImage from '@/assets/profile2.jpg';

const isLoggedIn = ref(false);
const userName = ref('');
const profileImage = ref(defaultProfileImage);

// 로그인 상태와 유저 정보를 확인하는 함수
const loadProfileData = async () => {
  try {
    // 로컬스토리지나 필요에 따라 유저 ID 불러오기 (임시로 6번 사용자로 설정)
    const userId = localStorage.getItem('userId') || 6;

    // 프로필 이미지 로드
    const response = await axios.get(`${BASE_URL}/user/profileImage/${userId}`);
    if (response.status === 200 && response.data) {
      profileImage.value = BASE_URL + response.data;
    } else {
      profileImage.value = defaultProfileImage;
    }

    // 유저명 로드 (필요 시 추가 데이터 로드 로직 포함)
    userName.value = localStorage.getItem('userName') || 'Guest';
    isLoggedIn.value = true;
  } catch (error) {
    console.error('프로필 데이터를 로드하는 중 오류 발생:', error);
  }
};

// 컴포넌트가 마운트되었을 때 프로필 데이터 로드
onMounted(() => {
  loadProfileData();
});
</script>

<style scoped>
.profile {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.profile-container {
  width: 230px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
}

.profile-image {
  border-radius: 50%;
  width: 100px;
  height: 100px;
  border: 1px solid #ccc;
  padding: 5px;
  box-sizing: border-box;
}

.welcome-text {
  text-align: center;
}
.f1 {
  font-weight: 600;
}
.f2 {
  color: #ccc;
}
</style>
