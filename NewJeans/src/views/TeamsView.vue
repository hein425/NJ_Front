<template>
  <div class="team-view">
    <!-- 친구 요청 및 교환일기 요청 섹션 -->
    <div class="notification-container">
      <!-- 친구 요청 구역 -->
      <div class="notification-section">
        <div class="request-notification" @click="toggleRequestList">
          <span class="notification-message">새로운 친구 요청이 왔습니다.</span>
          <div v-if="friendRequests.length > 0" class="notification-badge">
            {{ friendRequests.length }}
          </div>
        </div>
        <!-- 친구 요청 목록 (토글) -->
        <transition name="fade">
          <ul v-if="showRequestList" class="request-list">
            <li v-for="request in friendRequests" :key="request.idx" class="search-result-item">
              <img :src="request.profileImageUrl || defaultProfileImage" alt="프로필 이미지" class="profile-icon" />
              <span class="user-click">{{ request.userName }}</span>
              <button @click="acceptFriendRequest(request.idx)">수락하기</button>
            </li>
          </ul>
        </transition>
      </div>

      <!-- 교환일기 요청 구역 -->
      <div class="notification-section">
        <div class="request-notification" @click="toggleExchangeDiaryRequestList">
          <span class="notification-message">새로운 교환일기 요청이 왔습니다.</span>
          <div v-if="exchangeDiaryRequests.length > 0" class="notification-badge">
            {{ exchangeDiaryRequests.length }}
          </div>
        </div>
        <!-- 교환일기 요청 목록 (토글) -->
        <transition name="fade">
          <ul v-if="showExchangeDiaryRequestList" class="request-list">
            <li v-for="request in exchangeDiaryRequests" :key="request.idx" class="search-result-item">
              <img :src="request.profileImageUrl || defaultProfileImage" alt="프로필 이미지" class="profile-icon" />
              <span class="user-click">{{ request.userName }}</span>
              <button @click="acceptExchangeDiaryRequest(request.idx)">수락하기</button>
            </li>
          </ul>
        </transition>
      </div>
    </div>

    <!-- 친구 목록과 친구 검색 섹션 -->
      <!-- 친구 목록 섹션 -->
      <div class="notification-container">
        <div class="notification-section">
        <div class="friends-list">
          <h3>나의 친구 목록</h3>
          <ul class="f-list">
            <li v-for="friend in friends" :key="friend.idx" class="search-result-item">
              <img :src="friend.profileImageUrl || defaultProfileImagerequest-item" alt="프로필 이미지" class="profile-icon" />
              <span class="user-click">{{ friend.userName }}</span>
              <span class="friend-email">{{ friend.email }}</span>
              <button>콕 찌르기</button>
            </li>
          </ul>
        </div>
      </div>

      <!-- 친구 검색 섹션 -->
      <div class="notification-container">
        <div class="notification-section">
        <div class="friend-search">
          <h3>친구 검색</h3>
          <input class="search-input" v-model="searchQuery" placeholder="닉네임으로 검색하기" @input="searchFriends" />
          <div v-if="searchResults.length > 0" class="search-results">
            <div v-for="user in searchResults" :key="user.idx" class="search-result-item">
              <img :src="user.profileImageUrl || defaultProfileImage" class="profile-icon" />
              <span class="user-click">{{ user.userName }}</span>
              <span class="friend-email">{{ user.email }}</span>
              <button @click="sendFriendRequest(user.idx)">친구 추가 요청</button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>


  <div class="notification-container">
    
      <!-- 내 교환일기 섹션 -->
<div class="notification-section">
  <div class="exchange-diary-section">
    <button class="request-exchange-button" @click="openModal">교환일기 신청하기</button>
    
    <div v-for="diary in exchangeDiaries" :key="diary.id" class="exchange-diary">
      <!-- 팀 이름 클릭 시 엔트리 목록 로드 -->
      <h4 @click="toggleDiaryEntries(diary.diaryId)">
        팀이름 : {{ diary.groupName }}
      </h4>
      <div class="participants">
          참가자:
          <span v-for="participant in diary.participants" :key="participant" class="participant">
            {{ participant }}
          </span>
        </div>
    </div>
  </div>
