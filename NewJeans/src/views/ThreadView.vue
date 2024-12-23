<script setup>
import { ref, computed, onMounted } from 'vue';

('use strict');

// 전역 변수 선언
let body, menu, menuItems, menuBorder, activeItem;
// const bgColorsBody = ['#ffb457', '#ff96bd', '#9999fb', '#ffe797', '#cffff1'];

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
  //   body.style.backgroundColor = bgColorsBody[index];
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

// 더미 데이터
const data = ref([
  {
    id: 1,
    type: 'schedule', // 일정
    title: '포미의 일정',
    content: '오늘 포미와 산책 약속이 있어요.',
    date: '2024.11.28',
    author: '포미언니',
    hashtags: ['#포미의일상', '#산책'],
  },
  {
    id: 2,
    type: 'diary', // 다이어리
    title: '포미의 하루',
    content: '오늘 포미는 새로운 친구를 만났어요!',
    date: '2024.11.28',
    author: '포미언니',
    hashtags: ['#포미의다이어리', '#새친구'],
  },
  {
    id: 3,
    type: 'schedule', // 마감 일정
    title: '포미 병원 방문',
    content: '포미 병원 예약이 내일입니다.',
    date: '2024.11.29',
    author: '포미오빠',
    hashtags: ['#병원', '#건강관리'],
    urgent: true, // 마감 임박 표시
  },
]);

// 활성 탭에 따라 데이터를 필터링
const filteredData = computed(() => {
  if (activeTab.value === 1) return data.value; // 전체보기
  if (activeTab.value === 2) return data.value.filter(item => item.type === 'schedule' && !item.urgent);
  if (activeTab.value === 3) return data.value.filter(item => item.type === 'diary');
  if (activeTab.value === 4) return data.value.filter(item => item.type === 'schedule' && item.urgent);
  return [];
});

// 메뉴 클릭 시 활성 탭 변경
function clickTab(index) {
  activeTab.value = index;
}
</script>

<template>
  <div class="Thread-view-container" :style="rootStyles">
    <div class="menu-container">
      <div class="menu">
        <button class="menu__item" :class="{ active: activeTab === 1 }" @click="clickTab(1)" style="--bgColorItem: #ff007f">
          <i class="fas fa-th-large fa-2x"></i>
        </button>
        <button class="menu__item" :class="{ active: activeTab === 2 }" @click="clickTab(2)" style="--bgColorItem: #f54888">
          <i class="fas fa-calendar-alt fa-2x"></i>
        </button>
        <button class="menu__item" :class="{ active: activeTab === 3 }" @click="clickTab(3)" style="--bgColorItem: #4343f5">
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
    <!-- 컨텐츠 표시 -->
    <div class="content-container">
      <div v-for="item in filteredData" :key="item.id" class="content-box">
        <div class="header">
          <h3>{{ item.author }}</h3>
          <span class="date">{{ item.date }}</span>
        </div>
        <h4>{{ item.title }}</h4>
        <p>{{ item.content }}</p>
        <div class="hashtags">
          <span v-for="tag in item.hashtags" :key="tag" class="hashtag">{{ tag }}</span>
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
  height: 100rem;
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

/* 컨텐츠 */
.content-container {
  justify-items: center;
  margin-top: 15%;
}

.content-box {
  width: 100vh;
  background: #f9f9f9;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.content-box .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-box .header h3 {
  font-size: 1rem;
  font-weight: bold;
}

.content-box .header .date {
  font-size: 0.8rem;
  color: #888;
}

.content-box h4 {
  margin: 10px 0;
  font-size: 1.2rem;
}

.content-box p {
  font-size: 1rem;
  color: #555;
}

.hashtags {
  margin-top: 10px;
}

.hashtag {
  display: inline-block;
  background: #e0e0e0;
  color: #555;
  padding: 5px 10px;
  margin-right: 5px;
  border-radius: 5px;
  font-size: 0.8rem;
}
</style>
