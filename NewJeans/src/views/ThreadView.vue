<script setup>
import axios from 'axios';
import { BASE_URL } from '@/config';
import { useRouter } from 'vue-router';
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore'; // Pinia 스토어 가져오기
axios;
// 전역 변수 선언
let body, menu, menuItems, menuBorder, activeItem;

const router = useRouter();

// CSS 사용자 정의 속성을 동적으로 관리
const rootStyles = computed(() => ({
  '--bgColorMenu': '#ededed',
  '--duration': '0.7s',
  '--timeOut': '0.7s',
  '--menuBorderColor': '#ededed',
}));

// 메뉴 항목 클릭 시 작동하는 함수
function clickItem(item, index) {
  menu.style.removeProperty('--timeOut');
  if (activeItem === item) return;

  if (activeItem) {
    activeItem.classList.remove('active');
  }

  item.classList.add('active');
  activeItem = item;
  offsetMenuBorder(activeItem, menuBorder);
}

// 메뉴 테두리를 움직이는 함수
function offsetMenuBorder(element, menuBorder) {
  const offsetActiveItem = element.getBoundingClientRect();
  const left = Math.floor(offsetActiveItem.left - menu.offsetLeft - (menuBorder.offsetWidth - offsetActiveItem.width) / 2) + 'px';
  menuBorder.style.transform = `translate3d(${left}, 0 , 0)`;
}

// Vue 라이프사이클 - DOM이 로드되면 실행
onMounted(() => {
  body = document.body;
  menu = document.querySelector('.menu');
  menuItems = menu.querySelectorAll('.menu__item');
  menuBorder = menu.querySelector('.menu__border');
  activeItem = menu.querySelector('.active');

  if (!menu || !menuItems || !menuBorder || !activeItem) {
    console.error('초기화 오류: 메뉴 요소가 없음');
    return;
  }

  offsetMenuBorder(activeItem, menuBorder);

  menuItems.forEach((item, index) => {
    item.addEventListener('click', () => clickItem(item, index));
  });

  window.addEventListener('resize', () => {
    offsetMenuBorder(activeItem, menuBorder);
    menu.style.setProperty('--timeOut', 'none');
  });
});

const activeTab = ref(1); // 현재 활성 탭 (1: 전체보기, 2: 일정, 3: 다이어리, 4: 마감 임박 일정)
const data = ref([]); // 다이어리 및 일정 데이터

// Pinia를 통해 로그인한 사용자의 ID 가져오기
const authStore = useAuthStore();
const userIdx = authStore.userIdx;

// 현재 날짜 기준 임박한 일정 계산
function isUpcoming(date) {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInDays = (targetDate - now) / (1000 * 60 * 60 * 24);
  return diffInDays >= 0 && diffInDays <= 7; // 7일 이내의 일정
}

// // 활성 탭에 따라 데이터
const filteredData = computed(() => {
  if (activeTab.value === 1) return data.value; // 전체보기
  if (activeTab.value === 2) return data.value.filter(item => item.type === 'schedule');
  if (activeTab.value === 3) return data.value.filter(item => item.type === 'diary');
  if (activeTab.value === 4) return data.value.filter(item => item.type === 'schedule' && isUpcoming(item.date)); // 임박한 일정
  return [];
});

