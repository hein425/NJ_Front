<template>
  <div v-if="selectedDiary" class="diary-detail">
    <h2>{{ selectedDiary.title }}</h2>
    <p>{{ getCategoryLabel(selectedDiary.category) }} - {{ selectedDiary.date }}</p>
    <p>{{ selectedDiary.content }}</p>

    <!-- 이미지 섹션 -->
    <div v-if="selectedDiary.images && selectedDiary.images.length > 0" class="diary-images">
      <div v-for="(image, index) in selectedDiary.images" :key="index" class="image-container">
        <img :src="image" alt="Diary Image" class="diary-image" />
      </div>
    </div>

    <!-- 수정 및 삭제 버튼 -->
    <div class="action-buttons">
      <button @click="editDiary">수정</button>
      <button @click="deleteDiary">삭제</button>
    </div>

    <button @click="goBack">목록으로 돌아가기</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { BASE_URL } from '@/config';

// 라우터 관련 설정
const router = useRouter();
const route = useRoute();

// 다이어리 데이터
const selectedDiary = ref(null);
const IMAGE_BASE_URL = 'http://112.222.157.156:10004'; // 고정 이미지 경로

// 카테고리 라벨 매핑 함수
const getCategoryLabel = categoryValue => {
  const categories = [
    { label: '전체보기', value: 'ALL' },
    { label: '#일기', value: 'DAILY' },
    { label: '#성장일지', value: 'GROWTH' },
    { label: '#운동', value: 'EXERCISE' },
    { label: '#여행', value: 'TRIP' },
    { label: '#기타', value: 'ETC' },
  ];
  const category = categories.find(cat => cat.value === categoryValue);
  return category ? category.label : '기타';
};

// 다이어리 상세 데이터 조회 함수
const fetchDiaryDetail = async () => {
  const idx = Number(route.params.idx); // `String`을 `Number`로 변환
  console.log(`Fetching diary detail for idx: ${idx}`);
  try {
    const response = await axios.get(`${BASE_URL}/diary/${idx}`);
    const data = response.data;

    // 이미지 경로 수정
    data.images = data.images.map(image => `${IMAGE_BASE_URL}${image}`);
    selectedDiary.value = data;
    console.log('Fetched Diary Data:', data); // 디버깅용 로그
  } catch (error) {
    console.error('Failed to fetch diary detail:', error.response?.data || error.message);
  }
};

// 목록으로 돌아가기
const goBack = () => {
  router.push({ name: 'diary' });
};

onMounted(() => {
  fetchDiaryDetail();
});
</script>

<style scoped>
/* 스타일은 기존 코드 유지 */
.diary-detail {
  background-color: white;
  border-radius: 10px;
  perspective: 1000px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px 50px;
  min-height: 500px;
  width: 65%;
  margin: 2vh 5vh;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

button {
  background-color: #363636;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  margin-top: 15px;
  align-self: flex-end;
}

button:hover {
  background-color: #646369;
  transform: translateY(-2px);
}
</style>
