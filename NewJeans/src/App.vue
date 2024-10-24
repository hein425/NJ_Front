<script setup>
import { RouterLink, RouterView } from 'vue-router';
import { computed } from 'vue';
import { useRoute } from 'vue-router'; // 현재 경로 확인을 위해 추가
import MenuBar from './components/MenuBar.vue';
import HeaderTop from './components/HeaderTop.vue';
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

// 앱이 마운트될 때 로그인 상태 복원
onMounted(async () => {
  await authStore.restoreLogin();
});

const route = useRoute();

// 회원가입 페이지인지 여부 확인 ("/signupp" 경로)
const isSignUpPage = computed(() => route.path === '/signupp');
</script>

<template>
  <!-- 회원가입 페이지가 아닐 때만 HeaderTop과 MenuBar를 보여줌 -->
  <HeaderTop v-if="!isSignUpPage" />
  <div class="app-layout">
    <MenuBar v-if="!isSignUpPage" />
    <div class="content-area">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex; /* MenuBar와 콘텐츠 영역을 가로로 배치 */
}

.content-area {
  padding: 0; /* 콘텐츠와 화면 사이에 여백 추가 */
  width: 100%;
}
</style>
