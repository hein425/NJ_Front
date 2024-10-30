<template>
  <div class="diary-view-container">
    <!-- 카테고리 버튼과 정렬 버튼을 포함한 툴바 -->
    <div class="toolbar">
      <!-- 카테고리 버튼 섹션 -->
      <div class="category-buttons">
        <button
          v-for="category in categories"
          :key="category.value"
          @click="fetchDiaries(category.value)"
          :class="{ selected: selectedCategory === category.value }"
        >
          {{ category.label }}
        </button>
      </div>

      <!-- 정렬 버튼 섹션 -->
      <div class="sort-buttons">
        <button @click="sortDiaries('LATEST')" :class="{ selected: sortOrder === 'LATEST' }">최신순</button>
        <button @click="sortDiaries('OLDEST')" :class="{ selected: sortOrder === 'OLDEST' }">오래된순</button>
      </div>
    </div>

    <!-- 일기 목록 출력 -->
    <div v-if="!selectedDiary && paginatedDiaries.length > 0" class="diary-list">
      <div v-for="(diary, index) in paginatedDiaries" :key="index" class="diary-item" @click="viewDiary(diary)">

        <h3>{{ diary.title }}</h3>
        <p>{{ getCategoryLabel(diary.category) }}</p>
        <p>{{ diary.date }}</p>
      </div>
    </div>
    <div v-else-if="!selectedDiary">
      <p>해당 카테고리의 일기가 없습니다.</p>
    </div>

    <!-- 상세 내용 표시 -->
    <div v-if="selectedDiary" class="diary-detail">
      <h2>{{ selectedDiary.title }}</h2>
      <p>{{ getCategoryLabel(selectedDiary.category) }} - {{ selectedDiary.date }}</p>
      <p>{{ selectedDiary.content }}</p>

      <!-- 이미지 표시 섹션 -->
      <div v-if="selectedDiary.images && selectedDiary.images.length" class="diary-images">
        <img
  v-for="(imageFiles, index) in selectedDiary.images"
  :key="index"
  :src="`http://112.222.157.156:10004/images/${imageFiles}`"
  alt="Diary Image"
  class="diary-image"
/>
  </div>
      <button @click="selectedDiary = null">목록으로 돌아가기</button>
    </div>

    <!-- 페이지네이션 -->
    <div class="pagination">
      <button v-for="page in totalPages" :key="page" @click="goToPage(page)" :class="{ active: currentPage === page }">
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const selectedDiary = ref(null);

// 선택된 일기의 상세 정보를 표시하는 함수
const viewDiary = diary => {
  selectedDiary.value = diary;
  console.log('Selected diary:', selectedDiary.value);
};

const diaries = ref([]);
const sortOrder = ref('LATEST');
const selectedCategory = ref('ALL');

const categories = [
  { label: '전체보기', value: 'ALL' },
  { label: '#일기', value: 'DAILY' },
  { label: '#성장일지', value: 'GROWTH' },
  { label: '#운동', value: 'EXERCISE' },
  { label: '#여행', value: 'TRIP' },
  { label: '#기타', value: 'ETC' },
];

const userIdx = 1;

const fetchDiaries = async category => {
  selectedCategory.value = category;
  let url = category === 'ALL'
    ? `http://112.222.157.156:10004/diary/${userIdx}/ALL`
    : `http://112.222.157.156:10004/diary/${userIdx}/${category}`;

  try {
    const response = await axios.get(url);
    diaries.value = response.data;
    sortOrder.value = 'LATEST';
  } catch (error) {
    console.error('일기 조회 중 오류 발생:', error);
  }
};

const sortDiaries = order => {
  sortOrder.value = order;
};

const sortedDiaries = computed(() => {
  return [...diaries.value].sort((a, b) => {
    return sortOrder.value === 'LATEST'
      ? new Date(b.date) - new Date(a.date)
      : new Date(a.date) - new Date(b.date);
  });
});

onMounted(() => {
  fetchDiaries('ALL');
});

const getCategoryLabel = categoryValue => {
  const category = categories.find(cat => cat.value === categoryValue);
  return category ? category.label : '기타';
};

const itemsPerPage = 6;
const currentPage = ref(1);

const totalPages = computed(() => {
  return Math.ceil(sortedDiaries.value.length / itemsPerPage);
});

const paginatedDiaries = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedDiaries.value.slice(start, end);
});

const goToPage = page => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};
</script>

<style scoped>
.diary-view-container {
  width: 70%;
  padding: 20px;
  border-radius: 10px;
  margin: 2vh 5vh;
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
  padding: 15px 0;
  border-bottom: 1px dashed #ccc;
  display: grid;
  grid-template-columns: 1fr 100px 120px;
  align-items: center;
  gap: 20px;
}

.diary-item h3 {
  text-align: left;
  width: 350px;
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

.diary-detail {
  text-align: left;
  margin: 20px auto;
  width: 70%;
}

.diary-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.diary-image {
  width: 150px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
</style>
