<script setup>
import { RouterView } from 'vue-router';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import MenuBar2 from './components/MenuBar2.vue';
import HeaderTop from './components/HeaderTop.vue';
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
// import axios from 'axios';

// 테마 설정
const themes = [
  { value: 'Light', label: 'Light Theme', backgroundColor: '#f5f5f5', icon: 'src/assets/white_icon.jpg' },
  { value: 'Dark', label: 'Dark Theme', backgroundColor: '#242424', icon: 'src/assets/dark_icon.jpg' },
  { value: 'Pink', label: 'Pink Theme', backgroundImage: 'url("src/assets/flowers-3435886_1920.jpg")', icon: 'src/assets/flowers_icon.jpg' },
  { value: 'Sky', label: 'Sky Theme', backgroundImage: 'url("src/assets/sky-5534319_1920.jpg")', icon: 'src/assets/sky_icon.jpg' },
];

const authStore = useAuthStore();

onMounted(async () => {
  console.log('App.vue onMounted 실행');
  await authStore.restoreLogin();
  console.log('restoreLogin 실행 후 상태:', {
    isLoggedIn: authStore.isLoggedIn,
    userName: authStore.userName,
    profile: authStore.profile,
    email: authStore.email,
    idx: authStore.idx,
  });

  // 저장된 테마를 localStorage에서 불러와 적용
  const savedTheme = localStorage.getItem('selectedTheme');
  if (savedTheme) {
    document.documentElement.classList.remove('Light-theme', 'Dark-theme', 'Pink-theme', 'Sky-theme');
    document.documentElement.classList.add(`${savedTheme}-theme`);

    // 테마 속성 적용
    const theme = themes.find(t => t.value === savedTheme);
    const themeProperties = getComputedStyle(document.documentElement);

    if (theme) {
      if (theme.backgroundColor) {
        document.documentElement.style.backgroundColor = theme.backgroundColor;
        document.documentElement.style.backgroundImage = 'none';
      } else if (theme.backgroundImage) {
        document.documentElement.style.backgroundImage = theme.backgroundImage;
        document.documentElement.style.backgroundColor = 'transparent';
      }

      // 글자 색상 및 기타 속성 적용
      document.querySelectorAll('.menu-item, .sign-in').forEach(item => {
        item.style.color = themeProperties.getPropertyValue('--menu-text-color');
      });

      // MenuBar 배경색 적용
      document.querySelector('.nav_wrapper').style.backgroundColor = themeProperties.getPropertyValue('--menu-background-color');
    }
  }
});

const route = useRoute();
const isSignUpPage = computed(() => route.path === '/signupp');

// const requestData = {
//   senderId: 0,
//   receiverId: 0,
//   content: "string",
// };

// // axios 요청
// axios.post('http://localhost:50004/message/send', requestData, {
//   headers: {
//     'accept': '*/*',
//     'Content-Type': 'application/json',
//   },
// })
//   .then(response => {
//     console.log('Response:', response.data); // 성공 시 응답 데이터 출력
//   })
//   .catch(error => {
//     console.error('Error:', error.response ? error.response.data : error.message); // 에러 출력
//   });
</script>

<template>
  <HeaderTop v-if="!isSignUpPage" />
  <div class="app-layout">
    <MenuBar2 v-if="!isSignUpPage" />
    <div class="content-area">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
}

.content-area {
  padding: 0;
  width: 100%;
  margin-left: 8vh;
}
</style>
