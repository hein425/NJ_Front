<template>
  <div class="team-view">
    <div class="left-middle-section">
      <div class="toggle-buttons">
        <button :class="{ active: activeTab === 'friends' }" @click="setActiveTab('friends')">친구 목록</button>
        <button :class="{ active: activeTab === 'messages' }" @click="setActiveTab('messages')">메시지 목록</button>
      </div>

      <div v-if="activeTab === 'friends'" class="friend-list-container">
        <div class="friend-list-header">
          <h3>친구 목록</h3>
          <button class="add-friend-button tooltip-btn" data-tooltip="친구 추가" @click="openFriendSearchModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="plus-icon" viewBox="0 0 16 16">
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3a.5.5 0 0 1 .5-.5z" />
            </svg>
          </button>
        </div>
        <ul class="friends-list">
          <li v-for="friend in friends" :key="friend.friendId" class="friend-item">
            <img :src="defaultProfileImage" alt="프로필 이미지" class="profile-icon" />
            <span class="friend-name">{{ friend.userName }}</span>
            <button class="message-icon tooltip-btn" data-tooltip="메시지 전송" @click="openChat(friend.friendId)">
              <font-awesome-icon :icon="['fas', 'envelope']" />
            </button>
            <button @click="deleteFriend(friend.friendId)" class="friend-action">친구 끊기</button>
          </li>
        </ul>
      </div>

      <div v-if="activeTab === 'messages'" class="message-list-container">
        <h3>메시지 목록</h3>
        <ul class="messages-list">
          <li v-for="message in messages" :key="message.id" class="message-item" @click="openChat(message.id)">
            <img :src="message.profileImage || defaultProfileImage" alt="프로필 이미지" class="message-profile" />
            <div class="message-info">
              <span class="message-sender">{{ message.userName }}</span>
              <p class="message-preview">{{ message.lastMessage }}</p>
            </div>
            <span class="message-time">{{ formatTime(message.lastMessageTime) }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="right-section">
      <div class="chatroom-container">
        <div v-if="currentChatRoom">
          <div class="chatroom-header">
            <img :src="defaultProfileImage" alt="프로필 이미지" class="chatroom-profile-icon" />
            <span>{{ currentChatRoom.name }}</span>
          </div>
          <div class="chatroom-messages" ref="chatroomMessagesRef">
            <div
              v-for="message in currentChatRoom.messages"
              :key="message.id"
              class="chat-message"
              :class="{ 'my-message': message.senderId === userId, 'other-message': message.senderId !== userId }"
            >
              <p>{{ message.content }}</p>
            </div>
          </div>
          <div class="chatroom-input">
            <input v-model="newMessage" placeholder="메시지를 입력하세요" @keydown.enter="sendMessage" />
            <button @click="sendMessage">전송</button>
          </div>
        </div>
        <div v-else class="chatroom-placeholder">
          <p>채팅방을 선택하세요.</p>
        </div>
      </div>
    </div>

    <div v-if="isFriendSearchModalOpen" class="modal-overlay" @click.self="closeFriendSearchModal">
      <div class="modal-container">
        <div class="toggle-buttons">
          <button :class="{ active: friendModalTab === 'search' }" @click="setFriendModalTab('search')">친구 추가 요청</button>
          <button :class="{ active: friendModalTab === 'requests' }" @click="setFriendModalTab('requests')">요청 확인</button>
        </div>
        <div v-if="friendModalTab === 'search'">
          <h3>친구 검색</h3>
          <input class="search-input" v-model="searchQuery" placeholder="닉네임으로 검색하기" @input="searchFriends" />
          <div v-if="searchResults.length > 0" class="search-results">
            <div v-for="user in searchResults" :key="user.idx" class="search-result-item">
              <img :src="user.profileImageUrl || defaultProfileImage" class="profile-icon" />
              <span class="user-click">{{ user.userName }}</span>
              <button @click="sendFriendRequest(user.userId)">친구 추가 요청</button>
            </div>
          </div>
          <div v-else>
            <p>검색 결과가 없습니다.</p>
          </div>
        </div>

        <div v-if="friendModalTab === 'requests'">
          <h3>받은 요청</h3>
          <div v-if="friendRequests.length > 0" class="received-requests">
            <div v-for="request in friendRequests" :key="request.idx" class="request-item">
              <img :src="request.profileImageUrl || defaultProfileImage" class="profile-icon" />
              <span class="request-name">{{ request.userName }}</span>
              <div class="request-actions">
                <button @click="acceptFriendRequest(request.idx)">수락</button>
                <button @click="declineFriendRequest(request.idx)">거절</button>
              </div>
            </div>
          </div>
          <div v-else>
            <p>받은 친구 요청이 없습니다.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, onUpdated } from 'vue';
