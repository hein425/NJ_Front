<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import { BASE_URL } from '@/config';

// emit 정의
const emit = defineEmits(['close']);


//더미 데이터
// const notifications = ref([
//   { id: 1, message: 'John posted Design team weekly #37', time: '2h ago', type: 'all' },
//   { id: 2, message: '포미님께서 일정을 공유하였습니다.', time: '3h ago', type: 'mentions' },
//   { id: 3, message: '해인님께서 친구신청을 하였습니다.', time: '5h ago', type: 'requests' },
// ]);

// 알림 데이터 저장용임
const notifications = ref([]);
// 활성화된 탭 (All, Mentions, Requests)
const activeTab = ref('all');
// 탭 변경 함수
const setTab = (tab) => {
  activeTab.value = tab;
};

// 활성화된 탭에 따라 알림 필터링
const filteredNotifications = computed(() =>
  notifications.value.filter(
    (notification) => activeTab.value === 'all' || notification.type === activeTab.value
  )
);

// 알림 데이터 가져오기
const fetchNotifications = async () => {
  try {
    // 로컬 스토리지에서 유저 idx 가져오기
    const idx = localStorage.getItem('idx');
    if (!idx) {
      console.error('User idx is not found in local storage.');
      return;
    }

    const response = await axios.get(`${BASE_URL}/friend/${idx}/requests`, {
      // 필요 시 추가 파라미터 설정 가능
    });

    // 데이터를 알림 형식으로 매핑
    notifications.value = response.data.map((notification) => ({
      id: notification.diaryId || 'N/A', // 고유 ID (없으면 기본값)
      message: notification.userName
        ? `${notification.userName}님이 요청을 보냈습니다.` // userName을 포함한 메시지
        : '알림 메시지가 없습니다.', // userName이 없을 경우 기본 메시지
      time: notification.createdAt
        ? new Date(notification.createdAt).toLocaleString()
        : '시간 정보 없음', // 생성 시간 포맷팅
      type: 'requests', // 요청 유형으로 설정 (하드코딩 가능)
    }));
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
  }
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
  fetchNotifications(); 
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="notifications" ref="notificationPopup">
    <div class="notifications-header">
      <h3>Notifications</h3>
      <button @click="markAllAsRead">알림 모두 읽기</button>
    </div>
    <div class="notifications-tabs">
      <button :class="{ active: activeTab === 'all' }" @click="setTab('all')">All</button>
      <button :class="{ active: activeTab === 'mentions' }" @click="setTab('mentions')">Mentions</button>
      <button :class="{ active: activeTab === 'requests' }" @click="setTab('requests')">Requests</button>
    </div>
    <ul class="notifications-list">
      <template v-if="filteredNotifications.length > 0">
        <li v-for="notification in filteredNotifications" :key="notification.id">
          <p>{{ notification.message }}</p>
          <small>{{ notification.time }}</small>
        </li>
      </template>
      <template v-else>
        <li class="no-notifications">알림이 없습니다.</li>
      </template>
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

.no-notifications {
  text-align: center;
  color: #999;
  padding: 1rem;
}
</style>
