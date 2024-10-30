<template>
    <div v-if="selectedDiary" class="diary-detail">
      <h2>{{ selectedDiary.title }}</h2>
      <p>{{ getCategoryLabel(selectedDiary.category) }} - {{ selectedDiary.date }}</p>
      <p>{{ selectedDiary.content }}</p>
  
      <!-- 이미지 섹션 -->
      <div v-if="selectedDiary.images && selectedDiary.images.length > 0" class="diary-images">
        <h3>Images:</h3>
        <div v-for="(image, index) in selectedDiary.images" :key="index" class="image-container">
          <img :src="image" alt="Diary Image" class="diary-image" />
        </div>
      </div>
  
      <button @click="goBack">목록으로 돌아가기</button>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import axios from 'axios';
  import { BASE_URL } from '@/config';
  
  const router = useRouter();
  const route = useRoute();
  const selectedDiary = ref(null);
  const IMAGE_BASE_URL = 'http://112.222.157.156:10004'; // 고정 이미지 경로
  
  const fetchDiaryDetail = async () => {
    const idx = route.params.idx;
    try {
      const response = await axios.get(`${BASE_URL}/diary/${idx}`);
      const data = response.data;
  
      // 각 이미지 경로 앞에 고정 URL을 추가
      data.images = data.images.map(image => `${IMAGE_BASE_URL}${image}`);
      selectedDiary.value = data;
    } catch (error) {
      console.error('일기 상세 조회 중 오류 발생:', error);
    }
  };
  
  const goBack = () => {
    router.push({ name: 'diary' });
  };
  
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
  
  onMounted(() => {
    fetchDiaryDetail();
  });
  </script>
  
  <style scoped>
  .diary-images {
    margin-top: 20px;
  }
  
  .image-container {
    margin-bottom: 10px;
  }
  
  .diary-image {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }
  </style>
  