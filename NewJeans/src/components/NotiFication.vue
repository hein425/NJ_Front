<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios'; // axios 임포트 추가
import { BASE_URL } from '@/config';

const notifications = ref([]); // 알림 리스트
const unreadCount = ref(0); // 읽지 않은 알림 개수
let eventSource = null;

// 초기 알림 데이터 가져오기 (axios 사용)
// const fetchNotifications = async () => {
//   try {
//     const idx = localStorage.getItem('idx');
//     if (!idx) {
//       console.error('User idx is not found in local storage.');
//       return;
//     }

//     const response = await axios.get(`${BASE_URL}/friend/${idx}/requests`);
//     const axiosNotifications = response.data.map((notification) => ({
//       id: notification.diaryId || 'N/A',
//       message: `axios 알림: ${notification.userName || '알림 메시지가 없습니다.'}님이 친구 요청을 보냈습니다.`,
//       time: notification.createdAt
//         ? new Date(notification.createdAt).toLocaleString()
//         : '시간 정보 없음',
//     }));

//     // 기존 알림 데이터를 리스트에 추가
//     notifications.value.push(...axiosNotifications);
//   } catch (error) {
//     console.error('Failed to fetch notifications:', error);
//   }
// };

// SSE 연결 설정
const setupSSE = () => {
  const idx = localStorage.getItem('idx');
  if (!idx) {
    console.error('User idx is not found in local storage.');
    return;
  }

  // SSE 연결
  eventSource = new EventSource(`${BASE_URL}/noti/api/subscribe?userName=${idx}`);

  // SSE 이벤트 수신 처리
  eventSource.addEventListener('notification', (event) => {
    const data = JSON.parse(event.data);
    notifications.value.unshift({
        id: Date.now(), // 고유 ID 생성
        message: data,
        time: new Date().toLocaleString(),
    });
    unreadCount.value += 1;
});

  // SSE 연결 종료 처리
  eventSource.addEventListener('error', () => {
    console.error('SSE 연결 오류 발생');
    eventSource.close();
  });
};

// 컴포넌트 마운트 시 데이터 로드 및 SSE 설정
onMounted(() => {
  // fetchNotifications();
  setupSSE();
});

// 컴포넌트 언마운트 시 SSE 연결 해제
onBeforeUnmount(() => {
  if (eventSource) eventSource.close();
});
</script>



<template>
  <div class="notifications">
    <div class="notifications-header">
      <h3>Notifications</h3>
    </div>
    <ul class="notifications-list">
      <template v-if="notifications.length > 0">
        <li v-for="notification in notifications" :key="notification.id">
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
/* 동일 스타일 유지 */
</style>

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
