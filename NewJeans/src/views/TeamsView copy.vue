<template>
  <div class="team-view">
    <!-- 전체 화면을 삼분할로 나눔 -->
    <div class="left-section">
      <!-- 친구 목록 -->
      <div class="friend-list-container">
        <div class="friend-list-header">
          <h3>친구 목록</h3>
          <button class="add-friend-button tooltip-btn" data-tooltip="친구 추가" @click="openFriendSearchModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="plus-icon" viewBox="0 0 16 16">
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3a.5.5 0 0 1 .5-.5z" />
            </svg>
          </button>
        </div>
        <ul class="friends-list">
          <li v-for="friend in friends" :key="friend.idx" class="friend-item">
            <img :src="friend.profileImageUrl || defaultProfileImage" alt="프로필 이미지" class="profile-icon" />
            <span class="friend-name">{{ friend.userName }}</span>
            <button class="message-icon tooltip-btn" data-tooltip="메시지 전송" @click="openChat(friend.idx)">
              <font-awesome-icon :icon="['fas', 'envelope']" />
            </button>
            <button @click="deleteFriend(friend.idx)" class="friend-action">친구 끊기</button>
          </li>
        </ul>
      </div>
    </div>

    <div class="middle-section">
      <!-- 메시지 목록 -->
      <div class="message-list-container">
        <h3>메시지 목록</h3>
        <ul class="messages-list">
          <li v-for="message in messages" :key="message.id" class="message-item">
            <img :src="message.profileImageUrl || defaultProfileImage" alt="프로필 이미지" class="message-profile" />
            <div class="message-info">
              <span class="message-sender">{{ message.senderName }}</span>
              <p class="message-preview">{{ message.content }}</p>
            </div>
            <span class="message-time">{{ formatTime(message.timestamp) }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="right-section">
      <!-- 채팅방 -->
      <div class="chatroom-container">
        <h3>채팅방</h3>
        <div v-if="currentChatRoom">
          <div class="chatroom-header">
            <span>{{ currentChatRoom.name }}</span>
          </div>
          <div class="chatroom-messages">
            <div v-for="message in currentChatRoom.messages" :key="message.id" class="chat-message">
              <span>{{ message.senderName }}:</span>
              <p>{{ message.content }}</p>
            </div>
          </div>
          <input v-model="newMessage" placeholder="메시지를 입력하세요" @keydown.enter="sendMessage" />
        </div>
        <div v-else>
          <p>채팅방을 선택하세요.</p>
        </div>
      </div>
    </div>

    <!-- 친구 검색 모달 -->
    <div v-if="isFriendSearchModalOpen" class="modal-overlay" @click.self="closeFriendSearchModal">
      <div class="modal-container">
        <h3>친구 검색</h3>
        <input class="search-input" v-model="searchQuery" placeholder="닉네임으로 검색하기" @input="searchFriends" />
        <div v-if="searchResults.length > 0" class="search-results">
          <div v-for="user in searchResults" :key="user.idx" class="search-result-item">
            <img :src="user.profileImageUrl || defaultProfileImage" class="profile-icon" />
            <span class="user-click">{{ user.userName }}</span>
            <button @click="sendFriendRequest(user.userId)">친구 추가 요청</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { BASE_URL } from '@/config';
import defaultProfileImage from '@/assets/profile2.jpg';
import { useAuthStore } from '@/stores/authStore';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

const authStore = useAuthStore();
const userId = authStore.idx;
const friends = ref([]);
const searchQuery = ref('');
const searchResults = ref([]);
const messages = ref([]);
const currentChatRoom = ref(null);
const newMessage = ref('');
const isFriendSearchModalOpen = ref(false);
let sse = null;

const openFriendSearchModal = () => {
  isFriendSearchModalOpen.value = true;
};

const closeFriendSearchModal = () => {
  isFriendSearchModalOpen.value = false;
};

const loadFriends = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/friend/${userId}/list`);
    friends.value = response.data.map(friend => ({
      ...friend,
      profileImageUrl: friend.profileImageUrl || defaultProfileImage,
    }));
  } catch (error) {
    console.error('Failed to load friends:', error);
  }
};

const deleteFriend = async friendId => {
  try {
    await axios.delete(`${BASE_URL}/friend/${userId}/delete`, { params: { friendId } });
    friends.value = friends.value.filter(friend => friend.idx !== friendId);
  } catch (error) {
    console.error('Failed to delete friend:', error);
  }
};

const searchFriends = async () => {
  try {
    if (searchQuery.value.trim()) {
      const response = await axios.get(`${BASE_URL}/friend/search`, {
        params: { userId, userName: searchQuery.value },
      });
      searchResults.value = response.data.map(user => ({
        ...user,
        profileImageUrl: user.profileImageUrl || defaultProfileImage,
      }));
    } else {
      searchResults.value = [];
    }
  } catch (error) {
    console.error('Failed to search friends:', error);
  }
};

const sendFriendRequest = async receiverId => {
  try {
    const friend = searchResults.value.find(user => user.userId === receiverId);
    const friendName = friend ? friend.userName : 'Unknown';

    const friendRequestDto = {
      userId: userId,
      userName: authStore.userName,
      friendId: receiverId,
      friendName: friendName,
    };

    await axios.post(`${BASE_URL}/friend/request`, JSON.stringify(friendRequestDto), {
      headers: {
        'Content-Type': 'application/json', // JSON 요청 명시
      },
    });

    alert('친구 요청이 성공적으로 전송되었습니다.');
  } catch (error) {
    console.error('Failed to send friend request:', error.response?.data || error.message);
    alert('친구 요청 전송에 실패했습니다.');
  }
};

const loadMessages = async () => {
  messages.value = [
    {
      id: 1,
      senderId: 101,
      senderName: 'Alice',
      senderProfile: 'https://via.placeholder.com/50',
      content: '안녕하세요! 오랜만이에요.',
      timestamp: '2024-12-27T09:00:00Z',
    },
    {
      id: 2,
      senderId: 102,
      senderName: 'Bob',
      senderProfile: 'https://via.placeholder.com/50',
      content: '네! 잘 지내셨나요?',
      timestamp: '2024-12-27T09:01:00Z',
    },
    {
      id: 3,
      senderId: 103,
      senderName: 'Charlie',
      senderProfile: 'https://via.placeholder.com/50',
      content: '회의 일정 조정이 필요합니다.',
      timestamp: '2024-12-27T10:30:00Z',
    },
    {
      id: 4,
      senderId: 104,
      senderName: 'David',
      senderProfile: 'https://via.placeholder.com/50',
      content: '오늘 저녁에 약속 가능하신가요?',
      timestamp: '2024-12-27T14:45:00Z',
    },
    {
      id: 5,
      senderId: 105,
      senderName: 'Eve',
      senderProfile: 'https://via.placeholder.com/50',
      content: '프로젝트 관련 자료 확인 부탁드립니다.',
      timestamp: '2024-12-27T16:15:00Z',
    },
  ];
};

const formatTime = timestamp => {
  const date = new Date(timestamp);
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const openChat = async receiverId => {
  try {
    const response = await axios.get(`${BASE_URL}/message/messages/${userId}/${receiverId}`);
    currentChatRoom.value = {
      name: `Chat with ${receiverId}`,
      messages: response.data,
    };
  } catch (error) {
    console.error('Failed to open chat room:', error);
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  try {
    const response = await axios.post(`${BASE_URL}/message/send`, {
      senderId: userId,
      receiverId: currentChatRoom.value.name.split(' ')[2],
      content: newMessage.value,
    });
    currentChatRoom.value.messages.push(response.data);
    newMessage.value = '';
  } catch (error) {
    console.error('Failed to send message:', error);
  }
};

const subscribeToSSE = () => {
  if (sse) return;

  sse = new EventSource(`${BASE_URL}/message/subscribe/${userId}`);
  sse.addEventListener('message', event => {
    const newMessage = JSON.parse(event.data);
    messages.value.unshift(newMessage);
  });

  sse.addEventListener('error', () => {
    console.error('SSE connection error');
    sse.close();
    sse = null;
  });
};

const unsubscribeFromSSE = () => {
  if (sse) {
    sse.close();
    sse = null;
  }
};

onMounted(async () => {
  await loadFriends();
  await loadMessages();

  subscribeToSSE();

  const tooltipButtons = document.querySelectorAll('.tooltip-btn');
  tooltipButtons.forEach(button => {
    const tooltipContent = button.getAttribute('data-tooltip');
    tippy(button, {
      content: tooltipContent,
      interactive: true,
      trigger: 'mouseenter',
      duration: [300, 300],
      theme: 'light',
    });
  });
});

onUnmounted(() => {
  unsubscribeFromSSE();
});
</script>

<style scoped>
input.search-input {
  width: 95%;
}

.profile-icon {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  margin-right: 10px;
}

.search-result-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.friend-list-container {
  margin-top: 20px;
}

.friend-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.friends-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.friend-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  background-color: #fff;
  padding: 10px;
  border-radius: 8px;
}

.friend-item .profile-icon {
  margin-right: 10px;
}

.friend-name {
  font-size: 1rem;
  font-weight: bold;
  margin-right: auto;
}

.message-icon {
  margin-left: 10px;
  margin-right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: black;
  font-size: 18px;
}

.message-icon:hover {
  color: var(--border-color);
}

.friend-action {
  color: var(--button-text-color);
  background-color: var(--button-background);
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

.friend-action:hover {
  background-color: var(--border-color);
}

.add-friend-button {
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 10px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.plus-icon {
  width: 20px;
  height: 20px;
  color: black;
}

.add-friend-button:hover .plus-icon {
  color: #333;
}

.message-list-container {
  padding: 10px 0;
}

.messages-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.message-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #fff;
  border-radius: 8px;
}

.message-item:hover {
  background-color: var(--border-color);
}

.message-profile {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
}

.message-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-right: 10px;
  justify-content: space-between;
  height: 50px;
}

.message-sender {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 5px;
  margin-bottom: 3px;
}

.message-preview {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
}

.message-time {
  font-size: 0.8rem;
  color: #6b7280;
}

.chatroom-container {
  padding: 10px;
}

.chatroom-messages {
  max-height: 300px;
  overflow-y: auto;
}

.chatroom-header {
  font-weight: bold;
  margin-bottom: 10px;
}

.chat-message {
  margin-bottom: 10px;
}

.team-view {
  display: flex;
  gap: 20px;
  padding: 20px;
  background-color: #f9f9f9;
  height: 80vh;
}

.left-section {
  flex: 0 0 23%;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.middle-section {
  flex: 1;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
}

.right-section {
  flex: 1;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  width: 400px;
}

button {
  cursor: pointer;
}
</style>
