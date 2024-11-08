<template>
  <div class="team-view">
    <!-- 친구 목록과 친구 검색 섹션을 담고 있는 전체 컨테이너 -->
    <div class="friend-container">
      <!-- 친구 목록 섹션 -->
      <div class="team-section">
        <div class="friends-list">
          <div class="friend-requests">
            <h3>친구 목록</h3>
            <div class="request-notification" @click="toggleRequestList">
              <span>친구 요청</span>
              <div v-if="friendRequests.length > 0" class="notification-badge">
                {{ friendRequests.length }}
              </div>
            </div>
            <!-- 친구 요청 목록 (토글) -->
            <transition name="fade">
              <ul v-if="showRequestList" class="request-list">
                <li v-for="request in friendRequests" :key="request.idx" class="request-item">
                  <img :src="request.profileImageUrl || defaultProfileImage" alt="프로필 이미지" class="profile-icon" />
                  <span>{{ request.userName }}</span>
                  <button @click="acceptFriendRequest(request.idx)">승인</button>
                </li>
              </ul>
            </transition>
            <!-- 친구 목록 -->
            <ul class="f-list">
              <li v-for="friend in friends" :key="friend.idx">
                <img :src="friend.profileImageUrl || defaultProfileImage" alt="프로필 이미지" class="profile-icon" />
                <span>{{ friend.userName }}</span>
                <span class="friend-email">{{ friend.email }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <!-- 친구 검색 섹션 -->
      <div class="team-section">
        <div class="friend-search">
          <h3>친구 검색</h3>
          <input v-model="searchQuery" placeholder="닉네임 입력..." @input="searchFriends" />
          <div v-if="searchResults.length > 0" class="search-results">
            <div v-for="user in searchResults" :key="user.idx" class="search-result-item">
              <img :src="user.profileImageUrl || defaultProfileImage" class="profile-icon" />
              <span>{{ user.userName }}</span>
              <span class="friend-email">{{ user.email }}</span>
              <button @click="sendFriendRequest(user.idx)">친구 추가</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 공유 일기 생성 및 공유 일기 섹션을 담고 있는 전체 컨테이너 -->
    <div class="friend-container">
      <!-- 공유 일기 생성 섹션 -->
      <div class="team-section">
        <div class="shared-diary-creation">
          <h3>공유일기 생성</h3>
          <button @click="openModal">+</button>
        </div>
      </div>
      <!-- 공유 일기 섹션 -->
      <div class="team-section">
        <div class="diary-content">
          <h3>공유일기</h3>
          <p v-if="!selectedDiary">공유 일기를 선택해주세요</p>
          <div v-if="selectedDiary" class="diary-details">
            <h4>{{ selectedDiary.title }}</h4>
            <p>{{ selectedDiary.content }}</p>
            <small>{{ selectedDiary.date }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- 모달 창 -->
    <transition name="modal">
      <div class="modal-overlay" v-if="isModalOpen" @click.self="closeModal">
        <div class="modal-content">
          <h3>공유일기 생성</h3>
          <div class="group-name">
            <h4>공유일기 그룹명</h4>
            <input v-model="sharedDiaryTitle" placeholder="공유일기 이름을 입력하세요" />
          </div>
          <!-- 친구 목록 드롭다운 -->
          <div class="friend-dropdown">
            <h4>나의 친구 목록</h4>
            <ul class="friend-list-dropdown">
              <li v-for="friend in friends" :key="friend.idx">
                <span>{{ friend.userName }}</span>
                <button @click="inviteFriend(friend)">+ 초대</button>
              </li>
            </ul>
          </div>
          <!-- 초대된 친구 목록 -->
          <div class="invited-list">
            <h4>공유일기에 초대할 친구 목록</h4>
            <ul>
              <li v-for="invited in invitedFriends" :key="invited.idx">
                <span>{{ invited.userName }}</span>
              </li>
            </ul>
          </div>
          <!-- 모달 하단 버튼들 -->
          <div class="modal-buttons">
            <button @click="createSharedDiary">공유일기 만들기</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { BASE_URL } from '@/config';
import defaultProfileImage from '@/assets/profile2.jpg';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const userId = authStore.idx;

const friends = ref([]);
const friendRequests = ref([]);
const searchQuery = ref('');
const searchResults = ref([]);
const selectedDiary = ref(null);
const showRequestList = ref(false);
const isModalOpen = ref(false); // 모달 창 열림 상태
const sharedDiaryTitle = ref(''); // 공유 일기 제목
const invitedFriends = ref([]); // 초대된 친구 목록
const showFriendDropdown = ref(false); // 친구 목록 드롭다운 표시 여부

// 모달 관련 함수들
const openModal = () => {
  isModalOpen.value = true;
};
const closeModal = () => {
  isModalOpen.value = false;
  sharedDiaryTitle.value = '';
  invitedFriends.value = [];
  showFriendDropdown.value = false;
};

const createSharedDiary = async () => {
  if (!sharedDiaryTitle.value.trim()) {
    alert('공유 일기 이름을 입력하세요.');
    return;
  }

  // 예시: 실제 공유일기 생성 API 요청
  try {
    const response = await axios.post(`${BASE_URL}/shared-diary/create`, {
      title: sharedDiaryTitle.value,
      invitedFriends: invitedFriends.value.map(friend => friend.idx),
    });
    alert(`공유일기 생성 완료: ${sharedDiaryTitle.value}`);
    console.log(response.data); // 생성된 공유일기 정보 확인
    closeModal();
  } catch (error) {
    console.error('공유일기 생성 실패:', error);
    alert('공유일기 생성에 실패했습니다.');
  }
};
const inviteFriend = friend => {
  // 이미 초대된 친구가 아닐 때만 추가
  if (!invitedFriends.value.some(f => f.idx === friend.idx)) {
    invitedFriends.value.push(friend);
    alert(`${friend.userName}님을 초대했습니다.`);
  } else {
    alert('이미 초대한 친구입니다.');
  }
};

// 프로필 이미지 불러오기 함수
const loadProfileImage = async userId => {
  try {
    const response = await axios.get(`${BASE_URL}/user/${userId}/profileImage`);
    let imageUrl = response.data;

    // 이미지 URL이 상대 경로라면 BASE_URL 추가
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `${BASE_URL}${imageUrl}`;
    }

    return imageUrl; // 최종 프로필 이미지 URL 반환
  } catch (error) {
    console.error(`Failed to load profile image for userId ${userId}:`, error);
    return defaultProfileImage; // 오류 시 기본 이미지 반환
  }
};

// 친구 목록 불러오기
const loadFriends = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/friend/${userId}/list`);
    friends.value = await Promise.all(
      response.data.map(async friend => {
        const profileImageUrl = await loadProfileImage(friend.idx);
        return { ...friend, profileImageUrl }; // 프로필 이미지 URL 포함한 친구 객체 반환
      }),
    );
  } catch (error) {
    console.error('Failed to load friends:', error);
  }
};

// 친구 요청 목록 불러오기
const loadFriendRequests = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/friend/${userId}/requests`);
    friendRequests.value = await Promise.all(
      response.data.map(async request => {
        const profileImageUrl = await loadProfileImage(request.idx);
        return { ...request, profileImageUrl }; // 프로필 이미지 URL 포함한 요청 객체 반환
      }),
    );
  } catch (error) {
    console.error('Failed to load friend requests:', error);
  }
};

