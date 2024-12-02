<template>
  <header>
    <nav class="main-menu">
      <div class="scrollbar" id="style-1">
        <ul>
          <!-- Home -->
          <li :class="{ active: activeMenu === 'home' }" @click="setActiveMenu('home'); router.push('/');">
            <a href="#">
              <font-awesome-icon :icon="['fas', 'home']" class="fa" />
              <span class="nav-text">Home</span>
            </a>
          </li>

          <!-- Search -->
          <li :class="{ active: activeMenu === 'search' }" @click="setActiveMenu('search'); router.push('/search');">
            <a href="#">
              <font-awesome-icon :icon="['fas', 'search']" class="fa" />
              <span class="nav-text">Search</span>
            </a>
          </li>

          <!-- Calendar -->
          <li class="darkerlishadow" :class="{ active: activeMenu === 'calendar' }" @click="navigateToCalendar('calendar')">
            <a href="#">
              <font-awesome-icon :icon="['fas', 'calendar-alt']" class="fa" />
              <span class="nav-text">Calendar</span>
            </a>
          </li>

          <!-- Diary -->
          <li class="darkerli" :class="{ active: activeMenu === 'diary' }" @click="navigateToDiary('diary')">
            <a href="#">
              <font-awesome-icon :icon="['fas', 'book']" class="fa" />
              <span class="nav-text">Diary</span>
            </a>
          </li>

          <!-- Thread -->
          <li class="darkerli" :class="{ active: activeMenu === 'thread' }" @click="setActiveMenu('thread'); router.push('/thread');">
            <a href="#">
              <font-awesome-icon :icon="['fas', 'share-alt']" class="fa" />
              <span class="nav-text">Thread</span>
            </a>
          </li>

          <!-- Friends -->
          <li class="darkerli" :class="{ active: activeMenu === 'friends' }" @click="navigateToTeams('friends')">
            <a href="#">
              <font-awesome-icon :icon="['fas', 'user-friends']" class="fa" />
              <span class="nav-text">Friends</span>
            </a>
          </li>

          <!-- Statistics -->
          <li class="darkerli" :class="{ active: activeMenu === 'statistics' }" @click="setActiveMenu('statistics'); router.push('/statistics');">
            <a href="#">
              <font-awesome-icon :icon="['fas', 'chart-bar']" class="fa" />
              <span class="nav-text">Statistics</span>
            </a>
          </li>

          <!-- Games -->
          <li class="darkerli" :class="{ active: activeMenu === 'games' }" @click="setActiveMenu('games'); router.push('/games');">
            <a href="#">
              <font-awesome-icon :icon="['fas', 'gamepad']" class="fa" />
              <span class="nav-text">Games</span>
            </a>
          </li>

          <!-- My Page -->
          <li class="darkerlishadowdown" :class="{ active: activeMenu === 'setting' }" @click="navigateToSetting('setting')">
            <a href="#">
              <font-awesome-icon :icon="['fas', 'user']" class="fa" />
              <span class="nav-text">My Page</span>
            </a>
          </li>

          <!-- Help -->
          <li :class="{ active: activeMenu === 'help' }" @click="setActiveMenu('help'); router.push('/help');">
            <a href="#">
              <font-awesome-icon :icon="['fas', 'question-circle']" class="fa" />
              <span class="nav-text">Help</span>
            </a>
          </li>
        </ul>

        <!-- Login / Logout -->
        <ul class="login">
          <li v-if="!authStore.isLoggedIn" @click="showModal = true">
            <a href="#">
              <font-awesome-icon :icon="['fas', 'sign-in-alt']" class="fa" />
              <span class="nav-text">Login</span>
            </a>
          </li>
          <li v-else @click="handleLogout">
            <a href="#">
              <font-awesome-icon :icon="['fas', 'sign-out-alt']" class="fa" />
              <span class="nav-text">Logout</span>
            </a>
          </li>
        </ul>
      </div>
      <Modal :show="showModal" @close="showModal = false" />
    </nav>
  </header>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import Modal from './MoDal.vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

// Router and Store
const router = useRouter();
const authStore = useAuthStore();

// Reactive states
const showModal = ref(false);
const activeMenu = ref(''); // 현재 활성화된 메뉴 상태

// Set active menu
const setActiveMenu = menu => {
  activeMenu.value = menu;
};

// Navigate to different routes
const navigateToCalendar = menu => {
  setActiveMenu(menu);
  router.push('/');
};

const navigateToDiary = menu => {
  if (!authStore.isLoggedIn) {
    alert('로그인 후 이용해 주십시오.');
    showModal.value = true;
  } else {
    setActiveMenu(menu);
    router.push('/diary');
  }
};

const navigateToTeams = menu => {
  if (!authStore.isLoggedIn) {
    alert('로그인 후 이용해 주십시오.');
    showModal.value = true;
  } else {
    setActiveMenu(menu);
    router.push('/teams');
  }
};

const navigateToSetting = menu => {
  if (!authStore.isLoggedIn) {
    alert('로그인 후 이용해 주십시오.');
    showModal.value = true;
  } else {
    setActiveMenu(menu);
    router.push('/setting');
  }
};

// Handle logout
const handleLogout = async () => {
  await authStore.logout();
  router.push('/');
  setActiveMenu('');
};

// Restore login on mount
onMounted(() => {
  if (!authStore.isLoggedIn) {
    authStore.restoreLogin();
  }
});
</script>

<style scoped>
body,html{
  height: 100%;
  margin: 0;
  padding: 0;
}

.main-menu {
  background: #f7f7f7;
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 70px;
  overflow: hidden;
  transition: width 0.2s linear;
  box-shadow: 1px 0 15px rgba(0, 0, 0, 0.07);
}

.main-menu:hover {
  width: 200px;
}

.scrollbar {
  margin-top: 25vh;
}


ul {
  margin: 0;
  padding: 0;
}

li {
  display: block;
  width: 250px;
}

a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #8a8a8a;
  font-size: 13px;
  font-family: 'Strait', sans-serif;
  border-top: 1px solid #f2f2f2;
  text-shadow: 1px 1px 1px #fff;
  transition: all 0.14s linear;
  height: 36px;
  padding-left: 2.3vh;
}

.fa {
  font-size: 20px; /* 아이콘 크기 */
  margin-right: 3vh; /* 텍스트와 간격 */
  display: flex;
  justify-content: center; /* 아이콘 수평 가운데 정렬 */
  align-items: center; /* 아이콘 수직 가운데 정렬 */
  width: 36px; /* 아이콘 고정 너비 */
}

.nav-text {
  text-align: left; /* 텍스트 왼쪽 정렬 */
  line-height: 1.5; /* 텍스트 간격 조절 */
}



.login {
  position: absolute;
  left: 0;
  padding: 0;
}

.darkerli {
  background-color: #ededed;
  text-transform: capitalize;
}

.darkerlishadow {
  background-color: #ededed;
  text-transform: capitalize;
  box-shadow: inset 0px 5px 5px -4px rgba(50, 50, 50, 0.55);
}

.darkerlishadowdown {
  background-color: #ededed;
  text-transform: capitalize;
  box-shadow: inset 0px -4px 5px -4px rgba(50, 50, 50, 0.55);
}

a:hover {
  text-decoration: none;
  background-color: #00bbbb;
  color: #fff;
}
</style>