</div>

<!-- 내 교환일기 목록 -->
<div class="notification-section">
  <div class="friend-search">
    <h3>내 교환 일기 목록</h3>
  </div>
  <ul class="exchange-diary-list">
    <li v-for="diary in exchangeDiaries" :key="diary.diaryId" class="exchange-diary-item">
      <!-- 엔트리 목록 표시 (팀 이름 및 참가자 제외) -->
      <ul v-if="openDiaryId === diary.diaryId">
        <li v-for="entry in diary.entries" :key="entry.id" class="entry-item">
          <p>{{ entry.content }}</p>
          <small>작성자: {{ entry.authorName }}</small>
        </li>
      </ul>
    </li>
  </ul>
</div>

<!-- 교환일기 생성 모달 -->
<transition name="modal">
  <div class="modal-overlay" v-if="isModalOpen" @click.self="closeModal">
    <div class="modal-content">
      <h3>교환일기 신청</h3>
          <!-- 그룹명 입력 필드 -->
          <div class="group-name-input">
        <label for="group-name">그룹명:</label>
        <input
          id="group-name"
          type="text"
          v-model="groupName"
          placeholder="그룹명을 입력하세요"
        />
      </div>
      <!-- 친구 목록 드롭다운 -->
      <div class="friend-dropdown">
        <h4>나의 친구 목록</h4>
        <ul class="friend-list-dropdown">
          <li v-for="friend in friends" :key="friend.idx" class="search-result-item">
            <img :src="friend.profileImageUrl || defaultProfileImage" class="profile-icon" />
            <span class="user-click">{{ friend.userName }}</span>
            <button @click="selectFriend(friend)">+ 초대</button>
          </li>
        </ul>
      </div>
      
      <!-- 초대할 친구 -->
      <div class="invited-list">
        <h4>교환일기에 초대할 친구</h4>
        <ul class="f-list">
          <li v-if="selectedFriend" class="search-result-item">
            <img :src="selectedFriend.profileImageUrl || defaultProfileImage" class="profile-icon" />
            <span class="user-click">{{ selectedFriend.userName }}</span>
          </li>
        </ul>
      </div>

<!-- 모달 하단 버튼들 -->
          <div class="modal-buttons">
            <button @click="sendExchangeDiaryRequest">교환일기 신청하기</button>
          </div>


    </div>
  </div>
</transition>
</div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { BASE_URL } from '@/config';
import defaultProfileImage from '@/assets/profile2.jpg';
import { useAuthStore } from '@/stores/authStore';

// AuthStore에서 현재 로그인한 사용자 ID 가져오기
const authStore = useAuthStore();
const userId = authStore.idx;

// 상태 변수들
const friends = ref([]); // 친구 목록
const friendRequests = ref([]); // 친구 요청 목록
const exchangeDiaryRequests = ref([]); // 교환일기 요청 목록
const searchQuery = ref(''); // 검색어
const searchResults = ref([]); // 검색 결과
const selectedFriend = ref(null); // 선택된 친구
const showRequestList = ref(false); // 친구 요청 목록 표시 여부
const showExchangeDiaryRequestList = ref(false); // 교환일기 요청 목록 표시 여부
const isModalOpen = ref(false); // 모달 창 열림 상태
const exchangeDiaries = ref([]); // 교환 일기 목록
const openDiaryId = ref(null); // 열려 있는 일기의 ID
const groupName = ref(''); // 그룹명 상태 추가






// 모달 관련 함수들
const openModal = () => {
  isModalOpen.value = true;
};
const closeModal = () => {
  isModalOpen.value = false;
  selectedFriend.value = null; // 모달을 닫을 때 선택된 친구 초기화
  groupName.value = ''; // 그룹명 초기화
};

