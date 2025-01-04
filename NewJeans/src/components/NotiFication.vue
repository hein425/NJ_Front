<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios'; // axios 임포트
import { BASE_URL } from '@/config';

// 상태 변수 정의
const notifications = ref([]); // 알림 리스트
const unreadCount = ref(0); // 읽지 않은 알림 개수
let eventSource = null;

// 알림 데이터 포맷 함수
const formatNotification = (data) => ({
  id: data.notificationId || Date.now(), // notificationId로 ID 설정
  message: data.content || '알림 메시지가 없습니다.',
  time: data.createdAt
    ? new Date(data.createdAt).toLocaleString()
    : new Date().toLocaleString(), // createdAt이 null인 경우 현재 시간 표시
  type: data.notificationType || '기타',
});

// 초기 알림 데이터 가져오기
const fetchNotifications = async () => {
  try {
    const userName = localStorage.getItem('userName'); // 로컬 스토리지에서 userName 가져오기
    if (!userName) {
      console.error('UserName is not found in local storage.');
      return;
    }

    const response = await axios.get(`${BASE_URL}/noti/initial-data`, {
      params: { userName }, // userName을 쿼리 파라미터로 추가
    });

    // 초기 알림 데이터를 포맷팅 후 추가
    notifications.value = response.data.map(formatNotification);
    console.log('초기 알림 데이터:', notifications.value);

    // 읽지 않은 알림 개수 업데이트
    unreadCount.value = notifications.value.length;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
  }
};

// SSE 연결 설정
const setupSSE = () => {
  const userName = localStorage.getItem('userName'); // 로컬 스토리지에서 userName 가져오기
  if (!userName) {
    console.error('UserName is not found in local storage.');
    return;
  }

  // EventSource 연결
  eventSource = new EventSource(`${BASE_URL}/noti/api/subscribe?userName=${userName}`);

  // 연결 성공
  eventSource.onopen = () => {
    console.log('SSE 연결이 열렸습니다.');
  };

  // 데이터 수신
  eventSource.addEventListener('notification', (event) => {
    console.log('수신된 notification 이벤트:', event.data);

    try {
      const data = JSON.parse(event.data);
      notifications.value.unshift(formatNotification(data)); // 알림 리스트 업데이트
      unreadCount.value += 1; // 읽지 않은 알림 개수 증가
      console.log('알림 리스트 업데이트:', notifications.value);
    } catch (error) {
      console.error('알림 데이터 처리 중 오류 발생:', error);
    }
  });

  // SSE 연결 오류 및 재연결 처리
  eventSource.onerror = (error) => {
    console.error('SSE 연결 오류 발생:', error);
    eventSource.close();
    setTimeout(setupSSE, 5000); // 5초 후 재연결
  };
};

// 컴포넌트 마운트 시 데이터 로드 및 SSE 설정
onMounted(() => {
  fetchNotifications();
  setupSSE();
});

// 컴포넌트 언마운트 시 SSE 연결 해제
onBeforeUnmount(() => {
  if (eventSource) {
    eventSource.close();
  }
});
</script>



<template>
  <div class="notifications">
    <div class="notifications-header">
      <h3>Notifications</h3>
      <span class="unread-count">Unread: {{ unreadCount }}</span>
    </div>
    <ul class="notifications-list">
      <template v-if="notifications.length > 0">
        <li v-for="notification in notifications" :key="notification.id" class="notification-item">
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

.unread-count {
  background-color: #007aff;
  color: white;
  border-radius: 1rem;
  padding: 0.3rem 0.8rem;
  font-size: 0.9rem;
}

.notifications-list {
  max-height: 300px;
  overflow-y: auto;
  list-style: none;
  padding: 0;
  margin: 0;
}

.notification-item {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item p {
  margin: 0;
  font-weight: bold;
}

.no-notifications {
  text-align: center;
  color: #999;
  padding: 1rem;
}
</style>