import axios from 'axios';
import { BASE_URL } from '@/config';
import defaultProfileImage from '@/assets/profile2.jpg';
import { useAuthStore } from '@/stores/authStore';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

const authStore = useAuthStore();
const userId = authStore.idx;
const friends = ref([]);
const friendRequests = ref([]);
const searchQuery = ref('');
const searchResults = ref([]);
const messages = ref([]);
const currentChatRoom = ref(null);
const newMessage = ref('');
const isFriendSearchModalOpen = ref(false);
const activeTab = ref('friends');
const chatroomMessagesRef = ref(null);
const friendModalTab = ref('search');
let sse = null;

const initializeTooltips = () => {
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
};

const setActiveTab = tab => {
  activeTab.value = tab;
};

const openFriendSearchModal = () => {
  isFriendSearchModalOpen.value = true;
};

const closeFriendSearchModal = () => {
  isFriendSearchModalOpen.value = false;
};

const setFriendModalTab = tab => {
  friendModalTab.value = tab;
};

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

const loadFriends = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/friend/${userId}/list`);
    console.log('Response data:', response.data);
    friends.value = response.data.map(friend => ({
      friendId: friend.friendId, // friendId 필드 추가
      userName: friend.userName,
      profileImageUrl: friend.profileImageUrl || defaultProfileImage,
      email: friend.email, // 필요하다면 다른 필드도 포함
    }));

    console.log('Loaded friends:', friends.value);
  } catch (error) {
    console.error('Failed to load friends:', error);
  }
};

const deleteFriend = async friendId => {
  try {
    console.log('Deleting friend with ID:', friendId);
    await axios.delete(`${BASE_URL}/friend/delete`, { params: { userId, friendId } });
    friends.value = friends.value.filter(friend => friend.friendId !== friendId); // friendId 기준으로 필터링
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
        'Content-Type': 'application/json',
      },
    });

    alert('친구 요청이 성공적으로 전송되었습니다.');
  } catch (error) {
    console.error('Failed to send friend request:', error.response?.data || error.message);
    alert('친구 요청 전송에 실패했습니다.');
  }
};

const loadFriendRequests = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/friend/${userId}/requests`);
    friendRequests.value = await Promise.all(
      response.data.map(async request => {
        const profileImageUrl = await loadProfileImage(request.idx);
        return { ...request, profileImageUrl };
      }),
    );
  } catch (error) {
    console.error('Failed to load friend requests:', error);
  }
};

const acceptFriendRequest = async requesterId => {
  try {
    await axios.post(`${BASE_URL}/friend/accept`, {
      params: {
        requesterId: requesterId,
        receiverId: userId,
      },
    });
    friendRequests.value = friendRequests.value.filter(request => request.idx !== requesterId);
    await loadFriends();
    alert('친구 요청을 수락했습니다.');
  } catch (error) {
    console.error('Failed to accept friend request:', error);
    alert('친구 요청 수락에 실패했습니다.');
  }
};