// 엔트리 목록을 가져오는 함수
const fetchDiaryEntries = async (diaryId) => {
  try {
    const response = await axios.get(`${BASE_URL}/exchange-diary-entry/exchangeDiaryList/${diaryId}`, {
      params: { userId: userId }  // 추가된 userId 전달
    });
    const diary = exchangeDiaries.value.find(d => d.diaryId === diaryId);
    diary.entries = response.data;
  } catch (error) {
    console.error('Failed to load diary entries:', error);
  }
};


// 페이지 로드 시 교환일기 목록을 불러오는 함수
const loadExchangeDiaries = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/exchange-diary-entry/summary/${userId}`); // 현재 userId로 교환일기 목록 불러오기
    exchangeDiaries.value = response.data;
  } catch (error) {
    console.error('Failed to load exchange diaries:', error);
  }
};

// 엔트리 목록을 토글하는 함수 (팀 이름 클릭 시 호출)
const toggleDiaryEntries = (diaryId) => {
  if (openDiaryId.value === diaryId) {
    openDiaryId.value = null; // 현재 열려있는 항목을 닫음
  } else {
    openDiaryId.value = diaryId; // 새 항목을 열고 엔트리 로드
    fetchDiaryEntries(diaryId);
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
      })
    );
  } catch (error) {
    console.error('Failed to load friends:', error);
  }
};

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

// 친구 요청 목록 불러오기
const loadFriendRequests = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/friend/${userId}/requests`);
    friendRequests.value = await Promise.all(
      response.data.map(async request => {
        const profileImageUrl = await loadProfileImage(request.idx);
        return { ...request, profileImageUrl };
      })
    );
  } catch (error) {
    console.error('Failed to load friend requests:', error);
  }
};