// Tab 변경 시 활성화
function clickTab(index) {
  activeTab.value = index;
}
// 데이터 가져오기
async function fetchData() {
  try {
    const response = await axios.get(`${BASE_URL}/shared/all/${userIdx}`);
    console.log('API로부터 반환된 데이터:', response.data);

    data.value = response.data.map(item => ({
      authorIdx: item.authorIdx || 0, // 숫자로 처리
      author: String(item.author || ''), //작성자 이름
      shareDate: String(item.shareDate || ''),
      start: item.start,
      end: item.end,
      comment:item.comment,
      type: String(item.type || ''),
      title: String(item.title || ''), // title 변환 확인
      content: String(item.content || ''), // content 변환 확인
      category: String(item.category || ''), // category 변환 확인
      date: item.date || 0, // 정상 작동 확인
      diaryImages: String(item.diaryImages || ''),
    }));

    console.log('변환된 데이터:', data.value);
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
}

// 컴포넌트 로드 시 데이터 가져오기
onMounted(async () => {
  await authStore.restoreLogin(); // 로그인 상태 복원
  console.log('userIdx:', authStore.userIdx); // userIdx 확인
  if (authStore.userIdx) {
    await fetchData(); // userIdx가 설정된 후에 데이터 가져오기
  } else {
    console.error('userIdx가 null입니다. 데이터를 가져올 수 없습니다.');
  }
});

// 프로필 페이지로 이동
const goToUserProfile = (authorIdx, author) => {
  console.log('Navigating to profile:', { authorIdx, author });

  if (!authorIdx) {
    console.error('authorIdx가 없습니다. 전달할 수 없습니다.');
    return;
  }

  router.push({
    path: `/user/${String(authorIdx)}`, // 문자열로 변환
    query: { author: author || 'Unknown User' }, // author 값을 query로 전달
  });
};
</script>

<template>
  <div class="Thread-view-container" :style="rootStyles">
    <div class="menu-container">
      <div class="menu">
        <button class="menu__item" :class="{ active: activeTab === 1 }" @click="clickTab(1)" style="--bgColorItem: #ff007f">
          <i class="fas fa-th-large fa-2x"></i>
        </button>
        <button class="menu__item" :class="{ active: activeTab === 2 }" @click="clickTab(2)" style="--bgColorItem: #5fff4a">
          <i class="fas fa-calendar-alt fa-2x"></i>
        </button>
        <button class="menu__item" :class="{ active: activeTab === 3 }" @click="clickTab(3)" style="--bgColorItem: #ffebcc">
          <i class="fas fa-book fa-2x"></i>
        </button>
        <button class="menu__item" :class="{ active: activeTab === 4 }" @click="clickTab(4)" style="--bgColorItem: #e0b115">
          <i class="fas fa-clock fa-2x"></i>
        </button>
        <div class="menu__border"></div>
      </div>

      <!-- 클립 패스 정의 -->
      <svg class="svg-container" width="0" height="0">
        <defs>
          <clipPath id="menu" clipPathUnits="userSpaceOnUse">
            <path
              d="M6.7,45.5c5.7,0.1,14.1-0.4,23.3-4c5.7-2.3,9.9-5,18.1-10.5c10.7-7.1,11.8-9.2,20.6-14.3
              c5-2.9,9.2-5.2,15.2-7c7.1-2.1,13.3-2.3,17.6-2.1c4.2-0.2,10.5,0.1,17.6,2.1c6.1,1.8,10.2,4.1,15.2,7
              c8.8,5,9.9,7.1,20.6,14.3c8.3,5.5,12.4,8.2,18.1,10.5c9.2,3.6,17.6,4.2,23.3,4H6.7z"
            />
          </clipPath>
        </defs>
      </svg>
    </div>
    <!-- 필터링된 데이터 -->
    <div class="content-container">
      <div v-for="item in filteredData" :key="item.sharedIdx" class="content-box">
        <!-- 프로필 이미지 및 작성자 이름 -->
        <div class="header-section">
          <div class="profile-info">
            <img :src="item.profileImg || '/default-profile.png'" alt="Profile" class="profile-img" @click="goToUserProfile(item.authorIdx, item.author)" />
            <div class="text-info">
              <h3 class="author" @click="goToUserProfile(item.authorIdx, item.author)">{{ item.author }}</h3>
              <!-- 다이어리 제목과 카테고리 -->
              <div v-show="item.type === 'DIARY'" class="title-category">
                <span class="title" :style="{ backgroundColor: '#FFD6D6' }">{{ item.title }}</span>
                <span class="category" :style="{ backgroundColor: '#FFEBCC' }">#{{ item.category }}</span>
              </div>
              <!-- 스케줄 제목 -->
              <div v-show="item.type === 'schedule'" class="title-only">
                <span class="title" :style="{ backgroundColor: '#FFD6D6' }">{{ item.title }}</span>
              </div>
            </div>
          </div>
          <span class="date">{{ item.date }}</span>
        </div>

        <!-- 다이어리 내용 -->
        <div v-show="item.type === 'DIARY'" class="content-section" style="margin-left: 4.5rem; text-align: left">
          <p class="content">{{ item.content }}</p>
          <!-- 이미지를 조건부로 렌더링 -->
          <p class="diary_image" v-if="item.diaryImages && item.diaryImages.length > 0">
            <img :src="`http://192.168.0.17:50002${item.diaryImages}`" alt="Diary Image" />
          </p>
        </div>

        <!-- 일정 내용 -->
        <div v-show="item.type === 'SCHEDULE'" class="schedule-section">
          <p><span style="font-weight: bold">시작 시간:</span> {{ item.start }}</p>
          <p><span style="font-weight: bold">종료 시간:</span> {{ item.end }}</p>
          <p><span style="font-weight: bold">반복:</span> {{ item.repeat }}</p>
          <p style="border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; padding: 10px 0; width: 90%">{{ item.content }}</p>
          <div class="map-section">
            <p><span style="font-weight: bold">Address:</span></p>
            <img :src="item.mapImg" alt="Map" class="map-img" />
            <p>{{ item.address }}</p>
          </div>
        </div>

        <!-- 댓글 섹션 -->
        <div class="footer-section">
          <span class="comments"> <i class="fas fa-comment"></i> {{ item.comment }} </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --bgColorMenu: #ededed; /* 메뉴 배경색 */
  --duration: 0.7s; /* 애니메이션 지속 시간 */
  --timeOut: 0.7s; /* 기본 애니메이션 시간 */
  --bgColorItem: #ff8c00; /* 메뉴 항목 활성화 색상 */
  --menuBorderColor: #ededed; /* 메뉴 경계선 색상 */
}

