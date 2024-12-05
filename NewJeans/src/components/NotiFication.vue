<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
// import axios from 'axios';

// emit 정의
const emit = defineEmits(['close']);

//더미 데이터
const notifications = ref([
  { id: 1, message: 'John posted Design team weekly #37', time: '2h ago', type: 'all' },
  { id: 2, message: 'Sebastian sent you kudos', time: '3h ago', type: 'mentions' },
  { id: 3, message: 'Amy asks to join team Growth', time: '5h ago', type: 'requests' },
]);

// const notifications = ref([]); 더미데이터 삭제 시 이거 쓰면 됨, 알림 데이터 저장용임

// 활성화된 탭 (All, Mentions, Requests)
const activeTab = ref('all');
// 탭 변경
const setTab = tab => {
  activeTab.value = tab;
};

// 활성화된 탭에 따라 알림 필터링
const filteredNotifications = computed(() => notifications.value.filter(notification => activeTab.value === 'all' || notification.type === activeTab.value));

// 알림 모두 읽음 처리 (더미 로직)
const markAllAsRead = () => {
  console.log('Marking all notifications as read...');
  // 필요 시 API 호출 추가
};

// API로부터 알림 데이터 가져오기
// onMounted(async () => {
//   try {
//     const response = await axios.get('/api/notifications'); // 실제 백엔드 API 엔드포인트로 변경
//     notifications.value = response.data;
//   } catch (error) {
//     console.error('Failed to fetch notifications:', error);
//   }
// });

// 외부 클릭 감지로 팝업 닫기
const notificationPopup = ref(null);

const handleClickOutside = event => {
  if (notificationPopup.value && !notificationPopup.value.contains(event.target)) {
    emit('close'); // 정의된 close 이벤트 호출
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="notifications">
    <div class="notifications-header">
      <h3>Notifications</h3>
      <button @click="markAllAsRead">Mark all as read</button>
    </div>
    <div class="notifications-tabs">
      <button :class="{ active: activeTab === 'all' }" @click="setTab('all')">All</button>
      <button :class="{ active: activeTab === 'mentions' }" @click="setTab('mentions')">Mentions</button>
      <button :class="{ active: activeTab === 'requests' }" @click="setTab('requests')">Requests</button>
    </div>
    <ul class="notifications-list">
      <li v-for="notification in filteredNotifications" :key="notification.id">
        <p>{{ notification.message }}</p>
        <small>{{ notification.time }}</small>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.notifications {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 300px;
  z-index: 1000;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #ddd;
}

.notifications-tabs {
  display: flex;
  justify-content: space-around;
  padding: 0.5rem;
  border-bottom: 1px solid #ddd;
}

.notifications-tabs button {
  flex: 1;
  padding: 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: bold;
}

.notifications-tabs button.active {
  color: white;
  background: #007aff;
  border-radius: 0.5rem;
}

.notifications-list {
  max-height: 300px;
  overflow-y: auto;
  list-style: none;
  padding: 0;
  margin: 0;
}

.notifications-list li {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.notifications-list li:last-child {
  border-bottom: none;
}
</style>
