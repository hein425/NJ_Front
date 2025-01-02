<template>
  <div>
    <div class="diary-view-container">
      <!-- 상단 도구바 -->
      <div class="toolbar">
        <div class="category-buttons">
          <button v-for="category in categories" :key="category.value" @click="fetchDiaries(category.value)" :class="{ selected: selectedCategory === category.value }">
            {{ category.label }}
          </button>
        </div>
        <div class="sort-buttons">
          <button @click="sortDiaries('LATEST')" :class="{ selected: sortOrder === 'LATEST' }">최신순</button>
          <button @click="sortDiaries('OLDEST')" :class="{ selected: sortOrder === 'OLDEST' }">오래된순</button>
        </div>
      </div>

      <!-- 일기 목록 -->
      <div v-if="paginatedDiaries.length > 0" class="diary-list">
        <div v-for="(diary, index) in paginatedDiaries" :key="index" class="diary-item" @click="goToDiaryDetail(diary.idx)">
          <h3>{{ diary.title }}</h3>
          <p>{{ getCategoryLabel(diary.category) }}</p>
          <p>{{ diary.date }}</p>
        </div>
      </div>
      <div v-else>
        <p>해당 카테고리의 일기가 없습니다.</p>
      </div>

      <!-- 페이지네이션 -->
      <div class="pagination">
        <button v-for="page in totalPages" :key="page" @click="goToPage(page)" :class="{ active: currentPage === page }">
          {{ page }}
        </button>
      </div>
    </div>

    <!-- 오른쪽 아래 + 버튼 -->
    <button class="add-diary-btn" @click="toggleModal">+</button>

    <!-- 모달 -->
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>일기 작성</h3>
          <button class="close-btn" @click="toggleModal">X</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitDiary">
            <!-- 제목과 카테고리 -->
            <div class="row">
              <div class="title-category-row">
                <div class="title-section">
                  <label for="title">제목</label>
                  <input id="title" v-model="title" class="input-field" placeholder="제목을 입력하세요" @input="checkTitleLength" />
                </div>
                <div class="category-section">
                  <label for="category">카테고리</label>
                  <select id="category" v-model="category" class="input-field">
                    <option value="DAILY">#일기</option>
                    <option value="GROWTH">#성장일지</option>
                    <option value="EXERCISE">#운동</option>
                    <option value="TRIP">#여행</option>
                    <option value="ETC">#기타</option>
                  </select>
                </div>
              </div>
            </div>

       <!-- 공개 범위 설정 -->
      <div class="row">
        <label for="share" style="width: 80px">공개 설정</label>
        <select v-model="share" id="share" class="input-field" @change="handleShareChange">
          <option value="ALL">전체공개</option>
          <option value="CHOOSE">친구공개</option>
          <option value="NONE">비공개</option>
        </select>
      </div>

      <div v-if="share === 'CHOOSE'" class="friend-selection">
        <h4>공개할 친구 선택</h4>
        <div v-for="friend in friends" :key="friend.idx" class="friend-item">
          <input type="checkbox" :value="friend.idx" v-model="selectedFriends" />
          <span>{{ friend.userName }}</span>
        </div>
      </div>

            <!-- 작성일 -->
            <div class="row">
              <label for="date">작성일</label>
              <input id="date" v-model="date" type="date" class="input-field" />
            </div>

            <!-- 내용 -->
            <div class="row">
              <label for="content">내용</label>
              <textarea id="content" v-model="content" class="input-field textarea-field" placeholder="내용을 입력하세요"></textarea>
            </div>

            <!-- 이미지 업로드 -->
            <div class="row">
              <label for="image" style="width: 100px">이미지 추가</label>
              <input id="image" type="file" @change="handleImageUpload" multiple class="input-field" />
            </div>

            <div class="image-preview">
              <div v-for="(image, index) in images" :key="index" class="image-container">
                <img :src="image.url" alt="Preview" />
                <button class="delete-btn" @click.prevent="removeImage(index)">X</button>
              </div>
            </div>

            <!-- 버튼 -->
            <div class="button-row">
              <button type="submit" class="submit-button">
                <strong>작성하기</strong>
              </button>
              <button type="button" @click="toggleModal" class="cancel-button">
                <strong>취소</strong>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <!-- 제목 비어있음 경고 모달 -->
    <BaseModal :visible="showEmptyTitleModal" :message="'제목을 입력해주세요.'" @close="() => closeModal('emptyTitle')" class="modal-title-limit" />

    <!-- 제목 글자수 경고 모달 -->
    <BaseModal :visible="showTitleLimitModal" :message="'제목은 최대 50자까지 입력할 수 있습니다.'" @close="() => closeModal('titleLimit')" class="modal-empty-title" />

    <!-- 일정 저장 성공 모달 -->
    <BaseModal :visible="showSuccessModal" :message="'일기가 저장되었습니다.'" @close="() => closeModal('success')" class="modal-title-success" />
    <BaseModal :visible="showSuccessModal" :message="'일기가 성공적으로 작성되었습니다.'" @close="closeModal('success')" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { BASE_URL } from '@/config';
