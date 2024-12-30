<template>
  <div class="team-view">
    <!-- 전체 화면을 삼분할로 나눔 -->
    <div class="left-section">
      <!-- 친구 검색 및 친구 목록 -->
      <div class="friend-search-container">
        <h3>친구 검색</h3>
        <div class="friend-search">
          <input class="search-input" v-model="searchQuery" placeholder="닉네임으로 검색하기" @input="searchFriends" />
          <div v-if="searchResults.length > 0" class="search-results">
            <div v-for="user in searchResults" :key="user.idx" class="search-result-item">
              <img :src="user.profileImageUrl || defaultProfileImage" class="profile-icon" />
              <span class="user-click">{{ user.userName }}</span>
              <span class="friend-email">{{ user.email }}</span>
              <button @click="sendFriendRequest(user.userId)">친구 추가 요청</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 친구 목록 -->
      <div class="friend-list-container">
        <h3>나의 친구 목록</h3>
        <ul class="friends-list">
          <li v-for="friend in friends" :key="friend.idx" class="friend-item">
            <img :src="friend.profileImageUrl || defaultProfileImage" alt="프로필 이미지" class="profile-icon" />
            <span class="user-click">{{ friend.userName }}</span>
            <span class="friend-email">{{ friend.email }}</span>
            <button @click="deleteFriend(friend.idx)">친구 삭제</button>
          </li>
        </ul>
      </div>
    </div>

    <div class="middle-section">
      <!-- 메시지 목록 -->
      <div class="message-list-container">
        <h3>메시지 목록</h3>
        <ul class="messages-list">
          <li v-for="message in messages" :key="message.id" class="message-item" @click="openChat(message.receiverId)">
            <span class="message-sender">{{ message.senderName }}</span>
            <p class="message-preview">{{ message.content }}</p>
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
              <span>{{ message.senderName }}:</span> <p>{{ message.content }}</p>
            </div>
          </div>
          <input v-model="newMessage" placeholder="메시지를 입력하세요" @keydown.enter="sendMessage" />
        </div>
        <div v-else>
          <p>채팅방을 선택하세요.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { BASE_URL } from '@/config';
import defaultProfileImage from '@/assets/profile2.jpg';
import { useAuthStore } from '@/stores/authStore';

// 상태 변수들
const authStore = useAuthStore();
const userId = authStore.idx;
const friends = ref([]);
const searchQuery = ref('');
const searchResults = ref([]);
const messages = ref([]);
const currentChatRoom = ref(null);
const newMessage = ref('');

// 프로필 이미지 불러오기 함수
const loadProfileImage = async userId => {
  try {
    const response = await axios.get(`${BASE_URL}/user/${userId}/profileImage`);
    let imageUrl = response.data;

    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `${BASE_URL}${imageUrl}`;
    }

    return imageUrl;
  } catch (error) {
    console.error(`Failed to load profile image for userId ${userId}:`, error);
    return defaultProfileImage;
  }
};

// 친구 목록 불러오기
const loadFriends = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/friend/${userId}/list`);
    friends.value = await Promise.all(
      response.data.map(async friend => {
        const profileImageUrl = await loadProfileImage(friend.idx);
        return { ...friend, profileImageUrl };
      }),
    );
  } catch (error) {
    console.error('Failed to load friends:', error);
  }
};

//친구 검색
const searchFriends = async () => {
  try {
    if (searchQuery.value.trim()) {
      const response = await axios.get(`${BASE_URL}/friend/search`, {
        params: { userId: userId, userName: searchQuery.value },
      });
      console.log('API Response Data:', response.data); // 응답 데이터 구조 확인
      searchResults.value = await Promise.all(
        response.data.map(async user => {
          console.log('5811111 = ' + JSON.stringify(user));
          //const profileImageUrl = await loadProfileImage(user.idx);
          const profileImageUrl = `${BASE_URL}${user.profileImageUrl}`;
          console.log(profileImageUrl);
          return { ...user, profileImageUrl };
        }),
      );
      console.log('Mapped searchResults Data:', searchResults.value); // 매핑 후 결과 확인
    } else {
      searchResults.value = [];
    }
  } catch (error) {
    console.error('Failed to search friends:', error);
  }
};

// 친구 추가 요청 보내기
const sendFriendRequest = async receiverId => {
  try {
    await axios.post(`${BASE_URL}/friend/request`, null, {
      params: {
        requesterId: userId,
        receiverId,
      },
    });
    alert('친구 요청이 성공적으로 전송되었습니다.');
  } catch (error) {
    console.error('Failed to send friend request:', error);
    alert('친구 요청 전송에 실패했습니다.');
  }
};

// 메시지 목록 불러오기
const loadMessages = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/messages/${userId}`);
    messages.value = response.data;
  } catch (error) {
    console.error('Failed to load messages:', error);
  }
};

// 채팅방 열기
const openChat = async receiverId => {
  try {
    const response = await axios.get(`${BASE_URL}/chatrooms/${userId}/${receiverId}`);
    currentChatRoom.value = response.data;
  } catch (error) {
    console.error('Failed to open chat room:', error);
  }
};

// 메시지 보내기
const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  try {
    const response = await axios.post(`${BASE_URL}/messages/send`, {
      userId: userId,
      message: newMessage.value,
    });
    currentChatRoom.value.messages.push(response.data);
    newMessage.value = '';
  } catch (error) {
    console.error('Failed to send message:', error);
  }
};

// 페이지 로드 시 데이터 불러오기
onMounted(async () => {
  await loadFriends();
  await loadMessages();
});
</script>

<style scoped>

input.search-input {
  width: 95%; /* input 검색창의 넓이를 95%로 설정 */
}

.profile-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
}

.search-result-item {
  background-color: #f1f5f9;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  overflow: hidden;
  display: table; /* 테이블 레이아웃 사용 */
  width: 94%;
}

.search-result-item img {
  display: table-cell;
  vertical-align: top;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
}

.search-result-item .user-info {
  display: table-cell;
  vertical-align: top;
}

.search-result-item .user-click {
  display: block;
  font-size: 1rem;
  margin-bottom: 5px;
  font-weight: bold;
}

.search-result-item .friend-email {
  display: block;
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 10px;
}

.team-view {
  display: flex;
  gap: 20px;
  padding: 20px;
  background-color: #f9f9f9;
  height: 80vh;
}

.left-section, .middle-section, .right-section {
  flex: 1;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.friend-search-container, .friend-list-container, .message-list-container, .chatroom-container {
  margin-bottom: 20px;
}

.friend-search input, .chatroom-container input {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.friend-item, .message-item, .chat-message {
  background-color: #f1f5f9;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.message-sender {
  font-weight: bold;
}

.chatroom-messages {
  max-height: 300px;
  overflow-y: auto;
}

button {
  background-color: #333;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
}

button:hover {
  background-color: #ddd;
}
</style>
