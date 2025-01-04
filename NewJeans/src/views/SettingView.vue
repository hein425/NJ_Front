<template>
  <div class="settings-container">
    <!-- 프로필 섹션 -->
    <div class="profile-section">
      <div class="profile-image-container">
        <img :src="profileImage && profileImage !== 'undefined' ? profileImage : defaultProfileImage" alt="Profile Image" class="profile-image" />
        <button @click="openFilePicker" class="change-img-btn">프로필 사진 변경</button>
        <input type="file" ref="fileInput" @change="handleFileChange" style="display: none" accept="image/*" />
      </div>

      <div class="profile-details">
        <div class="name-edit">
          <h1 v-if="!isEditingName" class="profile-name">{{ userName }}</h1>
          <input v-else v-model="newUserName" class="name-input" placeholder="새 닉네임 입력" />
          <button @click="isEditingName ? saveUserName() : startEditingName()" class="edit-btn">
            {{ isEditingName ? '저장' : '닉네임 변경' }}
          </button>
        </div>

        <p class="profile-email">{{ email }}</p>
        <div class="delete-section">
          <div class="delete-container">
            <div class="delete-text-container">
              <button @click="deleteAccount" class="delete-btn">내 계정 삭제</button>
              <p class="delete-description">계정을 영구적으로 삭제하고 모든 워크 스페이스에서 액세스 권한을 제거합니다.</p>
            </div>
            <span class="delete-arrow">›</span>
          </div>
        </div>

            <!-- 언어 선택 섹션 -->
            <div class="language-section">
    <div class="row">
      <label class="holiday-label">공휴일 언어 선택</label>
      <div class="language-options">
        <button
          v-for="(lang, index) in languages"
          :key="index"
          :class="{ 'active-lang': selectedLanguage === lang.code }"
          @click="changeLanguage(lang.code)"
          type="button"
        >
          {{ lang.name }}
        </button>
      </div>
    </div>
  </div>


        <!-- 닉네임 변경 완료 모달 -->
        <BaseModal :visible="showNickEditModal" :message="'닉네임이 변경되었습니다.'" @close="() => closeModal('nickEdit')" class="modal-Nick-edit" />
        <!-- 프로필 변경 완료 모달 -->
        <BaseModal :visible="showProfileEditModal" :message="'프로필사진이 변경되었습니다.'" @close="() => closeModal('profileEdit')" class="modal-profile-edit" />
      </div>
    </div>

    <!-- 테마 선택 섹션 -->
    <div class="theme-section">
      <div class="theme-header">
        <h4>Theme</h4>
        <p>{{ selectedTheme }}</p>
      </div>
      <div class="theme-options">
        <label v-for="(theme, index) in themes" :key="index" class="theme-box">
          <input type="radio" name="theme" :value="theme.value" v-model="selectedTheme" class="radio-input" />
          <div class="theme-preview">
            <img :src="theme.icon" alt="Theme Icon" class="theme-icon" />
          </div>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';
import lightLogo from '@/assets/logo2.png'; // Light 테마 로고
import darkLogo from '@/assets/logo_white.png'; // Dark 테마 로고
import { BASE_URL } from '@/config';
import BaseModal from '@/components/BaseModal.vue';
// import { useRouter } from 'vue-router';

// 테마 관련 이미지 가져오기
import whiteIcon from '@/assets/white_icon.jpg';
import darkIcon from '@/assets/dark_icon.jpg';
import pinkBackground from '@/assets/flowers-3435886_1920.jpg';
import skyBackground from '@/assets/sky-5534319_1920.jpg';
import flowersIcon from '@/assets/flowers_icon.jpg';
import skyIcon from '@/assets/sky_icon.jpg';
import { useCountryStore } from '@/stores/countryStore';
import { faL } from '@fortawesome/free-solid-svg-icons';

const authStore = useAuthStore();
const userName = computed(() => authStore.userName);
const email = computed(() => authStore.email);
const profileImage = computed(() => authStore.profileImageUrl);
const isEditingName = ref(false);
const newUserName = ref(userName.value);
const fileInput = ref(null);
const selectedTheme = ref('Light'); // 기본 테마
const showNickEditModal = ref(false);
const showProfileEditModal = ref(false);
// const router = useRouter();/

const languages = ref([
  { code: 'KR', name: '한국' },
  { code: 'US', name: 'U.S.A' },
  { code: 'JP', name: '日本' },
  { code: 'CN', name: '中国' },
]);

// Pinia store로 관리
const countryStore = useCountryStore();
const selectedLanguage = ref(countryStore.countryCode);

// 언어 변경
const changeLanguage = (code) => {
  selectedLanguage.value = code;
  countryStore.setCountryCode(code); // 상태 업데이트
};

const startEditingName = () => {
  isEditingName.value = true;
  newUserName.value = userName.value;
};

const saveUserName = async () => {
  const sanitizedUserName = newUserName.value.replace(/\s/g, '');
  if (!sanitizedUserName) {
    alert('닉네임에 공백을 포함할 수 없습니다.');
    return;
  }
  try {
    await axios.put(`${BASE_URL}/user/updateUserName`, { idx: authStore.idx, userName: sanitizedUserName });
    authStore.userName = sanitizedUserName;
    isEditingName.value = false;
    showNickEditModal.value = true;
  } catch (error) {
    console.error('닉네임 저장 중 오류:', error);
  }
};

