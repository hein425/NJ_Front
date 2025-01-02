<template>
  <div class="container">
    <!-- 뒤로가기 버튼 -->
    <button class="back-button" @click="goBack">← 뒤로가기</button>
    <div class="user-profile">
      <!-- 프로필 헤더 -->
      <div class="profile-header">
        <img :src="profileImageUrl || '/default-profile.png'" alt="Profile Picture" class="profile-image" />
        <h2 class="profile-nickname">{{ userName }}</h2>
      </div>

      <!-- 탭 메뉴 -->
      <div class="tabs">
        <button :class="{ active: activeTab === 'schedule' }" @click="activeTab = 'schedule'">일정</button>
        <button :class="{ active: activeTab === 'diary' }" @click="activeTab = 'diary'">일기</button>
      </div>

      <!-- 필터링된 데이터 -->
      <div class="tab-content">
        <div v-for="item in filteredData" :key="item.id" :class="[activeTab === 'schedule' ? 'schedule-item' : 'diary-item']">
          <!-- 일정 -->
          <div v-if="activeTab === 'schedule'">
            <h3 class="schedule-title">{{ item.title }}</h3>
            <p>시작 시간: {{ formatDateTime(item.start) }}</p>
            <p>종료 시간: {{ formatDateTime(item.end) }}</p>
            <p>내용: {{ item.content }}</p>
            <div v-if="item.location">
              <p>Address: {{ item.address }}</p>
              <img :src="item.mapUrl || '/default-map.png'" alt="Map" class="map-image" />
            </div>
          </div>

          <!-- 일기 -->
          <div v-else-if="activeTab === 'diary'">
            <h3 class="diary-title">{{ item.title }}</h3>
            <p>작성일: {{ item.date }}</p>
            <p>내용: {{ item.content }}</p>
            <div v-if="item.images.length">
              <img v-for="image in item.images" :src="image" :key="image" alt="Diary Image" class="diary-image" />
            </div>
          </div>
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

const props = defineProps({
  userIdx: String, // 변경된 userIdx
});

const route = useRoute();
const router = useRouter();
const userIdx = ref(route.params.userIdx || props.userIdx); // URL 파라미터나 props에서 값 가져오기

const profileImageUrl = ref('');
const userName = ref('');
const schedules = ref([]);
const diaries = ref([]);
const activeTab = ref('schedule');

// 활성화된 탭에 따라 데이터를 필터링
const filteredData = computed(() => {
  if (activeTab.value === 'schedule') {
    return schedules.value.filter(schedule => ['ALL', 'CHOOSE'].includes(schedule.share));
  }
  if (activeTab.value === 'diary') {
    return diaries.value.filter(diary => ['ALL', 'CHOOSE'].includes(diary.share));
  }
  return [];
});

// 작성자의 데이터를 가져오는 함수
const fetchUserProfile = async () => {
  console.log('Fetching data for userIdx:', userIdx.value);

  try {
    // 사용자 프로필 정보 가져오기
    console.log('Fetching user profile for userIdx:', userIdx.value); // 디버깅 로그
    const userResponse = await axios.get(`${BASE_URL}/shared/user/${userIdx.value}`);
    console.log('유저 프로필 정보:', userResponse.data); // API 응답 로그
    profileImageUrl.value = userResponse.data.profileImageUrl || '/default-profile.png';
    userName.value = userResponse.data.userName || 'Unknown User';

    // 작성자의 공개 일정 가져오기
    const scheduleResponse = await axios.get(`${BASE_URL}/shared/user/${props.userIdx}`);
    console.log('Fetched schedules:', scheduleResponse.data); // API 응답 확인
    schedules.value = scheduleResponse.data || [];

    // 작성자의 공개 일기 가져오기
    const diaryResponse = await axios.get(`${BASE_URL}/shared/user/${userIdx.value}`);
    console.log('Fetched diaries:', diaryResponse.data); // API 응답 확인
    diaries.value = diaryResponse.data.map(diary => ({
      id: diary.id,
      title: diary.title,
      content: diary.content,
      date: diary.date,
      images: diary.images || [],
    }));
  } catch (error) {
    console.error('Failed to fetch user profile data:', error);
  }
};

// 뒤로가기 버튼 클릭 시 호출
const goBack = () => {
  router.go(-1);
};

onMounted(() => {
  if (!userIdx.value) {
    console.error('userIdx가 전달되지 않았습니다.');
    return;
  }
  console.log('Fetching data for userIdx:', userIdx.value); // 디버깅 로그
  fetchUserProfile();
});

// 날짜 및 시간 포맷팅 함수
const formatDateTime = dateTimeString => {
  if (!dateTimeString) return '';
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
  return new Date(dateTimeString).toLocaleString('ko-KR', options);
};
</script>

<style scoped>
.container {
  border-radius: 15px;
  height: 50rem;
  background-color: white;
  margin: 0 auto;
  width: 81rem;
}
.user-profile {
  width: 100%;
  max-width: 800px;
  margin: auto;
  text-align: center;
  background: #f7f8fa;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.back-button {
  background: none;
  border: none;
  font-size: 16px;
  color: #555;
  cursor: pointer;
  margin-bottom: 20px;
  text-align: left;
}

.back-button:hover {
  text-decoration: underline;
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
}

.tabs button {
  padding: 10px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
}

.tabs .active {
  font-weight: bold;
  border-bottom: 2px solid #555;
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
</style>