import { useAuthStore } from '@/stores/authStore';
import { toRaw } from 'vue';
import tippy from 'tippy.js';

const router = useRouter();
const diaries = ref([]);
const sortOrder = ref('LATEST');
const selectedCategory = ref('ALL');
const authStore = useAuthStore();
const calendarIdx = authStore.calendarIdx;
const currentPage = ref(1);
const itemsPerPage = 6;

// 모달 상태 관리
const isModalOpen = ref(false);
const title = ref('');
const category = ref('DAILY');
const content = ref('');
const images = ref([]); // 이미지 리스트
const share = ref('ALL');
const friends = ref([]); // 친구 목록
const selectedFriends = ref([]); // 선택한 친구 목록

const showEmptyTitleModal = ref(false);
const showTitleLimitModal = ref(false);
const showSuccessModal = ref(false);
const emit = defineEmits(['closeForm', 'updateList']);

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const date = ref(getTodayDate()); // 디폴트값: 오늘 날짜

const closeModal = modalName => {
  if (modalName === 'success') {
    showSuccessModal.value = false;
  }
  if (modalName === 'emptyTitle') showEmptyTitleModal.value = false;
  if (modalName === 'titleLimit') showTitleLimitModal.value = false;
  if (modalName === 'success') {
    showSuccessModal.value = false;
    emit('closeForm');
  }
};

// 제목 길이 확인 함수
const checkTitleLength = () => {
  if (title.value.length > 50) {
    showTitleLimitModal.value = true; // 모달 표시
    title.value = title.value.slice(0, 50); // 최대 50자까지 자르기
    return;
  }
};

// 공개 범위 변경
const handleShareChange = () => {
  console.log('공개 범위 변경:', share.value);
  if (share.value !== 'CHOOSE') {
    selectedFriends.value = []; // 초기화
  }
};

const handleImageUpload = event => {
  const files = Array.from(event.target.files);
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      images.value.push({ file, url: e.target.result }); // 이미지 파일과 URL 추가
    };
    reader.readAsDataURL(file);
  });
  event.target.value = ''; // 입력 초기화
};

// 모달 열기/닫기
const toggleModal = () => {
  isModalOpen.value = !isModalOpen.value;
};