// 모달 닫기 로직은 부모가 담당
const closeModal = modalName => {
  if (modalName === 'nickEdit') showNickEditModal.value = false;
  if (modalName === 'profileEdit') showProfileEditModal.value = false;
};

const fetchProfileImage = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/user/profileImage/${authStore.idx}`);
    authStore.profileImageUrl = `${BASE_URL}${response.data}?timestamp=${new Date().getTime()}`; // 캐시 방지
    localStorage.setItem('profileImageUrl', authStore.profileImageUrl);
  } catch (error) {
    console.error('프로필 이미지 가져오기 실패:', error);
  }
};

const handleFileChange = async event => {
  const file = event.target.files[0];
  if (file) {
    await uploadProfileImage(file);
    fetchProfileImage(); // 업로드 후 최신 이미지 가져오기
  }
};

const uploadProfileImage = async file => {
  const formData = new FormData();
  formData.append('imageFiles', file);

  try {
    await axios.post(`${BASE_URL}/user/updateProfileImage/${authStore.idx}`, formData);
    showProfileEditModal.value = true;
  } catch (error) {
    console.error('프로필 이미지 업로드 중 오류:', error);
  }
};

const openFilePicker = () => fileInput.value.click();

const themes = [
  { value: 'Light', label: 'Light Theme', backgroundColor: '#f5f5f5', icon: whiteIcon },
  { value: 'Dark', label: 'Dark Theme', backgroundColor: '#242424', icon: darkIcon },
  { value: 'Pink', label: 'Pink Theme', backgroundImage: pinkBackground, icon: flowersIcon },
  { value: 'Sky', label: 'Sky Theme', backgroundImage: skyBackground, icon: skyIcon },
];

// 테마 적용 함수
const applyTheme = () => {
  document.documentElement.classList.remove('Light-theme', 'Dark-theme', 'Pink-theme', 'Sky-theme');
  document.documentElement.classList.add(`${selectedTheme.value}-theme`);

  const selected = themes.find(theme => theme.value === selectedTheme.value);

  if (selected) {
    const rootStyle = document.documentElement.style;
    if (selected.backgroundColor) {
      rootStyle.backgroundColor = selected.backgroundColor;
      rootStyle.backgroundImage = 'none';
    } else if (selected.backgroundImage) {
      rootStyle.backgroundColor = 'transparent';
      rootStyle.backgroundImage = `url(${selected.backgroundImage})`;
    }
  }

  const logoElement = document.querySelector('.logo img');
  if (logoElement) {
    // Dark, Pink, Sky 테마일 때는 darkLogo, Light 테마일 때는 lightLogo 사용
    logoElement.src = ['Dark', 'Pink', 'Sky'].includes(selectedTheme.value) ? darkLogo : lightLogo;
  }

  // 테마를 localStorage에 저장
  localStorage.setItem('selectedTheme', selectedTheme.value);
};

// 테마 변경 감지
watch(selectedTheme, () => {
  applyTheme();
});

// 초기화
onMounted(() => {
  const savedTheme = localStorage.getItem('selectedTheme') || 'Light';
  selectedTheme.value = savedTheme;
  applyTheme();
  fetchProfileImage();
});

const deleteAccount = async () => {
  try {
    await axios.delete(`${BASE_URL}/user/delete/${authStore.email}`, {
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
    });
    authStore.logout();
    alert('계정이 삭제되었습니다.');
  } catch (error) {
    console.error('계정 삭제 중 오류:', error);
    alert('계정을 삭제하는 중 문제가 발생했습니다.');
  }
};
</script>

<style scoped>
.settings-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background-color: var(--background-color);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 87.5%;
  height: 75vh;
  margin-left: 8.5vh;
  margin-top: 5.5vh;
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

.theme-section {
  width: 23vh;
  position: relative;
  right: 20.5%;
  bottom: 5%;
}

.theme-header {
  position: relative;
  left: 6.8vh;
  width: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.theme-header h4 {
  font-size: 1.2rem;
  font-weight: bold;
  margin-right: 10px;
}

.theme-header p {
  font-size: 1rem;
  color: var(--text-color);
}

.theme-options {
  position: absolute;
  left: 33%;
  width: 135%;
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.theme-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  margin: 5px;
}

.theme-preview {
  width: 50px;
  height: 50px;
  border-radius: 5px;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.radio-input {
  display: none;
}

.radio-input:checked + .theme-preview {
  border: 2px solid green;
}

.statistics-btn {
  position: relative;
  left: 4.5%;

  bottom: 8%;

  border: 1px solid var(--border-color);
  color: var(--button-text-color);
  border-radius: 20px;
  padding: 10px 20px;
  cursor: pointer;
  background-color: var(--button-background);
}

.statistics-btn:hover {
  background-color: var(--border-color);
}

.language-options {
  display: flex;
  gap: 10px;
}

.language-options button {
  padding: 8px 25px;
  border: 1px solid #ccc;
  border-radius: 20px;
  cursor: pointer;
  background-color: #fff;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.language-options button.active-lang {
  background-color: #444444;
  color: white;
  font-weight: bold;
}

/* 공휴일 선택 레이블 스타일 */
.holiday-label {
  font-size: 1.2rem; /* 텍스트 크기 */
  font-weight: bold; /* 굵은 텍스트 */
  color: #333; /* 기본 색상 */
  border-radius: 5px; /* 둥근 모서리 */
  display: inline-block; /* 텍스트에 여백 추가 */
  margin-bottom: 10px; /* 하단 여백 */
  margin-top: 20px;
}


</style>
