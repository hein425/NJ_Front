<script setup>
import { RouterLink, RouterView } from 'vue-router';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import MenuBar from './components/MenuBar.vue';
import HeaderTop from './components/HeaderTop.vue';
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

// 앱이 마운트될 때 로그인 상태 복원
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
});

const route = useRoute();
const isSignUpPage = computed(() => route.path === '/signupp');
</script>

<template>
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
  display: flex;
}

.content-area {
  padding: 0;
  width: 100%;
}
</style>
