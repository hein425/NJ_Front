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
  id: data.id, // 여기서 서버에서 전달된 id 값 사용
  message: data.content || '알림 메시지가 없습니다.',
  time: data.createdAt
    ? new Date(data.createdAt).toLocaleString()
    : new Date().toLocaleString(),
  type: data.notificationType || '기타',
  readYn: data.readYn || 'N',
});


// 초기 알림 데이터 가져오기
const fetchNotifications = async () => {
  try {
    const userName = localStorage.getItem('userName');
    if (!userName) {
      console.error('UserName is not found in local storage.');
      return;
    }

    // API 호출
    console.log('fetchNotifications: 서버 요청 시작'); // 요청 디버깅
    const response = await axios.get(`${BASE_URL}/noti/initial-data`, {
      params: { userName },
    });

    // 응답 데이터 처리
    console.log('fetchNotifications: 응답 데이터:', response.data);
    notifications.value = response.data.map(formatNotification);

    // 읽지 않은 알림 개수 업데이트
    unreadCount.value = notifications.value.filter((n) => n.readYn === 'N').length;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
  }
};



// SSE 연결 설정
const setupSSE = () => {
  const userName = localStorage.getItem('userName');
  if (!userName) {
    console.error('UserName is not found in local storage.');
    return;
  }

  eventSource = new EventSource(`${BASE_URL}/noti/api/subscribe?userName=${userName}`);

  eventSource.onopen = () => {
    console.log('SSE 연결이 열렸습니다.');
  };

  eventSource.addEventListener('notification', (event) => {
    console.log('수신된 notification 이벤트:', event.data);

    try {
      const data = JSON.parse(event.data); // JSON 데이터만 처리
      notifications.value.unshift(formatNotification(data));
      unreadCount.value += 1;
    } catch (error) {
      console.warn('JSON 파싱 실패: 일반 텍스트 메시지일 가능성 있음.', event.data);
    }
  });

  eventSource.onerror = (error) => {
    console.error('SSE 연결 오류 발생:', error);
    eventSource.close();

    // 5초 후 재연결 시도
    setTimeout(setupSSE, 5000);
  };
};


// 알림 읽음 처리
const markAsUnread = async (id) => {
  try {
    const response = await axios.put(`${BASE_URL}/noti/notifications/${id}/read`);
    console.log('알림 읽음 처리 완료:', response.data);

    // 읽음 처리된 알림을 리스트에서 제거
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index !== -1) {
      notifications.value[index].readYn = 'Y';
    }

    // 읽지 않은 알림 개수 감소
    unreadCount.value -= 1;
  } catch (error) {
    console.error('알림 읽음 처리 실패:', error);
  }
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
        <li
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          @click="markAsUnread(notification.id)" 
        >
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
  cursor: pointer; /* 클릭 가능 표시 */
  transition: background-color 0.2s ease;
}

.notification-item:hover {
  background-color: #f0f0f0; /* 호버 시 배경색 변경 */
}

.notification-item:active {
  background-color: #e0e0e0; /* 클릭 시 배경색 변경 */
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
