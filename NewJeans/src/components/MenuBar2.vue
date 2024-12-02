<template>
  <header>
    <nav class="main-menu">
      <div class="scrollbar" id="style-1">
        <ul>
          <!-- Home -->
          <li
            :class="{ active: activeMenu === 'home' }"
            @click="
              setActiveMenu('home');
              router.push('/');
            "
          >
            <a href="#">
              <i class="fa fa-home fa-lg"></i>
              <span class="nav-text">Home</span>
            </a>
          </li>

          <!-- Search -->
          <li
            :class="{ active: activeMenu === 'search' }"
            @click="
              setActiveMenu('search');
              router.push('/search');
            "
          >
            <a href="#">
              <i class="fa fa-user fa-lg"></i>
              <span class="nav-text">Search</span>
            </a>
          </li>

          <!-- Calendar -->
          <li class="darkerlishadow" :class="{ active: activeMenu === 'calendar' }" @click="navigateToCalendar('calendar')">
            <a href="#">
              <i class="fa fa-clock-o fa-lg"></i>
              <span class="nav-text">Calendar</span>
            </a>
          </li>

          <!-- Diary -->
          <li class="darkerli" :class="{ active: activeMenu === 'diary' }" @click="navigateToDiary('diary')">
            <a href="#">
              <i class="fa fa-flask fa-lg"></i>
              <span class="nav-text">Diary</span>
            </a>
          </li>

          <!-- Thread -->
          <li
            class="darkerli"
            :class="{ active: activeMenu === 'thread' }"
            @click="
              setActiveMenu('thread');
              router.push('/thread');
            "
          >
            <a href="#">
              <i class="fa fa-desktop fa-lg"></i>
              <span class="nav-text">Thread</span>
            </a>
          </li>

          <!-- Friends -->
          <li class="darkerli" :class="{ active: activeMenu === 'friends' }" @click="navigateToTeams('friends')">
            <a href="#">
              <i class="fa fa-plane fa-lg"></i>
              <span class="nav-text">Friends</span>
            </a>
          </li>

          <!-- Statistics -->
          <li
            class="darkerli"
            :class="{ active: activeMenu === 'statistics' }"
            @click="
              setActiveMenu('statistics');
              router.push('/statistics');
            "
          >
            <a href="#">
              <i class="fa fa-align-left fa-lg"></i>
              <span class="nav-text">Statistics</span>
            </a>
          </li>

          <!-- Games -->
          <li
            class="darkerli"
            :class="{ active: activeMenu === 'games' }"
            @click="
              setActiveMenu('games');
              router.push('/games');
            "
          >
            <a href="#">
              <i class="fa fa-gamepad fa-lg"></i>
              <span class="nav-text">Games</span>
            </a>
          </li>

          <!-- My Page -->
          <li class="darkerlishadowdown" :class="{ active: activeMenu === 'mypage' }" @click="navigateToSetting('mypage')">
            <a href="#">
              <i class="fa fa-user fa-lg"></i>
              <span class="nav-text">My Page</span>
            </a>
          </li>

          <!-- Help -->
          <li
            :class="{ active: activeMenu === 'help' }"
            @click="
              setActiveMenu('help');
              router.push('/help');
            "
          >
            <a href="#">
              <i class="fa fa-question-circle fa-lg"></i>
              <span class="nav-text">Help</span>
            </a>
          </li>
        </ul>

        <!-- Login / Logout -->
        <ul class="login">
          <li v-if="!authStore.isLoggedIn" @click="showModal = true">
            <a href="#">
              <i class="fa fa-lightbulb-o fa-lg"></i>
              <span class="nav-text">Login</span>
            </a>
          </li>
          <li v-else @click="handleLogout">
            <a href="#">
              <i class="fa fa-sign-out fa-lg"></i>
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
  router.push('/calendar');
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
body {
  margin: 0;
  padding: 0;
  font-family: 'Open Sans', Arial, sans-serif;
  background: url('https://static.tumblr.com/94eb957a00fd03c0c2f7d26decd71578/u1rhacw/osAmyyh1q/tumblr_static_tumblr_static_gaussian_blur_gradient_desktop_1680x943_wallpaper-393751.jpg');
  color: #fff;
  font-weight: 300;
}

.main-menu {
  background: #f7f7f7;
  position: absolute;
  top: 0;
  bottom: 0;
  height: 100%;
  left: 0;
  width: 55px;
  overflow: hidden;
  transition: width 0.2s linear;
  box-shadow: 1px 0 15px rgba(0, 0, 0, 0.07);
}

.main-menu:hover {
  width: 250px;
}

.scrollbar {
  height: 90%;
  overflow-y: hidden;
  margin-top: 25vh;
}

.scrollbar:hover {
  /* overflow-y: scroll; */
}

ul {
  margin: 7px 0;
  padding: 0;
}

li {
  display: block;
  width: 250px;
}

a {
  display: table;
  width: 255px;
  color: #8a8a8a;
  font-size: 13px;
  text-decoration: none;
  font-family: 'Strait', sans-serif;
  border-top: 1px solid #f2f2f2;
  text-shadow: 1px 1px 1px #fff;
  transition: all 0.14s linear;
}

.nav-text {
  display: table-cell;
  vertical-align: middle;
  width: 190px;
  font-family: 'Titillium Web', sans-serif;
}

.fa-lg {
  font-size: 1em;
}

.fa {
  position: relative;
  display: table-cell;
  width: 55px;
  height: 36px;
  text-align: center;
  font-size: 20px;
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
