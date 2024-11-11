<template>
  <div class="team-view">
    <!-- 친구 요청 및 교환일기 요청 섹션 -->
    <div class="notification-container">
      <!-- 친구 요청 구역 -->
      <div class="notification-section">
        <div class="request-notification" @click="toggleRequestList">
          <span class="notification-message">새로운 친구 요청이 확인하기</span>
          <div v-if="friendRequests.length > 0" class="notification-badge">
            {{ friendRequests.length }}
          </div>
        </div>
        <!-- 친구 요청 목록 (토글) -->
        <transition name="fade">
          <ul v-if="friendRequests.length" class="request-list">
            <li v-for="request in friendRequests" :key="request.userId" class="search-result-item">
              <img :src="request.profileImageUrl" alt="프로필 이미지" class="profile-icon" />
              <span class="user-click">{{ request.userName }}</span>
              <span class="friend-email">{{ request.email }}</span>
              <button @click="acceptFriendRequest(request.userId)">수락</button>
              <button class="delete-button-ex" @click="rejectFriendRequest(request.userId)">거절</button>
            </li>
          </ul>
        </transition>
      </div>

      <!-- 교환일기 요청 구역 -->
      <div class="notification-section">
        <div class="request-notification" @click="toggleExchangeDiaryRequestList">
          <span class="notification-message">새로운 교환일기 요청이 확인하기</span>
          <div v-if="exchangeDiaryRequests.length > 0" class="notification-badge">
            {{ exchangeDiaryRequests.length }}
          </div>
        </div>
        <!-- 교환일기 요청 목록 (토글) -->
        <transition name="fade">
          <ul v-if="exchangeDiaryRequests.length" class="request-list">
            <li v-for="request in exchangeDiaryRequests" :key="request.diaryId" class="search-result-item">
              <img :src="request.profileImageUrl" alt="프로필 이미지" class="profile-icon" />
              <span class="user-click">{{ request.userName }}</span>
              <span class="friend-email">{{ request.email }}</span>
              <button @click="acceptExchangeDiaryRequest(request.diaryId, request.userId, userId)">수락</button>
              <button class="delete-button-ex" @click="rejectExchangeDiaryRequest(request.diaryId)">거절</button>
            </li>
          </ul>
        </transition>
      </div>
    </div>

    <!-- 친구 목록과 친구 검색 섹션 -->
    <div class="notification-container">
      <div class="notification-section">
        <div class="friends-list">
          <h3>나의 친구 목록</h3>
          <ul class="f-list">
            <li v-for="friend in friends" :key="friend.idx" class="search-result-item">
              <img :src="friend.profileImageUrl || defaultProfileImage" alt="프로필 이미지" class="profile-icon" />
              <span class="user-click">{{ friend.userName }}</span>
              <span class="friend-email">{{ friend.email }}</span>
              <button>콕 찌르기</button>
              <button class="delete-button">친구 삭제</button>
            </li>
          </ul>
        </div>
      </div>

      <!-- 친구 검색 섹션 -->
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

    <!-- 내 교환일기 섹션 -->
    <div class="notification-container">
      <div class="notification-section">
        <div class="exchange-diary-section">
          <div>
            <button class="request-exchange-button" @click="openModal">교환일기 신청하기</button>
          </div>
          <div v-for="diary in exchangeDiaries" :key="diary.diaryId" class="exchange-diary">
            <div class="diary-header">
              <h4 @click="toggleDiaryEntries(diary.diaryId)">교환 일기 이름: {{ diary.groupName }}</h4>
              <button class="request-exchange-button" @click="openEntryModal(diary.diaryId)">일기 쓰기</button>
              <button class="delete-button-ex" @click="deleteExchangeDiary(diary.diaryId)">교환 관계 끊고 모든 데이터 삭제</button>
            </div>
            <div class="participants">
              참가자: <span>{{ formatParticipants(diary.participants) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 일기 수정 모달 -->
      <transition name="modal">
        <div class="modal-overlay" v-if="isUpdateModalOpen" @click.self="closeUpdateModal">
          <div class="modal-content">
            <h3>일기 수정</h3>
            <div class="entry-title-input">
              <label for="entry-title">제목:</label>
              <input id="entry-title" type="text" v-model="entryTitle" placeholder="제목을 입력하세요" />
            </div>
            <div class="entry-content-input">
              <label for="entry-content">내용:</label>
              <textarea id="entry-content" v-model="entryContent" placeholder="내용을 입력하세요"></textarea>
            </div>
            <div class="modal-buttons">
              <button @click="submitEntryUpdate">수정 완료</button>
            </div>
          </div>
        </div>
      </transition>

      <!-- 내 교환일기 목록 -->
      <div class="notification-section">
        <h3>내 교환 일기 목록</h3>
        <ul class="exchange-diary-list">
          <li v-for="diary in exchangeDiaries" :key="diary.diaryId" class="exchange-diary-item">
            <ul v-if="openDiaryId === diary.diaryId">
              <li v-for="entry in diary.entries" :key="entry.entryId" class="entry-item">
                <p><strong>제목:</strong> {{ entry.title }}</p>
                <p><strong>내용:</strong> {{ entry.content }}</p>
                <small>
                  <strong>작성자:</strong> {{ entry.authorName }} | <strong>작성일:</strong> {{ new Date(entry.createdAt).toLocaleString() }}
                  <button @click="openUpdateEntryModal(entry)">수정</button>
                  <button @click="deleteExchangeDiaryEntry(entry.entryId)">삭제</button>
                </small>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <!-- 교환일기 생성 모달 -->
      <transition name="modal">
        <div class="modal-overlay" v-if="isCreateModalOpen " @click.self="closeCreateModal">
          <div class="modal-content">
            <h3>교환일기 신청</h3>
            <div class="group-name-input">
              <label for="group-name">그룹명:</label>
              <input id="group-name" type="text" v-model="groupName" placeholder="그룹명을 입력하세요" />
            </div>
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
            <div class="invited-list">
              <h4>교환일기에 초대할 친구</h4>
              <ul class="f-list">
                <li v-if="selectedFriend" class="search-result-item">
                  <img :src="selectedFriend.profileImageUrl || defaultProfileImage" class="profile-icon" />
                  <span class="user-click">{{ selectedFriend.userName }}</span>
                </li>
              </ul>
            </div>
            <div class="modal-buttons">
              <button @click="sendExchangeDiaryRequest">교환일기 신청하기</button>
            </div>
          </div>
        </div>
      </transition>

      <!-- 일기 쓰기 모달 -->
      <transition name="modal">
        <div class="modal-overlay" v-if="isEntryModalOpen" @click.self="closeEntryModal">
          <div class="modal-content">
            <h3>일기 쓰기</h3>
            <div class="entry-title-input">
              <label for="entry-title">제목:</label>
              <input id="entry-title" type="text" v-model="entryTitle" placeholder="제목을 입력하세요" />
            </div>
            <div class="entry-content-input">
              <label for="entry-content">내용:</label>
              <textarea id="entry-content" v-model="entryContent" placeholder="내용을 입력하세요"></textarea>
            </div>
            <div class="modal-buttons">
              <button @click="submitEntry">작성 완료</button>
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
const isUpdateModalOpen = ref(false); // 수정 모달 열림 상태 추가
const isCreateModalOpen = ref(false); // 생성 모달 열림 상태 추가
const exchangeDiaries = ref([]); // 교환 일기 목록
const openDiaryId = ref(null); // 열려 있는 일기의 ID
const groupName = ref(''); // 그룹명 상태 추가
const isEntryModalOpen = ref(false); // 일기 쓰기 모달 열림 상태
const entryTitle = ref(''); // 일기 제목
const entryContent = ref(''); // 일기 내용
const selectedDiaryId = ref(null); // 선택한 다이어리 ID
const entryId = ref(null); // 수정할 일기 ID

// 일기 쓰기 모달 열기
const openEntryModal = diaryId => {
  console.log('diaryId:', diaryId); // 전달된 diaryId 값 확인
  if (!diaryId) {
    alert('유효하지 않은 다이어리 ID입니다.');
    return;
  }
  selectedDiaryId.value = diaryId;
  isEntryModalOpen.value = true;
};

// 참가자 포맷 함수
const formatParticipants = participants => {
  if (participants.length === 1) return participants[0];
  return `${participants.slice(0, -1).join(', ')}와 ${participants[participants.length - 1]}`;
};

// 모달 닫기
const closeEntryModal = () => {
  isEntryModalOpen.value = false;
  entryTitle.value = '';
  entryContent.value = '';
  selectedDiaryId.value = null;
};

// 생성 요청 전송 함수
const submitEntry = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/exchange-diary-entry/create`, {
      diaryId: selectedDiaryId.value,
      userId: userId,
      title: entryTitle.value,
      content: entryContent.value,
    });
    alert(response.data); // 작성 성공 메시지
    closeCreateModal(); // 모달 닫기
  } catch (error) {
    console.error('Failed to submit entry:', error);
    alert('일기 작성에 실패했습니다.');
  }
};

// 모달 관련 함수들
const openModal = () => {
  isModalOpen.value = true;
};

// 수정 모달 열기
const openUpdateEntryModal = (entry) => {
  entryId.value = entry.entryId;
  entryTitle.value = entry.title;
  entryContent.value = entry.content;
  isUpdateModalOpen.value = true; // 수정 모달 열기
};

// 수정 모달 닫기
const closeUpdateModal = () => {
  isUpdateModalOpen.value = false;
  entryTitle.value = '';
  entryContent.value = '';
  entryId.value = null;
};

// 생성 모달 닫기
const closeCreateModal = () => {
  isCreateModalOpen.value = false;
  entryTitle.value = '';
  entryContent.value = '';
  selectedDiaryId.value = null;
};

// 생성 모달 열기
const openCreateEntryModal = diaryId => {
  selectedDiaryId.value = diaryId;
  isCreateModalOpen.value = true; // 생성 모달 열기
};

// 수정 요청 전송 함수
const submitEntryUpdate = async () => {
  try {
    // 로그로 요청 데이터 확인
    console.log("Update Request Data:", {
      entryId: entryId.value,
      title: entryTitle.value,
      content: entryContent.value,
      userId: userId,
    });
    
    const response = await axios.post(`${BASE_URL}/exchange-diary-entry/update`, {
      entryId: entryId.value,
      title: entryTitle.value,
      content: entryContent.value,
      userId: userId,
    });

    exchangeDiaries.value = exchangeDiaries.value.map(diary => {
      if (diary.diaryId === openDiaryId.value) {
        return {
          ...diary,
          entries: diary.entries.map(entry => 
            entry.entryId === entryId.value ? { ...entry, title: entryTitle.value, content: entryContent.value } : entry
          ),
        };
      }
      return diary;
    });

    alert('일기가 성공적으로 수정되었습니다.');
    closeUpdateModal();
  } catch (error) {
    console.error('Failed to update diary entry:', error);
    alert('일기 수정에 실패했습니다.');
  }
};


// 엔트리 목록을 가져오는 함수
const fetchDiaryEntries = async diaryId => {
  try {
    const response = await axios.get(`${BASE_URL}/exchange-diary-entry/exchangeDiaryList/${diaryId}`, {
      params: { userId: userId }, // 추가된 userId 전달
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
    const response = await axios.get(`${BASE_URL}/exchange-diary-entry/summary/${userId}`);
    exchangeDiaries.value = response.data.map(diary => ({
      ...diary,
      diaryId: diary.diaryId || diary.idx, // 일관성 유지
    }));
  } catch (error) {
    console.error('Failed to load exchange diaries:', error);
  }
};

// 엔트리 목록을 토글하는 함수 (팀 이름 클릭 시 호출)
const toggleDiaryEntries = diaryId => {
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
      }),
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
      }),
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
      }),
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

// 친구 요청 거절 함수
const rejectFriendRequest = async (friendRequestId) => {
  try {
    await axios.post(`${BASE_URL}/friend/reject`, null, {
      params: { rejectedRequestId: friendRequestId },
    });
    friendRequests.value = friendRequests.value.filter(request => request.userId !== friendRequestId);
    alert('친구 요청을 거절했습니다.');
  } catch (error) {
    console.error('Failed to reject friend request:', error);
    alert('친구 요청 거절에 실패했습니다.');
  }
};

// 교환일기 요청 수락
const acceptExchangeDiaryRequest = async (diaryId, requesterId, receiverId) => {
  if (!diaryId) {
    alert('유효하지 않은 다이어리 ID입니다.');
    return;
  }

  try {
    await axios.post(`${BASE_URL}/exchange-diary/accept`, null, {
      params: {
        diaryId,
        requesterId,
        receiverId,
      },
    });
    exchangeDiaryRequests.value = exchangeDiaryRequests.value.filter(request => request.diaryId !== diaryId);
    alert('교환일기 요청을 수락했습니다.');
  } catch (error) {
    console.error('Failed to accept exchange diary request:', error);
    alert('교환일기 요청 수락에 실패했습니다.');
  }
};

// 교환일기 요청 거절
const rejectExchangeDiaryRequest = async (exchangeDiaryId) => {
  try {
    await axios.post(`${BASE_URL}/exchange-diary/reject`, null, {
      params: { exchangeDiaryId },
    });
    exchangeDiaryRequests.value = exchangeDiaryRequests.value.filter(
      request => request.diaryId !== exchangeDiaryId
    );
    alert('교환일기 요청을 거절했습니다.');
  } catch (error) {
    console.error('Failed to reject exchange diary request:', error);
    alert('교환일기 요청 거절에 실패했습니다.');
  }
};

// 교환 일기 삭제
const deleteExchangeDiary = async (exchangeDiaryId) => {
  try {
    await axios.delete(`${BASE_URL}/exchange-diary/${exchangeDiaryId}`);
    exchangeDiaries.value = exchangeDiaries.value.filter(diary => diary.diaryId !== exchangeDiaryId);
    alert('교환일기가 성공적으로 삭제되었습니다.');
  } catch (error) {
    console.error('Failed to delete exchange diary:', error);
    alert('교환일기 삭제에 실패했습니다.');
  }
};

// 일기 엔트리 삭제
const deleteExchangeDiaryEntry = async (entryId) => {
  try {
    await axios.delete(`${BASE_URL}/exchange-diary-entry/delete/${entryId}`);
    // 삭제된 엔트리를 화면에서 즉시 제거
    exchangeDiaries.value = exchangeDiaries.value.map(diary => {
      if (diary.diaryId === openDiaryId.value) {
        return {
          ...diary,
          entries: diary.entries.filter(entry => entry.entryId !== entryId)
        };
      }
      return diary;
    });
    alert('일기가 성공적으로 삭제되었습니다.');
  } catch (error) {
    console.error('Failed to delete diary entry:', error);
    alert('일기 삭제에 실패했습니다.');
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
  try {
    const response = await axios.post(`${BASE_URL}/exchange-diary/request`, null, {
      params: {
        requesterId: userId,
        receiverId: selectedFriend.value.idx,
        groupName: groupName.value,
      },
    });
    const diaryId = response.data; // 백엔드에서 반환된 다이어리 ID 저장
    alert(`교환일기 신청이 성공적으로 전송되었습니다. Diary ID: ${diaryId}`);

    // 요청 후 교환 일기 목록을 업데이트할 때 diaryId도 포함해서 저장
    exchangeDiaryRequests.value.push({
      diaryId,
      userId: selectedFriend.value.idx,
      userName: selectedFriend.value.userName,
      profileImageUrl: selectedFriend.value.profileImageUrl,
    });
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
  font-size: 1.3rem;
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
  0%,
  100% {
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
  content: ''; /* 내용 없음, 구분선 역할 */
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
  transition:
    transform 0.2s ease,
    color 0.2s ease; /* 부드러운 확대 전환 효과 */
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
  list-style: none;
  padding: 10px;
}

.participants {
  font-size: 0.9em;
  color: #666;
}

.entry-item {
  list-style: none;
  padding: 5px 0;
}

.entry-title-input,
.entry-content-input {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
}

.entry-title-input label,
.entry-content-input label {
  font-size: 1.2em;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.entry-title-input input,
.entry-content-input textarea {
  padding: 12px;
  font-size: 1em;
  border: 1px solid #ddd;
  border-radius: 8px;
  outline: none;
  resize: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.entry-title-input input:focus,
.entry-content-input textarea:focus {
  border-color: #007bff;
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.2);
}

.entry-content-input textarea {
  min-height: 100px;
  max-height: 300px;
}
.exchange-diary-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.exchange-diary-item {
  border-bottom: 1px solid #ccc;
  padding: 10px;
}

.entry-item {
  border-top: 1px solid #ddd;
  padding: 8px;
  margin-top: 8px;
}

.entry-item p {
  font-size: 1rem;
  margin: 0;
}

.entry-item small {
  display: block;
  font-size: 0.875rem;
  color: #666;
  margin-top: 4px;
}

/* 전체 리스트 컨테이너 */
.exchange-diary-list {
  list-style: none; /* 불릿 포인트 제거 */
  padding: 0;
  margin: 0;
}

/* 개별 교환 일기 아이템 스타일 */
.exchange-diary-item {
  background-color: #fff; /* 배경색 */
  padding: 15px;
  margin-bottom: 15px; /* 아래쪽 간격 */
  border-radius: 10px; /* 둥근 모서리 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 그림자 효과 */
  border-left: 5px solid #3b82f6; /* 왼쪽에 색상 강조 */
}

/* 엔트리 아이템 스타일 */
.entry-item {
  background-color: #f9f9f9; /* 연한 배경색 */
  padding: 10px;
  margin-top: 10px; /* 각 엔트리 간격 */
  border-radius: 8px;
  border: 1px solid #e0e0e0; /* 경계선 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05); /* 부드러운 그림자 */
}

/* 제목과 내용 텍스트 스타일 */
.entry-item p {
  font-size: 1rem;
  margin: 0;
  color: #333;
}

/* 작성자와 작성일 정보 스타일 */
.entry-item small {
  display: block;
  font-size: 0.85rem;
  color: #666;
  margin-top: 8px;
}

.entry-item small button {
  background-color: #e53e3e; /* 삭제 버튼 색상 */
  color: white;
  padding: 2px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8em;
  margin-left: 10px;
}

.entry-item small button:hover {
  background-color: #c53030; /* 호버 시 색상 변화 */
}
.delete-button{
  background-color: #e53e3e; /* 삭제 버튼 색상 */
  color: white;
  padding: 2px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.6em;
  margin-left: 10px;
}
.delete-button:hover{
  background-color: #c53030; /* 호버 시 색상 변화 */
}
.delete-button-ex{
  background-color: #e53e3e; /* 삭제 버튼 색상 */
  color: white;
  padding: 6px 13px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.85em;
  margin-left: 10px;
}
.delete-button-ex:hover{
  background-color: #c53030; /* 호버 시 색상 변화 */
}

</style>
