<template>
  <div class="container">
    <!-- 뒤로가기 버튼 -->
    <button class="back-button" @click="goBack">
      <i class="fas fa-arrow-left"></i>
    </button>
    <div class="user-profile">
      <!-- 프로필 헤더 -->
      <div class="profile-header">
        <img :src="defaultProfileImage" alt="Profile Picture" class="profile-img" />
        <h2 class="profile-nickname">{{ author }}</h2>
      </div>

      <!-- 탭 메뉴 -->
      <div class="tabs">
        <button :class="{ active: activeTab === 'schedule' }" @click="activeTab = 'schedule'">일정</button>
        <button :class="{ active: activeTab === 'diary' }" @click="activeTab = 'diary'">일기</button>
      </div>

      <!-- 필터링된 데이터 -->
      <div class="content-container">
        <div v-for="item in filteredData" :key="item.id" class="content-box">
          <!-- 프로필 이미지 및 작성자 이름 -->
          <div class="header-section">
            <div class="profile-info">
              <img :src="defaultProfileImage" alt="Profile" class="profile-img" />
              <div class="text-info">
                <h3 class="author">{{ item.author }}</h3>
                <!-- 다이어리 제목과 카테고리 -->
                <div v-show="activeTab === 'diary'" class="title-category">
                  <span class="title" :style="{ backgroundColor: '#FFD6D6' }">{{ item.title }}</span>
                  <span class="category" :style="{ backgroundColor: '#FFEBCC' }">#{{ item.category }}</span>
                  <span class="category" :style="{ backgroundColor: '#FFEBCC' }">{{ item.date }}</span>
                </div>
                <!-- 스케줄 제목 -->
                <div v-show="activeTab === 'schedule'" class="title-only">
                  <span class="title" :style="{ backgroundColor: '#FFD6D6' }">{{ item.title }}</span>
                </div>
              </div>
            </div>
            <span class="date">{{ item.shareDate }}</span>
          </div>

          <!-- 다이어리 내용 -->
          <div v-show="activeTab === 'diary'" class="content-section" style="margin-left: rem; text-align: left">
            <p class="content">{{ item.content }}</p>
            <!-- 이미지를 조건부로 렌더링 -->
            <p class="diary_image" v-if="item.images && item.images.length > 0">
              <img v-for="image in item.images" :src="image" :key="image" alt="Diary Image" />
            </p>
          </div>

          <!-- 일정 내용 -->
          <div v-show="activeTab === 'schedule'" class="schedule-section">
            <p><span style="font-weight: bold">시작 시간:</span> {{ item.start }}</p>
            <p><span style="font-weight: bold">종료 시간:</span> {{ item.end }}</p>
            <p><span style="font-weight: bold">반복:</span> {{ item.repeatType }}</p>
            <p style="border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; padding: 10px 0; width: 90%">{{ item.content }}</p>
            <div class="map-section" v-if="item.location">
              <p><span style="font-weight: bold">Address:</span></p>
              <img :src="item.mapUrl || '/default-map.png'" alt="Map" class="map-img" />
              <p>{{ item.location }}</p>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div v-if="activePost">
          <ThreadPostDetail :post="activePost" :comments="comments" @goBack="goBackToList" />
        </div>
        <div v-else>
          <!-- 게시글 목록 -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { BASE_URL } from '@/config';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import ThreadPostDetail from './ThreadPostDetail.vue';
import defaultProfileImage from '@/assets/profile2.jpg';

const props = defineProps({
  userIdx: [String, Number], // String과 Number 모두 허용
});

const route = useRoute();
const router = useRouter();
const userIdx = ref(route.params.userIdx || props.userIdx); // URL 파라미터나 props에서 값 가져오기

const activePost = ref(null);
const comments = ref([]);
const data = ref([]);

const profileImageUrl = ref('');
const schedules = ref([]);
const diaries = ref([]);
const activeTab = ref('schedule');
const author = ref(route.query.author || '');
onMounted(() => {
  if (!author.value) {
    console.error('author 값이 전달되지 않았습니다. 기본값을 설정합니다.');
    author.value = 'Unknown User';
  }
});

// 활성화된 탭에 따라 데이터를 필터링
const filteredData = computed(() => {
  if (activeTab.value === 'schedule') {
    return schedules.value.filter(item => item.type === 'SCHEDULE' && ['ALL', 'CHOOSE'].includes(item.share));
  }
  if (activeTab.value === 'diary') {
    return diaries.value.filter(item => item.type === 'DIARY' && ['ALL', 'CHOOSE'].includes(item.share));
  }
  return [];
});