const loadMessages = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/message/conversations/${userId}`);
    console.log('Loaded conversations:', response.data);

    messages.value = response.data.map(conversation => ({
      id: conversation.otherUserId,
      userName: conversation.userName,
      profileImage: conversation.profileImage || defaultProfileImage,
      lastMessage: conversation.lastMessage,
      lastMessageTime: conversation.lastMessageTime,
    }));

    console.log('Messages processed:', messages.value);
  } catch (error) {
    console.error('Failed to load messages:', error);
  }
};

const formatTime = timestamp => {
  const date = new Date(timestamp);
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const openChat = async friendId => {
  try {
    const friend = friends.value.find(friend => friend.friendId === friendId);
    const response = await axios.get(`${BASE_URL}/message/messages/${userId}/${friendId}`);
    currentChatRoom.value = {
      name: friend.userName, // 친구 이름 설정
      profileImageUrl: friend.profileImageUrl,
      receiverId: friendId,
      messages: response.data,
    };
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error('채팅방 열기 실패:', error);
  }
};

const scrollToBottom = () => {
  if (chatroomMessagesRef.value) {
    chatroomMessagesRef.value.scrollTop = chatroomMessagesRef.value.scrollHeight;
  }
};

const addMessage = message => {
  currentChatRoom.value.messages.push(message);
  nextTick(() => scrollToBottom());
};

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  try {
    const response = await axios.post(`${BASE_URL}/message/send`, {
      senderId: userId,
      receiverId: currentChatRoom.value.receiverId,
      content: newMessage.value,
    });
    addMessage(response.data); // 메시지 추가 후 스크롤 이동
    newMessage.value = '';
  } catch (error) {
    console.error('메시지 전송 실패:', error);
  }
};

const subscribeToSSE = () => {
  if (sse) return;
  console.log('SSE 구독 시작');
  sse = new EventSource(`${BASE_URL}/message/subscribe/${userId}`);
  sse.addEventListener('message', event => {
    const newMessage = JSON.parse(event.data);
    if (currentChatRoom.value && currentChatRoom.value.receiverId === newMessage.senderId) {
      currentChatRoom.value.messages.push(newMessage);
      nextTick(() => scrollToBottom());
    }
    messages.value.unshift(newMessage);
  });
  sse.addEventListener('error', () => {
    sse.close();
    sse = null;
  });
};

const unsubscribeFromSSE = () => {
  if (sse) {
    console.log('SSE 구독 종료');
    sse.close();
    sse = null;
  }
};

onMounted(async () => {
  await loadFriends();
  await loadMessages();
  await loadFriendRequests();
  subscribeToSSE();
  initializeTooltips();

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

onUpdated(() => {
  initializeTooltips(); // DOM이 갱신될 때마다 툴팁 재초기화
});

onUnmounted(() => {
  unsubscribeFromSSE();
});
</script>

<style scoped>
.team-view {
  display: flex;
  gap: 20px;
  padding: 20px;
  background-color: #f9f9f9;
  height: 80vh;
}

.left-middle-section {
  flex: 0 0 27%;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.right-section {
  flex: 1;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
}

.toggle-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.toggle-buttons button {
  flex: 1;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #f1f1f1;
  cursor: pointer;
  margin-right: 10px;
  font-weight: bold;
}

.toggle-buttons button:last-child {
  margin-right: 0;
}

.toggle-buttons button.active {
  background-color: black;
  color: white;
}

.friend-list-container,
.message-list-container {
  display: flex;
  flex-direction: column;
}

.friend-item,
.message-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 5px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.friend-item .profile-icon,
.message-item .message-profile {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

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
  width: 23px;
  height: 23px;
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

.chat-message {
  max-width: 20%;
  padding: 1px 5px;
  border-radius: 10px;
  font-size: 0.9rem;
}

.my-message {
  align-self: flex-end;
  background-color: #dcf8c6;
}

.other-message {
  align-self: flex-start;
  background-color: #f1f1f1;
}

.chatroom-container {
  padding: 10px;
  flex-direction: column;
  height: 100%;
  position: relative;
  gap: 0;
}

.chatroom-messages {
  max-height: 615px;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  scroll-behavior: smooth;
}

.chatroom-messages::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.chatroom-messages::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}
.chatroom-messages::-webkit-scrollbar-thumb:hover {
  background: #555;
}
.chatroom-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chatroom-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.chatroom-input {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  padding: 8px;
  display: flex;
  gap: 10px;
  border-top: 1px solid #ccc;
}

.chatroom-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.chatroom-input button {
  padding: 10px 20px;
  border: none;
  background-color: black;
  color: white;
  border-radius: 5px;
}

.chatroom-profile-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.chatroom-name {
  font-weight: bold;
  font-size: 1.2rem;
}

.chat-message {
  margin-bottom: 10px;
}

.chatroom-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 1.2rem;
  font-weight: bold;
  color: black;
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

.request-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.request-item .profile-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
}

.request-name {
  font-size: 1rem;
  font-weight: bold;
  flex: 1;
}

.request-actions button {
  margin-left: 10px;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #4caf50;
  color: white;
}

.request-actions button:hover {
  background-color: #0056b3;
}

.request-actions button:nth-child(2) {
  background-color: #757575;
}

.request-actions button:nth-child(2):hover {
  background-color: #757575;
}
</style>