.Thread-view-container {
  width: 88.5%;
  padding: 20px;
  border-radius: 10px;
  margin: 5.5vh auto;
  background-color: rgb(255, 255, 255); /* 배경 색상 */
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
}

html {
  box-sizing: border-box;
}

html *,
html *::before,
html *::after {
  box-sizing: inherit;
}

body {
  margin: 0;
  display: flex;
  height: 100vh;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  background-color: #ffb457;
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--duration);
}
.menu-container {
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bgColorMenu);
  /* border-radius: 10px; */
  padding: 10px 0;
  position: absolute;
  top: 10%;
  left: 0%;
  transform: translateY(-50%);
}

.menu {
  display: flex;
  width: 60%; /* 너비를 조정 */
  justify-content: center; /* 가운데 정렬 */
  align-items: center;
  gap: 3rem; /* 아이콘 간격 설정 */
  position: relative;
}

.menu__item {
  all: unset;
  z-index: 100;
  display: flex;
  cursor: pointer;
  position: relative;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  padding: 0.55em 0 0.85em;
  transition: transform var(--timeOut, var(--duration));
}

.menu__item::before {
  content: '';
  z-index: -1;
  width: 4.2em;
  height: 4.2em;
  border-radius: 50%;
  position: absolute;
  transform: scale(0);
  transition:
    background-color var(--duration),
    transform var(--duration);
}

.menu__item.active {
  transform: translate3d(0, -0.8em, 0);
}

.menu__item.active::before {
  transform: scale(0.95); /* 활성화 크기 */
  background-color: var(--bgColorItem);
  /* background-color: #ffb457; */
}

.icon {
  font-size: 1.5rem;
  color: white;
}

.menu__item.active .icon {
  animation: strok 1.5s reverse;
}

@keyframes strok {
  100% {
    stroke-dashoffset: 400;
  }
}

.menu__border {
  left: -16.5%;
  bottom: 85%; /* 위치를 조정 */
  width: 12em; /* 너비를 확대 */
  height: 3.5em; /* 높이를 조정 */
  position: absolute;
  clip-path: url(#menu);
  will-change: transform;
  background-color: var(--menuBorderColor);
  transition: transform var(--timeOut, var(--duration));
}

.svg-container {
  width: 0;
  height: 0;
}

@media screen and (max-width: 50em) {
  .menu {
    font-size: 0.8em;
  }
}

/* 다이어리 스타일 */
.content-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  margin-top: 15rem;
}

.content-box {
  width: 70rem;
  margin: 0 auto;
  background: #f7f8fa;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.profile-img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.text-info {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.author {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.title-category {
  display: flex;
  gap: 10px;
}

.title,
.category {
  font-size: 0.9rem;
  padding: 5px 10px;
  border-radius: 10px;
  font-weight: bold;
}

.date {
  font-size: 0.9rem;
  color: #999;
  font-weight: bold;
}
.diary_image img {
  max-width: 1000px;
}
.content-section .content {
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 15px;
  max-width: 60rem;
}

.schedule-section {
  margin-top: 15px;
  margin-left: 4.5rem;
  text-align: left;
  font-size: 1rem;
  color: #555;
}

.map-section {
  margin-top: 10px;
}

.map-img {
  max-width: 100%;
  /* max-height: 200px; */
  object-fit: cover;
  margin: 10px 0;
}

.title-only .title {
  font-size: 0.9rem;
  padding: 5px 10px;
  border-radius: 10px;
  font-weight: bold;
}

.title-only {
  margin-top: 5px;
}

.footer-section {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: 0.9rem;
  color: #888;
  margin-top: 10px;
}

.footer-section .comments i {
  font-size: 1rem;
  margin-right: 5px;
}
</style>
