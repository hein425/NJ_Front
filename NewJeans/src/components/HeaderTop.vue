<template>
  <header class="header">
    <!-- 로고 -->
    <div class="logo">
      <RouterLink to="/">
        <img :src="logoSrc" alt="Logo" />
      </RouterLink>
    </div>
    <!-- 검색창 -->
    <div class="search-container">
      <div class="search-wrapper">
        <!-- 돋보기 아이콘 -->
        <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="search-icon" />
        <div class="search-content">
          <div v-if="selectedOption !== 'ALL'" class="filter-tag">
            <span>{{ selectedLabel }}</span>
            <button @click="clearFilter" class="clear-btn">
              <font-awesome-icon :icon="['fas', 'times']" />
            </button>
          </div>
          <input type="text" v-model="searchQuery" placeholder="검색" class="search-input" @keyup.enter="goToSearchForm" />
        </div>
        <div class="filter-btn-container" ref="filterBtn">
          <!-- 필터 아이콘 -->
          <button class="filter-btn" @click="toggleDropdown">
            <font-awesome-icon :icon="['fas', 'sliders']" />
          </button>
          <!-- 필터 드롭다운 -->
          <ul v-if="dropdownVisible" class="dropdown-options" :style="dropdownStyles">
            <li v-for="option in toggleOptions" :key="option.value" :class="{ active: selectedOption === option.value }" @click.stop="selectOption(option.value)">
              {{ option.label }}
              <span v-if="selectedOption === option.value" class="check-mark">✔</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="notifi">
      <!-- 메시지 아이콘 -->
      <div class="message-icon">
        <button>
          <font-awesome-icon :icon="['fas', 'envelope']" />
        </button>
      </div>

      <!-- 알림 아이콘 -->
      <div class="notification-icon">
        <button @click="toggleNotifications">
          <font-awesome-icon :icon="['fas', 'bell']" />
          <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
        </button>
        <!-- 알림 컴포넌트 -->
        <Notifications v-if="showNotifications" @close="showNotifications = false" />
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import lightLogo from '@/assets/logo2.png';
import darkLogo from '@/assets/logo_white.png';
import { faMagnifyingGlass, faTimes, faSliders, faBell, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import Notifications from '@/components/NotiFication.vue';

// Font Awesome 아이콘 등록
library.add(faMagnifyingGlass, faTimes, faSliders, faBell, faEnvelope);

const logoSrc = ref('');
const searchQuery = ref('');
const selectedOption = ref('ALL');
const dropdownVisible = ref(false);
const dropdownStyles = ref({});
const router = useRouter();
const filterBtn = ref(null);

const showNotifications = ref(false);
const unreadCount = ref(3); // 예제: 알림 개수 (API 연동 필요)

// 알림 창 표시/숨기기
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};

// 테마에 따른 로고 업데이트
const applyTheme = () => {
  const rootStyle = getComputedStyle(document.documentElement);
  const currentTheme = rootStyle.getPropertyValue('--theme').trim(); // 테마 확인

  // 테마에 따라 로고 경로 설정
  if (currentTheme === 'Dark' || currentTheme === 'Pink' || currentTheme === 'Sky') {
    logoSrc.value = darkLogo; // Dark, Pink, Sky 테마일 때 다크 로고 사용
  } else {
    logoSrc.value = lightLogo; // Light 테마일 때 라이트 로고 사용
  }
};

// 페이지 로드 및 라우트 변경 시 로고 업데이트
onMounted(() => {
  applyTheme();
});

watch(router.currentRoute, () => {
  applyTheme();
});

const toggleOptions = [
  { label: '전체', value: 'ALL' },
  { label: '일정', value: 'SCHEDULE' },
  { label: '일기', value: 'DIARY' },
];

const selectedLabel = computed(() => {
  const selected = toggleOptions.find(option => option.value === selectedOption.value);
  return selected ? selected.label : '전체';
});

const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value;

  if (dropdownVisible.value && filterBtn.value) {
    const rect = filterBtn.value.getBoundingClientRect();
    dropdownStyles.value = {
      position: 'absolute',
      top: `${rect.height + 10}px`,
      right: '0px',
      width: '150px',
    };
  }
};

const selectOption = value => {
  selectedOption.value = value;
  dropdownVisible.value = false;
};

const clearFilter = () => {
  selectedOption.value = 'ALL';
};

const goToSearchForm = () => {
  if (!searchQuery.value.trim()) return;
  router.push({
    path: '/searchForm',
    query: { query: searchQuery.value, filterType: selectedOption.value },
  });
};

const handleClickOutside = event => {
  if (!filterBtn.value.contains(event.target)) {
    dropdownVisible.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.header {
  display: flex;
  justify-content: flex-start; /* 로고와 검색창 정렬 */
  align-items: center;
  padding: 2rem 2rem 0 2rem;
  margin-left: 15vh;
  position: relative;
  width: 80vw;
}

.logo {
  display: flex;
  align-items: center;
}

.logo img {
  height: 50px;
  width: auto;
}

.search-container {
  flex-grow: 1; /* 검색창이 로고 옆에서 공간을 적절히 차지하도록 설정 */
  margin-left: 2rem; /* 로고와 검색창 간격 */
  max-width: 19.5vw; /* 검색창의 최대 너비 설정 */
}

.search-wrapper {
  display: flex;
  align-items: center;
  background-color: #f9f9f9;
  border-radius: 2rem;
  padding: 0.5rem 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.search-icon {
  font-size: 1.2rem;
  color: #888;
  margin-right: 0.5rem;
}

.search-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.filter-tag {
  display: flex;
  align-items: center;
  justify-content: center; /* 텍스트와 아이콘을 중앙 정렬 */
  background-color: #fff;
  border-radius: 1rem;
  padding: 0.3rem 0.6rem;
  margin-right: 0.5rem;
  font-size: 0.9rem;
  line-height: 1.2; /* 텍스트와 아이콘 수직 정렬 */
  min-width: 50px; /* 태그의 최소 너비 설정 */
}

.clear-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 0.8rem;
  margin-left: 0.3rem;
  cursor: pointer;
  line-height: 1; /* 아이콘 수직 정렬 */
}

.search-input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: 1rem;
  line-height: 1.5; /* 입력 텍스트 수직 정렬 */
}

.filter-btn-container {
  position: relative;
  overflow: visible;
}

.filter-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #555;
  cursor: pointer;
}

.dropdown-options {
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  z-index: 1000;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

.dropdown-options li {
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown-options li:hover {
  background-color: #f0f0f0;
}

.dropdown-options li.active {
  background-color: #e6f7ff;
  color: #007aff;
}

.check-mark {
  font-size: 0.9rem;
}

.notifi {
  display: flex;
  align-items: center;
  gap: 2vh;
  position: absolute; /* 고정 위치 지정 */
  right: -4rem;
  top: 65%; /* 수직 중앙 정렬 */
  transform: translateY(-60%); /* 정확한 수직 중앙 정렬 */
  z-index: 1000;
}

.notification-icon {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: red;
  color: white;
  font-size: 0.8rem;
  border-radius: 50%;
  padding: 0.2rem 0.4rem;
}

.message-icon button,
.notification-icon button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
</style>
