<template>
  <div>
    <!-- 일정 및 일기 조회 섹션 -->
    <div class="day-form" v-if="showDayView">
      <!-- 스케줄 섹션 -->
      <div class="schedule-section">
        <div v-if="schedules.length > 0">
          <div v-for="(schedule, index) in schedules" :key="index" class="schedule-item" :style="{ borderColor: schedule.color }" @click="toggleScheduleExpand(index)">
            <div class="title-container">
              <h4 v-if="editIndex !== index">{{ schedule.title }}</h4>
              <input v-else v-model="editData.title" class="input-field" placeholder="Enter Title" @click.stop />
              <p class="date">{{ schedule.date }}</p>
            </div>

            <transition name="slide-fade">
              <div v-show="isScheduleExpanded[index]" class="expanded-content">
                <hr class="divider" />
                <p v-if="editIndex !== index"><strong>Time:</strong> {{ schedule.time }}</p>
                <input v-else v-model="editData.time" class="input-field" placeholder="Enter Time" @click.stop />
                <p v-if="editIndex !== index"><strong>Repeat:</strong> {{ schedule.repeat }}</p>
                <input v-else v-model="editData.repeat" class="input-field" placeholder="Enter Repeat Frequency" @click.stop />
                <hr class="divider" />
                <p v-if="editIndex !== index"><strong>Address:</strong> {{ schedule.address }}</p>
                <input v-else v-model="editData.address" class="input-field" placeholder="Enter Address" @click.stop />
                <hr class="divider" />
                <p v-if="editIndex !== index">{{ schedule.content }}</p>
                <textarea v-else v-model="editData.content" class="input-field textarea-field" placeholder="Enter Content" @click.stop></textarea>

                <div v-if="schedule.mapUrl" class="map-container">
                  <img :src="schedule.mapUrl" alt="Map" class="map-image" />
                </div>

                <div class="button-group">
                  <button v-if="editIndex !== index" @click.stop="startEdit('schedule', index)">Edit</button>
                  <button v-else @click.stop="saveEdit('schedule', index)">Save</button>
                  <button @click.stop="deleteSchedule(index)">Delete</button>
                </div>
              </div>
            </transition>
          </div>
        </div>
        <div v-else>
          <p>해당 날짜에 등록된 일정이 없습니다.</p>
        </div>
      </div>

      <!-- 다이어리 섹션 -->
      <div class="diary-section">
        <div v-if="diaries.length > 0">
          <div v-for="(diary, index) in diaries" :key="index" class="diary-item" @click="toggleDiaryExpand(index)">
            <div class="title-container">
              <h4 v-if="editIndex !== index">{{ diary.title }}</h4>
              <input v-else v-model="editData.title" class="input-field" placeholder="Enter Title" @click.stop />
              <p class="category">{{ diary.category }}</p>
            </div>

            <transition name="slide-fade">
              <div v-show="isDiaryExpanded[index]" class="expanded-content">
                <hr class="divider" />
                <p v-if="editIndex !== index"><strong>Date:</strong> {{ diary.date }}</p>
                <input v-else v-model="editData.date" class="input-field" placeholder="Enter Date" type="date" @click.stop />
                <hr class="divider" />
                <p v-if="editIndex !== index">{{ diary.content }}</p>
                <textarea v-else v-model="editData.content" class="input-field textarea-field" placeholder="Enter Content" @click.stop></textarea>

                <div v-if="diary.images && diary.images.length" class="diary-images">
                  <img v-for="(imageUrl, imgIndex) in diary.images" :key="imgIndex" :src="`${BASE_URL}${imageUrl}`" alt="Diary Image" style="width: 150px; margin: 5px" />
                </div>

                <div class="button-group">
                  <button v-if="editIndex !== index" @click.stop="startEdit('diary', index)">Edit</button>
                  <button v-else @click.stop="saveEdit('diary', index)">Save</button>
                  <button @click.stop="deleteDiary(index)">Delete</button>
                </div>
              </div>
            </transition>
          </div>
        </div>
        <div v-else>
          <p>해당 날짜에 작성된 일기가 없습니다.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { BASE_URL } from '@/config';

const props = defineProps({
  selectedDate: String,
});

watch(
  () => props.selectedDate,
  async newDate => {
    if (newDate) {
      await fetchDayData(newDate);
    }
  },
  { immediate: true },
);

const schedules = ref([]);
const diaries = ref([]);
const isScheduleExpanded = ref([]);
const isDiaryExpanded = ref([]);
const editIndex = ref(null); // 현재 수정 중인 항목 인덱스
const editData = ref({ title: '', content: '', address: '', time: '', repeat: '' });
const showDayView = ref(true);