// 교환일기 요청 목록 불러오기
const loadExchangeDiaryRequests = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/exchange-diary/${userId}/requests`);
    exchangeDiaryRequests.value = await Promise.all(
      response.data.map(async request => {
        const profileImageUrl = await loadProfileImage(request.idx);
        return { ...request, profileImageUrl };
      })
    );
  } catch (error) {
    console.error('Failed to load exchange diary requests:', error);
  }
};

// 친구 요청 목록 토글
const toggleRequestList = () => {
  showRequestList.value = !showRequestList.value;
};

// 교환일기 요청 목록 토글
const toggleExchangeDiaryRequestList = () => {
  showExchangeDiaryRequestList.value = !showExchangeDiaryRequestList.value;
};

// 친구 요청 수락
const acceptFriendRequest = async requesterId => {
  try {
    await axios.post(`${BASE_URL}/friend/accept`, null, {
      params: {
        requesterId,
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

// 교환일기 요청 수락
const acceptExchangeDiaryRequest = async requesterId => {
  try {
    await axios.post(`${BASE_URL}/exchange-diary/accept`, null, {
      params: {
        requesterId,
        receiverId: userId,
      },
    });
    exchangeDiaryRequests.value = exchangeDiaryRequests.value.filter(request => request.idx !== requesterId);
    alert('교환일기 요청을 수락했습니다.');
  } catch (error) {
    console.error('Failed to accept exchange diary request:', error);
    alert('교환일기 요청 수락에 실패했습니다.');
  }
};

// 친구 검색
const searchFriends = async () => {
  try {
    if (searchQuery.value.trim()) {
      const response = await axios.get(`${BASE_URL}/friend/search`, {
        params: { userId: userId, userName: searchQuery.value },
      });
      searchResults.value = await Promise.all(
        response.data.map(async user => {
          const profileImageUrl = await loadProfileImage(user.idx);
          return { ...user, profileImageUrl };
        })
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

// 친구 선택 함수 (한 명만 선택 가능)
const selectFriend = friend => {
  selectedFriend.value = friend; // 선택한 친구로 업데이트
};

/// 교환일기 요청 보내기
const sendExchangeDiaryRequest = async () => {
  if (!groupName.value) {
    alert("그룹명을 입력하세요.");
    return;
  }
  
  if (!selectedFriend.value) {
    alert("교환일기에 초대할 친구를 선택하세요.");
    return;
  }

  try {
    await axios.post(`${BASE_URL}/exchange-diary/request`, null, {
      params: {
        requesterId: userId,
        receiverId: selectedFriend.value.idx,
        groupName: groupName.value // 그룹명 전달
      },
    });
    alert("교환일기 신청이 성공적으로 전송되었습니다.");
    closeModal(); // 모달 닫기
  } catch (error) {
    console.error('Failed to send exchange diary request:', error);
    alert('교환일기 신청에 실패했습니다.');
  }
};
// 컴포넌트가 로드될 때 친구 목록 및 요청 목록 가져오기
onMounted(async () => {
  
  await loadFriends();
  await loadFriendRequests();
  await loadExchangeDiaries();
  await loadExchangeDiaryRequests();
  console.log(exchangeDiaries.value); // 데이터 로드 확인용 로그
});
</script>





<style scoped>
.team-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background-color: #f3f4f6;
  border-radius: 12px;
  max-width: 1250px;
  margin: auto;
  margin-left: 50px;
}

/* 알림 컨테이너 */
.notification-container {
  display: flex;
  gap: 20px;
}

/* 알림 섹션 */
.notification-section {
  flex: 1;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  width: 585px;
}

.request-notification {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #3b82f6;
  color: white;
  padding: 8px;
  border-radius: 50px;
  cursor: pointer;
}

.notification-badge {
  background-color: #ef4444;
  color: white;
  border-radius: 30%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  font-weight: bold;
  margin-right: 10px;
}

.request-list {
  margin: 0; /* 리스트 자체의 마진을 없앱니다. */
  padding: 0; /* 리스트의 기본 패딩을 없앱니다. */
}


.profile-icon {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  margin-right: 10px;
  border: 2px solid #ddd;
}

/* 친구 목록과 검색 섹션 */
.friend-container {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 균등한 열 비율 */
  gap: 20px;
  width: 100%; /* 부모 요소에 맞게 확장 */
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.team-section {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.friends-list,
.friend-search {
  width: 100%;
}

.f-list,
.search-results {
  list-style: none;
  padding: 0;
}

.f-list li,
.search-result-item {
  display: flex;
  align-items: center;
  margin: 20px 0;
  font-size : 1.3rem;
}

.friend-email {
  margin-left: auto;
  font-size: 1.1em;
  color: #6b7280;
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

/* 모달 스타일 */
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

.friend-list-dropdown {
  margin: 10px 0;
  padding: 0;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  max-height: 150px;
  overflow-y: auto;
}

.friend-list-dropdown li {
  display: flex;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-buttons {
  text-align: center;
  margin-top: 15px;
}

.modal-buttons button {
  background-color: #3b82f6;
  color: white;
  padding: 8px 16px;
}

.modal-buttons button:hover {
  background-color: #2563eb;
}

.search-input {
  width: 100%; /* 검색창의 너비를 100%로 설정하여 부모 요소에 맞게 확장 */
  max-width: 400px; /* 최대 너비를 설정하여 너무 길어지지 않도록 제한 */
  padding: 12px 20px; /* 위, 아래는 12px, 양옆은 20px의 여백 */
  font-size: 1.3em; /* 검색창 글자 크기를 키워 가독성 향상 */
  border: 1px solid #ddd; /* 기본 테두리 색상 설정 */
  border-radius: 10px; /* 둥근 모서리로 세련된 느낌 */
  outline: none; /* 클릭 시 나타나는 기본 테두리 제거 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 부드러운 그림자 효과 추가 */
  transition: all 0.3s ease; /* 포커스 시 부드러운 전환 효과 */
  /* 배경색을 밝은 회색으로 설정하여 현대적인 느낌 */
  background-color: #f9f9f9;
  color: #333; /* 글자 색상 */
  margin-left: 60px;
}

.search-input::placeholder {
  color: #aaa; /* 플레이스홀더 글자 색상 */
}

/* 포커스 시의 스타일 */
.search-input:focus {
  border-color: #3b82f6; /* 포커스 시 테두리 색상을 파란색으로 */
  background-color: #ffffff; /* 포커스 시 배경을 흰색으로 전환 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* 포커스 시 그림자 강조 */
}
.notification-message {
  font-size: 1.2em; /* 기본 글자 크기 */
  font-weight: bold; /* 굵은 글씨로 강조 */
  color: #ffffff; /* 알림 메시지 색상 */
  animation: pulse 1.5s infinite; /* 애니메이션 추가 */
  display: block; /* 블록으로 변경하여 중앙 정렬에 적용 */
  text-align: center; /* 텍스트를 중앙으로 정렬 */
  padding-left: 130px;
  margin: 10px 0; /* 상하 여백 */
}

/* 글씨가 커졌다 작아지는 애니메이션 */
@keyframes pulse {
  0%, 100% {
    transform: scale(1); /* 원래 크기 */
  }
  70% {
    transform: scale(1.05); /* 중간에 약간 커짐 */
  }
}
/* h3 스타일 */
h3 {
  font-size: 1.6em; /* 글씨 크기 */
  font-weight: 600; /* 굵은 글씨체 */
  color: #333; /* 짙은 회색 글씨 색상 */
  margin-bottom: 15px; /* 아래쪽 여백 */
  position: relative; /* 가로 구분선을 위한 위치 설정 */
  padding-bottom: 8px; /* 구분선과의 간격 */
  text-align: center; /* 텍스트 중앙 정렬 */
}

/* 하단에 구분선을 추가 */
h3::after {
  content: ""; /* 내용 없음, 구분선 역할 */
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  width: 60%; /* 구분선 너비 */
  height: 3px; /* 구분선 두께 */
  background-color: #3b82f6; /* 구분선 색상 */
  border-radius: 2px; /* 둥근 모서리 */
  opacity: 0.8; /* 약간의 투명도 */
}

/* 애니메이션 효과 추가 */
h3 {
  animation: fadeIn 1s ease; /* 서서히 나타나는 효과 */
}

@keyframes fadeIn {
  from {
    opacity: 0; /* 투명하게 시작 */
    transform: translateY(-10px); /* 위에서 내려오는 효과 */
  }
  to {
    opacity: 1; /* 완전히 보이도록 */
    transform: translateY(0); /* 원래 위치 */
  }
}
.user-click {
  cursor: pointer;
  margin-left: 10px;
  font-size: 1.1em; /* 기본 글씨 크기 */
  font-weight: 600; /* 적당히 두꺼운 글씨 */
  color: #333333; /* 검정색에 가까운 진한 회색 */
  transition: transform 0.2s ease, color 0.2s ease; /* 부드러운 확대 전환 효과 */
}

.user-click:hover {
  color: #000000; /* 마우스 오버 시 검정색으로 변경 */
  transform: scale(1.05); /* 약간 확대되는 효과 */
}

.user-click:active {
  transform: scale(1); /* 클릭 시 원래 크기로 돌아감 */
}
.exchange-diary-section {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.request-exchange-button {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  margin-bottom: 20px;
  transition: background-color 0.3s;
}

.request-exchange-button:hover {
  background-color: #2563eb;
}

.exchange-diary {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #ffffff;
}

.exchange-diary h4 {
  margin: 0;
  font-weight: bold;
  cursor: pointer;
}

.exchange-diary ul {
  margin-top: 10px;
}

.modal-buttons {
  text-align: center;
  margin-top: 15px;
}

.modal-buttons button {
  background-color: #3b82f6;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
}

.modal-buttons button:hover {
  background-color: #2563eb;
}
/* 스타일은 필요에 따라 추가 */
.exchange-diary-list {
  list-style: none;
  padding: 0;
}

.exchange-diary-item {
  padding: 10px;
}

.participants {
  font-size: 0.9em;
  color: #666;
}

.entry-item {
  padding: 5px 0;
}



</style>