// 친구 목록 로드
// 새로운 loadFriends 함수
const loadFriends = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/friend/${authStore.idx}/list`);
    console.log('API 응답 데이터:', response.data); // 응답 데이터 구조 확인
    friends.value = response.data.map(friend => ({
      idx: friend.idx || friend.userId, // API 데이터의 키 확인 후 수정
      userName: friend.userName,
      profileImageUrl: `${BASE_URL}${friend.profileImageUrl}`,
    }));
    console.log('로드된 친구 목록:', friends.value);
  } catch (error) {
    console.error('Failed to load friends:', error);
  }
};

// 일기 작성 API 호출
const submitDiary = async () => {
  if (!title.value.trim()) {
    alert('제목을 입력해주세요.');
    return;
  }

  const diaryRequest = {
    title: title.value,
    content: content.value,
    category: category.value,
    date: date.value,
    share: share.value || 'ALL',
    calendarIdx: authStore.calendarIdx,
    friendIdxList: share.value === 'CHOOSE' ? toRaw(selectedFriends.value) : null,
  };

  const formData = new FormData();
  formData.append('diaryRequest', new Blob([JSON.stringify(diaryRequest)], { type: 'application/json' }));

  if (images.value.length > 0) {
    images.value.forEach(image => {
      formData.append('imageFiles', image.file); // 이미지 파일 추가
    });
  } else {
    formData.append('imageFiles', new Blob([], { type: 'application/octet-stream' })); // 빈 Blob 추가
  }

  try {
    const response = await axios.post(`${BASE_URL}/diary/create`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Diary submitted successfully:', response.data);

    // 성공 처리
    alert('일기가 성공적으로 작성되었습니다!'); // 성공 알림
    toggleModal(); // 모달 닫기

    // 입력 필드 초기화
    title.value = '';
    content.value = '';
    category.value = 'DAILY';
    share.value = 'ALL';
    selectedFriends.value = [];
    date.value = getTodayDate();
    images.value = [];

    // 목록 갱신
    fetchDiaries('ALL');
  } catch (error) {
    console.error('Failed to submit diary:', error.response?.data || error.message);
    alert('작성 중 문제가 발생했습니다.');
  }
};

const removeImage = index => {
  images.value.splice(index, 1); // 선택한 이미지를 배열에서 제거
};

// 기존 기능 유지
const categories = [
  { label: '전체보기', value: 'ALL' },
  { label: '#일기', value: 'DAILY' },
  { label: '#성장일지', value: 'GROWTH' },
  { label: '#운동', value: 'EXERCISE' },
  { label: '#여행', value: 'TRIP' },
  { label: '#기타', value: 'ETC' },
];

const fetchDiaries = async category => {
  selectedCategory.value = category;
  let url = category === 'ALL' ? `${BASE_URL}/diary/${calendarIdx}/ALL` : `${BASE_URL}/diary/${calendarIdx}/${category}`;
  try {
    const response = await axios.get(url);
    diaries.value = response.data;
    sortOrder.value = 'LATEST';
  } catch (error) {
    console.error('일기 조회 중 오류 발생:', error.response?.data || error.message);
  }
};

const sortDiaries = order => {
  sortOrder.value = order;
};

const sortedDiaries = computed(() => {
  return [...diaries.value].sort((a, b) => {
    return sortOrder.value === 'LATEST' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date);
  });
});

const paginatedDiaries = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedDiaries.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(sortedDiaries.value.length / itemsPerPage);
});

const goToDiaryDetail = idx => {
  router.push({ name: 'DiaryDetail', params: { idx } });
};

const goToPage = page => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const getCategoryLabel = categoryValue => {
  const category = categories.find(cat => cat.value === categoryValue);
  return category ? category.label : '기타';
};

// 컴포넌트 로드시 친구 목록 로드
onMounted(() => {
  loadFriends();
});
onMounted(() => {
  const buttons = document.querySelectorAll('.tooltip-btn');

  buttons.forEach(button => {
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
</script>

<style scoped>
.diary-item {
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.diary-item:hover {
  background-color: #f0f0f0;
  color: #333;
}

.diary-view-container {
  width: 88.5%;
  height: 100%;
  padding: 20px;
  border-radius: 10px;
  margin: 5.5vh 9vh;
  background-color: white;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.toolbar {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  margin-top: 50px;
}

.category-buttons {
  display: flex;
  gap: 10px;
  margin-right: 70px;
}

.category-buttons button {
  padding: 10px 20px;
  border: 1px solid #ccc;
  background-color: white;
  color: black;
  border-radius: 20px;
  cursor: pointer;
}

.category-buttons button.selected {
  background-color: black;
  color: white;
}

.sort-buttons {
  display: flex;
  gap: 10px;
}

.sort-buttons button {
  padding: 10px 20px;
  border: 1px solid #ccc;
  background-color: white;
  color: black;
  border-radius: 20px;
  cursor: pointer;
}

.sort-buttons button.selected {
  background-color: black;
  color: white;
}

.diary-list {
  width: 830px;
  margin: 0 auto;
}

.diary-item {
  padding: 15px 20px;
  border-bottom: 1px dashed #ccc;
  display: grid;
  grid-template-columns: 1fr 100px 120px; /* 타이틀, 카테고리, 날짜의 고정 크기 설정 */
  align-items: center;
  gap: 20px;
}

.diary-item h3 {
  text-align: left;
  width: 350px;
}

.diary-title {
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.diary-category {
  text-align: right;
  color: gray;
}

.diary-date {
  text-align: right;
  color: gray;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.pagination button {
  padding: 10px;
  margin: 0 5px;
  background-color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.pagination button.active {
  background-color: black;
  color: white;
}
/* 추가된 스타일 */
.add-diary-btn {
  position: fixed;
  bottom: 80px;
  right: 110px;
  width: 80px;
  height: 80px;
  background-color: #343434;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 10px;
  width: 650px;
  text-align: center;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.modal-body {
  margin-top: 20px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  padding: 30px;
  width: 500px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.3s ease-in-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  font-size: 22px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #aaa;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #000;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.input-field {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 15px;
  margin-top: 5px;
}

.input-field:focus {
  border-color: #2196f3;
  outline: none;
}

.textarea-field {
  height: 150px;
  resize: none;
}

.button-row {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.submit-button,
.cancel-button {
  width: 48%;
  padding: 10px 0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
}

.submit-button {
  background-color: #222222;
  color: white;
}

.submit-button:hover {
  background-color: #525151;
}

.cancel-button {
  background-color: #ccc;
  color: black;
}

.cancel-button:hover {
  background-color: #aaa;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.image-preview {
  display: flex;
  flex-wrap: wrap; /* 여러 줄로 표시 */
  margin-top: 10px;
}

.image-container {
  margin: 5px;
  position: relative;
}

.image-container img {
  width: 100px; /* 고정된 가로 크기 */
  height: 100px; /* 고정된 세로 크기 */
  border: 1px solid #ddd;
  border-radius: 8px;
}

.delete-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s ease;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

label[for='image'] {
  display: inline-block;
  padding: 10px 50px;
  background-color: #222222;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
  text-align: center;
}

label[for='image']:hover {
  background-color: #525151;
}

input[type='file'] {
  display: none;
}

label {
  padding-top: 10px;
  font-weight: bold;
}

label[for='title'] {
  text-align: left;
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 1rem;
}

label[for='category'] {
  text-align: left;
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 1rem;
}

label[for='date'] {
  text-align: left;
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 1rem;
}

label[for='content'] {
  text-align: left;
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 1rem;
}

label[for='image'] {
  text-align: left;
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 1rem;
}

select#category {
  width: 103.5%; /* 다른 입력 필드와 동일한 폭 */
  padding: 10px; /* 다른 필드와 동일한 내부 여백 */
}
</style>