// 친구 검색
const searchFriends = async () => {
  try {
    if (searchQuery.value.trim()) {
      const response = await axios.get(`${BASE_URL}/friend/search`, {
        params: { userName: searchQuery.value }, // userName으로 전달
      });
      searchResults.value = await Promise.all(
        response.data.map(async user => {
          const profileImageUrl = await loadProfileImage(user.idx);
          return { ...user, profileImageUrl }; // 프로필 이미지 URL 포함한 검색 결과 객체 반환
        }),
      );
    } else {
      searchResults.value = [];
    }
  } catch (error) {
    console.error('Failed to search friends:', error);
  }
};

// 친구 추가 요청 보내기
const sendFriendRequest = async receiverId => {
  console.log('Requester ID:', userId); // userId 확인
  console.log('Receiver ID:', receiverId); // receiverId 확인

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

// 친구 요청 수락
const acceptFriendRequest = async requesterId => {
  const receiverId = authStore.idx; // 현재 로그인한 사용자의 ID를 receiverId로 설정

  try {
    await axios.post(`${BASE_URL}/friend/accept`, null, {
      params: {
        requesterId,
        receiverId,
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

// 친구 요청 목록 토글
const toggleRequestList = () => {
  showRequestList.value = !showRequestList.value;
};

// 컴포넌트가 로드될 때 친구 목록 및 요청 목록 가져오기
onMounted(() => {
  loadFriends();
  loadFriendRequests();
});
</script>

<style scoped>
/* 전체 컨테이너 */
.team-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background-color: #f3f4f6;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 900px;
  margin: auto;
}

/* 친구 목록과 검색 섹션 */
.friend-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

/* 공통 박스 스타일 */
.team-section,
.diary-content {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

/* 친구 목록 리스트 */
.friends-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.friend-search {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* 프로필 아이콘 및 스타일 */
.profile-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  border: 1px solid #ddd;
}

/* 버튼 스타일 */
button {
  margin-left: auto;
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 0.85em;
  font-weight: 500;
}

button:hover {
  background-color: #2563eb;
}

/* 모달 오버레이 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 모달 내용 */
.modal-content {
  display: flex;
  flex-direction: column;
  background: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
}

/* 그룹 이름 입력 스타일 */
.group-name input {
  padding: 10px;
  border: 2px solid hsl(217, 100%, 78%);
  border-radius: 5px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
  max-width: 300px;
}

.group-name input:focus {
  border-color: hsl(221, 100%, 80%);
  box-shadow: 0px 0px 5px hwb(221 1% 59% / 0.502);
}

/* 친구 리스트와 검색 결과 리스트 */
.friend-list-dropdown,
.f-list > li {
  list-style: none;
}

.friend-list-dropdown {
  margin: 10px 0;
  padding: 0;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  max-height: 150px;
  overflow-y: auto;
}

.friend-list-dropdown li,
.request-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.notification-badge {
  background-color: #ef4444;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9em;
  font-weight: bold;
}

.modal-buttons {
  text-align: center;
  margin-top: 15px;
}

.modal-buttons button:first-child {
  background-color: #3b82f6;
  color: white;
}

.modal-buttons button:first-child:hover {
  background-color: #2563eb;
}
</style>

