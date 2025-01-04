<template>
  <div class="container">
    <!-- 뒤로가기 버튼 -->
    <button class="back-button" @click="goBack">← 뒤로가기</button>
    <div class="user-profile">
      <!-- 프로필 헤더 -->
      <div class="profile-header">
        <img :src="profileImageUrl || '/default-profile.png'" alt="Profile Picture" class="profile-image" />
        <h2 class="profile-nickname">{{ author }}</h2>
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
  userIdx: [String, Number], // String과 Number 모두 허용
});

const route = useRoute();
const router = useRouter();
const userIdx = ref(route.params.userIdx || props.userIdx); // URL 파라미터나 props에서 값 가져오기

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
    return schedules.value.filter(schedule => ['ALL', 'CHOOSE'].includes(schedule.share));
  }
  if (activeTab.value === 'diary') {
    return diaries.value.filter(diary => ['ALL', 'CHOOSE'].includes(diary.share));
  }
  return [];
});

// 작성자의 데이터를 가져오는 함수
const fetchUserProfile = async () => {
  try {
    // 사용자 프로필 정보 가져오기
    const userResponse = await axios.get(`${BASE_URL}/shared/user/${userIdx.value}`);
    console.log('상태 코드 확인:', userResponse.status);
    console.log('응답 데이터 확인:', userResponse.data);

    // 응답 데이터 매핑
    if (userResponse.data && userResponse.data[0]) {
      author.value = userResponse.data[0].author || 'Unknown User'; // 응답 데이터에서 author 값 설정
      profileImageUrl.value = userResponse.data.profileImageUrl || '/default-profile.png';
    } else {
      console.error('응답 데이터가 비어 있습니다.');
    }

    // 작성자의 공개 일정 가져오기
    const scheduleResponse = await axios.get(`${BASE_URL}/shared/user/${userIdx.value}`);
    console.log('Fetched schedules:', scheduleResponse.data);
    schedules.value = scheduleResponse.data.map(schedule => ({
      id: schedule.id,
      title: schedule.title,
      content: schedule.content,
      date: schedule.date,
      start: schedule.start,
      end: schedule.end,
      location: schedule.location,
      repeatType: schedule.repeatType,
      repeatEndDate: schedule.repeatEndDate,
      share: schedule.share,
      author: schedule.author || 'Unknown User',
      authorIdx: schedule.authorIdx || 0,
      images: schedule.images || [],
    }));

    // 작성자의 공개 일기 가져오기
    const diaryResponse = await axios.get(`${BASE_URL}/shared/user/${userIdx.value}`);
    console.log('Fetched diaries:', diaryResponse.data);
    diaries.value = diaryResponse.data.map(diary => ({
      id: diary.id,
      title: diary.title,
      content: diary.content,
      date: diary.date,
      share: diary.share,
      author: diary.author || 'Unknown User',
      authorIdx: diary.authorIdx || 0,
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
  console.log('Route params:', route.params);
  console.log('Route query:', route.query);

  userIdx.value = route.params.authorIdx || props.userIdx;
  author.value = ''; // 초기값을 비워두기

  console.log('Fetching data for authorIdx:', userIdx.value);

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