const fetchDayData = async selectedDate => {
  const [year, month, day] = selectedDate.split('-');
  const idx = 1;

  try {
    const scheduleResponse = await axios.get(`${BASE_URL}/schedule/${idx}/${year}/${month}/${day}`);
    schedules.value = scheduleResponse.data.map(schedule => ({
      ...schedule,
      date: `${year}.${month}.${day}`,
      mapUrl: schedule.mapUrl || null,
      time: schedule.start ? `${schedule.start} - ${schedule.end}` : '',
      repeat: schedule.repeat || 'N/A',
      address: schedule.location || 'No address provided',
      content: schedule.content || 'No details provided',
    }));

    isScheduleExpanded.value = schedules.value.map(() => false);

    const diaryResponse = await axios.get(`${BASE_URL}/diary/${idx}/${year}/${month}/${day}`);
    diaries.value = diaryResponse.data.map(diary => ({
      ...diary,
      id: diary.idx,
      date: `${year}.${month}.${day}`,
      content: diary.content || 'No content available',
      category: diary.category || 'Uncategorized',
    }));

    isDiaryExpanded.value = diaries.value.map(() => false);
  } catch (error) {
    console.error('데이터 조회 실패:', error);
  }
};

const toggleScheduleExpand = index => {
  if (editIndex.value === index) return; // 수정 중일 때 닫기 방지
  isScheduleExpanded.value[index] = !isScheduleExpanded.value[index];
};

const toggleDiaryExpand = index => {
  if (editIndex.value === index) return; // 수정 중일 때 닫기 방지
  isDiaryExpanded.value[index] = !isDiaryExpanded.value[index];
};

const startEdit = (type, index) => {
  editIndex.value = index;

  if (type === 'schedule') {
    editData.value = { ...schedules.value[index] };
  } else if (type === 'diary') {
    // 다이어리 항목 편집 시 데이터 복사
    const diary = diaries.value[index];

    // 날짜를 "yyyy-MM-dd" 형식으로 변환
    const formatDateToISO = dateString => {
      const [year, month, day] = dateString.split('.');
      return `${year}-${month}-${day}`;
    };

    editData.value = {
      ...diary,
      date: formatDateToISO(diary.date), // 날짜를 ISO 형식으로 설정
    };
  }
};

const saveEdit = async (type, index) => {
  if (type !== 'diary') return;

  const diaryToUpdate = diaries.value[index];

  // 날짜 형식을 "yyyy-MM-dd"로 변환
  const formatDateToISO = dateString => {
    const [year, month, day] = dateString.split('.');
    return `${year}-${month}-${day}`;
  };

  // 다이어리 업데이트에 필요한 데이터 구성
  const diaryRequest = {
    idx: diaryToUpdate.id,
    title: editData.value.title,
    date: formatDateToISO(editData.value.date),
    content: editData.value.content,
    category: diaryToUpdate.category,
  };

  // FormData 객체 생성
  const formData = new FormData();
  formData.append('diaryRequest', JSON.stringify(diaryRequest)); // Postman에서 Text로 추가한 것처럼

  // 이미지 파일 추가
  if (editData.value.imageFiles && editData.value.imageFiles.length > 0) {
    editData.value.imageFiles.forEach(image => {
      formData.append('imageFiles', image.file); // 이미지 파일 추가
    });
  }

  try {
    // FormData 전송
    const response = await axios.post(`${BASE_URL}/diary/update`, formData);
    console.log('Diary updated successfully:', response.data);

    // UI에 업데이트된 데이터를 반영합니다.
    Object.assign(diaryToUpdate, editData.value);
  } catch (error) {
    console.error('Error during diary update:', error.response ? error.response.data : error.message);
  } finally {
    editIndex.value = null; // 편집 모드 종료
  }
};

const deleteSchedule = async index => {
  const scheduleId = schedules.value[index].id;
  try {
    await axios.delete(`${BASE_URL}/schedule/${scheduleId}`);
    schedules.value.splice(index, 1);
    console.log('Schedule deleted successfully');
  } catch (error) {
    console.error('Failed to delete schedule:', error);
  }
};

const deleteDiary = async index => {
  const diaryId = diaries.value[index].id;
  if (!diaryId) {
    console.error('Failed to delete diary: diaryId is undefined');
    return;
  }
  try {
    await axios.delete(`${BASE_URL}/diary/delete/${diaryId}`);
    diaries.value.splice(index, 1);
    console.log('Diary deleted successfully');
  } catch (error) {
    console.error('Failed to delete diary:', error);
  }
};

onMounted(fetchDayData);
</script>

<style scoped>
.day-form {
  margin-top: 100px;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  width: 700px;
}

.schedule-section,
.diary-section {
  margin-bottom: 20px;
}

.schedule-item,
.diary-item {
  border: 2px solid #c7c7c7;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  color: black;
  background-color: transparent;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date,
.category {
  font-size: 0.9rem;
  color: gray;
  margin-left: auto;
}

.expanded-content {
  margin-top: 10px;
  padding-top: 10px;
  overflow: hidden;
}

.divider {
  border: none;
  border-top: 1px solid #ccc;
  margin: 10px 0;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.map-container {
  margin-top: 10px;
}

.map-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.input-field {
  border: none;
  width: 20%;
  padding: 10px;
  border-radius: 5px;
  font-size: 1rem;
}

.textarea-field {
  height: 100px;
  resize: none;
}
</style>