// 작성자의 데이터를 가져오는 함수
const fetchUserProfile = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/shared/user/${userIdx.value}`);
    console.log('Fetched user data:', response.data);

    // 응답 데이터 매핑
    if (response.data && response.data.length > 0) {
      author.value = response.data[0].author || 'Unknown User';
      profileImageUrl.value = response.data[0].profileImageUrl || '/default-profile.png';
    } else {
      console.error('응답 데이터가 비어 있습니다.');
    }

    // 전체 데이터를 한번에 가져오기
    const allData = response.data.map(item => ({
      id: item.sharedIdx,
      title: item.title,
      category: item.category,
      content: item.content,
      comment: item.comment,
      commentsCount: item.comments?.length || 0, // 댓글 수를 포함
      date: item.date, // 정상 작동 확인
      shareDate: formatShareDate(item.shareDate), // 원하는 형식으로 변환
      start: formatDateTime(item.start), // 원하는 형식으로 변환
      end: formatDateTime(item.end), // 원하는 형식으로 변환
      location: item.location,
      repeatType: item.repeatType,
      repeatEndDate: item.repeatEndDate,
      share: item.share ?? 'ALL', // 기본값 설정
      type: item.type,
      author: item.author || 'Unknown User',
      authorIdx: item.authorIdx || 0,
      images: item.diaryImages || [],
    }));

    console.log('allData:', allData);

    // 일정과 일기 분리
    schedules.value = allData.filter(item => item.type === 'SCHEDULE');
    diaries.value = allData.filter(item => item.type === 'DIARY');

    console.log('Filtered Schedules:', schedules.value);
    console.log('Filtered Diaries:', diaries.value);
  } catch (error) {
    console.error('Failed to fetch user profile data:', error);
  }
};

// 뒤로가기 버튼 클릭 시 호출
const goBack = () => {
  router.go(-1);
};

onMounted(() => {
  console.log('Route params:', route.params);
  console.log('Route query:', route.query);

  userIdx.value = route.params.authorIdx || props.userIdx;
  author.value = ''; // 초기값을 비워두기

  console.log('Fetching data for authorIdx:', userIdx.value);

  fetchUserProfile();
});

// 날짜 형식 변환 함수
function formatShareDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

// 시간 형식 변환 함수
function formatDateTime(dateTimeString) {
  if (!dateTimeString) return '';
  const date = new Date(dateTimeString);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12; // 0시를 12시로 변환
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${period} ${formattedHours}:${minutes}`;
}

async function fetchComments(type, mixedIdx) {
  try {
    const response = await axios.get(`/shared/all/comments/${type}/${mixedIdx}`);
    comments.value = response.data;
  } catch (error) {
    console.error('댓글 가져오기 실패:', error);
  }
}

async function viewPostDetails(post) {
  activePost.value = post;
  await fetchComments(post.type, post.id);
}

function goBackToList() {
  activePost.value = null;
}
</script>

<style scoped>
.content-container {
  padding: 20px;
}
.container {
  border-radius: 15px;
  background-color: white;
  margin: 0 auto;
  width: 81rem;
}
.user-profile {
  width: 100%;
  max-width: 800px;
  /* height: 100%; */
  margin: auto;
  text-align: center;
  background: #f7f8fa;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.back-button {
  margin-top: 5.5vh;
  margin-left: 25vh;
  padding-top: 5vh;
  background: none;
  border: none;
  font-size: 24px; /* 아이콘 크기 */
  color: #555;
  cursor: pointer;
  margin-bottom: 40px;
  text-align: left;
  display: flex;
  align-items: center;
}

.back-button i {
  margin-right: 8px; /* 아이콘과 텍스트 간격 */
}

.back-button:hover {
  color: #000; /* 마우스 오버 시 색상 변경 */
  text-decoration: none;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.profile-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-nickname {
  font-size: 24px;
  font-weight: bold;
  margin-top: 10px;
}

.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd; /* 기본 회색 선 */
}

.tabs button {
  padding: 10px 184px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  position: relative;
}

.tabs button::after {
  content: '';
  display: block;
  width: 100%;
  height: 3px;
  background-color: transparent; /* 기본 비활성 상태 */
  position: absolute;
  bottom: -1px;
  left: 0;
  transition: background-color 0.3s ease;
}

.tabs button.active {
  font-weight: bold;
}

.tabs button.active::after {
  background-color: #000; /* 활성화된 탭의 검정색 선 */
}

.tab-content {
  text-align: left;
}

.schedule-item,
.diary-item {
  padding: 15px;
  border-bottom: 1px solid #ddd;
  margin-bottom: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.schedule-title,
.diary-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.map-image,
.diary-image {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  margin-top: 10px;
}

/* ThreadView.vue 스타일 복사 */
.content-container {
  padding: 20px;
}

.content-box {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  /* border-bottom: 1px solid #ddd; */
}

.profile-info {
  display: flex;
  align-items: center;
}

.profile-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
}

.text-info {
  display: flex;
  flex-direction: column;
}

.author {
  text-align: left;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.title {
  margin-right: 10px;
}

.title-category,
.title-only {
  margin-top: 10px;
  font-size: 14px;
}

.title,
.category {
  font-size: 0.9rem;
  padding: 5px 10px;
  border-radius: 10px;
  font-weight: bold;
}

.category {
  margin-right: 10px;
}

.content-section,
.schedule-section {
  padding: 20px;
  text-align: left;
  margin-left: 5.6vh;
}

.map-img,
.diary_image img {
  max-width: 100%;
  border-radius: 8px;
  margin-top: 10px;
}
</style>
