<template>
  <div class="diary-container">
    <div v-if="selectedDiary" class="diary-detail">
      <!-- 기본 보기 모드 -->
      <div v-if="!isEditMode" class="diary-area">
        <div class="diary-header">
          <h2 class="diary-title">{{ selectedDiary.title }}</h2>
          <p class="diary-info">
            {{ getCategoryLabel(selectedDiary.category) }} - {{ selectedDiary.date }}
          </p>
        </div>
        <p class="diary-content">{{ selectedDiary.content }}</p>

        <!-- 이미지 섹션 -->
        <div v-if="selectedDiary.images && selectedDiary.images.length > 0" class="diary-images">
          <div v-for="(image, index) in selectedDiary.images" :key="index" class="image-container">
            <img :src="image" alt="Diary Image" class="diary-image" />
          </div>
        </div>

        <div class="action-buttons">
          <button class="edit-btn" @click="startEditMode">수정</button>
          <button class="delete-btn" @click="deleteDiary">삭제</button>
        </div>
        <button class="back-btn" @click="goBack">목록으로 돌아가기</button>
      </div>

      <!-- 수정 모드 -->
      <div v-else class="edit-mode">
        <div class="edit-header">
          <input v-model="editData.title" placeholder="제목을 입력하세요" class="edit-input title-input" />
          <select v-model="editData.category" class="edit-input category-select">
            <option v-for="category in categoryOptions" :key="category.value" :value="category.value">
              {{ category.label }}
            </option>
          </select>
        </div>
        <div class="edit-date">
          <label for="date">작성일:</label>
          <input id="date" v-model="editData.date" type="date" class="edit-input date-input" />
        </div>
        <textarea v-model="editData.content" placeholder="내용을 입력하세요" class="edit-input content-input"></textarea>

        <!-- 이미지 수정 섹션 -->
        <div class="edit-images">
          <div v-for="(image, index) in editData.images" :key="index" class="image-container">
            <img :src="image" alt="Diary Image" class="diary-image" />
            <button @click="removeImage(index)" class="delete-btn">X</button>
          </div>
          <input type="file" @change="onFileChange" multiple accept="image/*" class="file-input" />
        </div>

        <div class="action-buttons">
          <button class="save-btn" @click="saveDiaryEdit">저장</button>
          <button class="cancel-btn" @click="cancelEditMode">취소</button>
        </div>
      </div>
    </div>
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
const editData = ref({
  title: '',
  content: '',
  category: '',
  date: '',
  share: null, // 추가: Share 필드
  deletedImageList: [], // 삭제할 이미지 목록
  images: [],
  imageFiles: [], // 새로 추가된 이미지 파일
});
const isEditMode = ref(false); // 수정 모드 상태

const IMAGE_BASE_URL = 'http://112.222.157.156:10004'; // 고정 이미지 경로

const categoryOptions = [
  { label: '전체보기', value: 'ALL' },
  { label: '#일기', value: 'DAILY' },
  { label: '#성장일지', value: 'GROWTH' },
  { label: '#운동', value: 'EXERCISE' },
  { label: '#여행', value: 'TRIP' },
  { label: '#기타', value: 'ETC' },
];

const getCategoryLabel = categoryValue => {
  const category = categoryOptions.find(cat => cat.value === categoryValue);
  return category ? category.label : '기타';
};

// 다이어리 상세 데이터 조회
const fetchDiaryDetail = async () => {
  const idx = Number(route.params.idx);
  try {
    const response = await axios.get(`${BASE_URL}/diary/${idx}`);
    const data = response.data;

    data.images = data.images.map(image => `${IMAGE_BASE_URL}${image}`);
    selectedDiary.value = data;
  } catch (error) {
    console.error('Failed to fetch diary detail:', error);
  }
};

// 수정 모드 시작
const startEditMode = () => {
  isEditMode.value = true;
  editData.value = { 
    diaryIdx: selectedDiary.value.diaryIdx,
    title: selectedDiary.value.title,
    content: selectedDiary.value.content,
    category: selectedDiary.value.category,
    date: selectedDiary.value.date, 
    share: selectedDiary.value.share,
    images: [...selectedDiary.value.images],
    deletedImageList: [],
    imageFiles: []
  }; // 선택된 다이어리 데이터 복사
};

