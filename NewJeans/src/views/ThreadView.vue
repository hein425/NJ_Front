<script setup>
import { computed, onMounted } from 'vue';

('use strict');

// 전역 변수 선언
let body, menu, menuItems, menuBorder, activeItem;
const bgColorsBody = ['#ffb457', '#ff96bd', '#9999fb', '#ffe797', '#cffff1'];

// CSS 사용자 정의 속성을 동적으로 관리
const rootStyles = computed(() => ({
  '--bgColorMenu': '#1d1d27',
  '--duration': '0.7s',
  '--timeOut': '0.7s',
  '--menuBorderColor': '#1d1d27',
}));

// 메뉴 항목 클릭 시 작동하는 함수
function clickItem(item, index) {
  menu.style.removeProperty('--timeOut');

  if (activeItem === item) return;

  if (activeItem) {
    activeItem.classList.remove('active');
  }

  item.classList.add('active');
  body.style.backgroundColor = bgColorsBody[index];
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
</script>

<template>
  <div class="Thread-view-container" :style="rootStyles">
    <div class="menu">
      <!-- 첫 번째 아이콘 -->
      <button class="menu__item active" style="--bgColorItem: #ff8c00">
        <svg class="icon" viewBox="0 0 24 24">
          <path d="M3.8,6.6h16.4" />
          <path d="M20.2,12.1H3.8" />
          <path d="M3.8,17.5h16.4" />
        </svg>
      </button>

      <!-- 두 번째 아이콘 -->
      <button class="menu__item" style="--bgColorItem: #f54888">
        <svg class="icon" viewBox="0 0 24 24">
          <path
            d="M6.7,4.8h10.7c0.3,0,0.6,0.2,0.7,0.5l2.8,7.3c0,0.1,0,0.2,0,0.3v5.6c0,0.4-0.4,0.8-0.8,0.8H3.8
          C3.4,19.3,3,19,3,18.5v-5.6c0-0.1,0-0.2,0.1-0.3L6,5.3C6.1,5,6.4,4.8,6.7,4.8z"
          />
          <path d="M3.4,12.9H8l1.6,2.8h4.9l1.5-2.8h4.6" />
        </svg>
      </button>

      <!-- 세 번째 아이콘 -->
      <button class="menu__item" style="--bgColorItem: #4343f5">
        <svg class="icon" viewBox="0 0 24 24">
          <path d="M3.4,11.9l8.8,4.4l8.4-4.4" />
          <path d="M3.4,16.2l8.8,4.5l8.4-4.5" />
          <path d="M3.7,7.8l8.6-4.5l8,4.5l-8,4.3L3.7,7.8z" />
        </svg>
      </button>

      <!-- 네 번째 아이콘 -->
      <button class="menu__item" style="--bgColorItem: #e0b115">
        <svg class="icon" viewBox="0 0 24 24">
          <path
            d="M5.1,3.9h13.9c0.6,0,1.2,0.5,1.2,1.2v13.9c0,0.6-0.5,1.2-1.2,1.2H5.1c-0.6,0-1.2-0.5-1.2-1.2V5.1
          C3.9,4.4,4.4,3.9,5.1,3.9z"
          />
          <path d="M4.2,9.3h15.6" />
          <path d="M9.1,9.5v10.3" />
        </svg>
      </button>

      <!-- 다섯 번째 아이콘 -->
      <button class="menu__item" style="--bgColorItem: #65ddb7">
        <svg class="icon" viewBox="0 0 24 24">
          <path
            d="M5.1,3.9h13.9c0.6,0,1.2,0.5,1.2,1.2v13.9c0,0.6-0.5,1.2-1.2,1.2H5.1c-0.6,0-1.2-0.5-1.2-1.2V5.1
          C3.9,4.4,4.4,3.9,5.1,3.9z"
          />
          <path d="M5.5,20l9.9-9.9l4.7,4.7" />
          <path d="M10.4,8.8c0,0.9-0.7,1.6-1.6,1.6c-0.9,0-1.6-0.7-1.6-1.6C7.3,8,8,7.3,8.9,7.3C9.7,7.3,10.4,8,10.4,8.8z" />
        </svg>
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
</template>

<style scoped>
:root {
  --bgColorMenu: #1d1d27; /* 메뉴 배경색 */
  --duration: 0.7s; /* 애니메이션 지속 시간 */
  --timeOut: 0.7s; /* 기본 애니메이션 시간 */
  --bgColorItem: #ff8c00; /* 메뉴 항목 활성화 색상 */
  --menuBorderColor: #1d1d27; /* 메뉴 경계선 색상 */
}

.Thread-view-container {
  width: 88.5%;
  height: 100rem;
  padding: 20px;
  border-radius: 10px;
  margin: 5.5vh 9vh;
  background-color: rgb(255, 255, 255); /* 배경 색상 */
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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

.menu {
  margin: 0;
  display: flex;
  width: 32.05em;
  font-size: 1.5em;
  padding: 0 2.85em;
  position: relative;
  align-items: center;
  justify-content: center;
  background-color: var(--bgColorMenu);
}

.menu__item {
  all: unset;
  flex-grow: 1;
  z-index: 100;
  display: flex;
  cursor: pointer;
  position: relative;
  border-radius: 50%;
  align-items: center;
  will-change: transform;
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
  transform: scale(1);
  background-color: var(--bgColorItem);
}

.icon {
  width: 2.6em;
  height: 2.6em;
  stroke: white;
  fill: transparent;
  stroke-width: 1pt;
  stroke-miterlimit: 10;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 400;
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
  left: 3%;
  bottom: 86%;
  width: 10.9em;
  height: 2.4em;
  position: absolute;
  clip-path: url(#menu);
  background-color: var(--menuBorderColor);
  will-change: transform;
  transition: transform var(--timeOut, var(--duration));
  pointer-events: none;
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
</style>