// 수정 모드 취소
const cancelEditMode = () => {
  isEditMode.value = false;
  editData.value = { title: '', content: '', category: '', share: null, images: [], deletedImageList: [] };
};

// 이미지 추가
const onFileChange = event => {
  const files = event.target.files;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    reader.onload = e => {
      editData.value.images.push(e.target.result);
    };
    reader.readAsDataURL(file);
    editData.value.imageFiles.push(file);
  }
};

// 이미지 삭제
const removeImage = index => {
  const imageToDelete = editData.value.images[index];
  if (!editData.value.deletedImageList.includes(imageToDelete)) {
    editData.value.deletedImageList.push(imageToDelete);
  }
  editData.value.images.splice(index, 1);
};

// 수정 내용 저장
const saveDiaryEdit = async () => {
    try {
        // ✅ formData를 먼저 선언 및 초기화
        
        const formData = new FormData();

        // DiaryRequestUpdateDto 데이터 추가
        const diaryRequestUpdateDto = {
            idx: editData.value.diaryIdx,
            title: editData.value.title,
            content: editData.value.content,
            category: editData.value.category,
            date: editData.value.date,
            share: editData.value.share,
            deletedImageList: editData.value.deletedImageList
        };

        // JSON 데이터 추가
        formData.append('diaryRequest', new Blob([JSON.stringify(diaryRequestUpdateDto)], { type: 'application/json' }));

        // 새 이미지 파일 추가
        for (let file of editData.value.imageFiles) {
            formData.append('imageFiles', file);
        }
        console.log('Diary Request:', JSON.stringify(diaryRequestUpdateDto, null, 2));
console.log('FormData:', ...formData.entries());

        // API 호출
        await axios.post(`${BASE_URL}/diary/update`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});

        alert('수정이 완료되었습니다.');
        isEditMode.value = false;
        await fetchDiaryDetail(); // 수정 후 최신 데이터 로드
    } catch (error) {
        console.error('Failed to update diary:', error);
        alert('수정 실패. 다시 시도해주세요.');
    }
};

// 다이어리 삭제
const deleteDiary = async () => {
  if (!confirm('정말 삭제하시겠습니까?')) return;

  try {
    await axios.delete(`${BASE_URL}/diary/delete/${selectedDiary.value.diaryIdx}`);
    alert('다이어리가 삭제되었습니다.');
    router.push({ name: 'diary' }); // 목록 페이지로 이동
  } catch (error) {
    console.error('Failed to delete diary:', error);
    alert('삭제 실패. 다시 시도해주세요.');
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
.diary-container {
  min-height: 100vh; /* 화면 전체 높이 */
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
}

.diary-detail {
  background-color: white;
  border-radius: 10px;
  padding: 30px;
  width: 700px;
  height: 700px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.diary-header {
  margin-bottom: 20px;
}

.diary-title {
  font-size: 1.8rem;
  margin-bottom: 10px;
  color: #333;
}

.diary-info {
  font-size: 1rem;
  color: gray;
}

.diary-content {
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 20px;
  height: 400px;
  color: #555;
}

.diary-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.image-container {
  position: relative;
}

.diary-image {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.edit-mode {
  margin-top: 20px;
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.edit-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
}

.title-input {
  flex: 2;
  margin-right: 10px;
}

.category-select {
  flex: 1;
}

.date-input {
  width: calc(100% - 20px);
}

.content-input {
  height: 100px;
  resize: none;
}

.edit-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.file-input {
  margin-top: 10px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

button {
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 5px;
  cursor: pointer;
}

.edit-btn {
  background-color: #333;
  color: white;
}

.delete-btn {
  background-color: #CCCCCC;
  border: #CCCCCC;
  color: black;
  
}

.save-btn {
  background-color: #333;
  color: white;
}

.cancel-btn {
  background-color: #CCCCCC;
  border: #CCCCCC;
  color: black;
}

.back-btn {
  margin-top: 20px;
  background-color: #333;
  color: white;
  align-self: flex-start;
}

.diary-area {
  position: static;
  height: 600px;
}

</style>

