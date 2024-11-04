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
                <p v-if="editIndex !== index"><strong>Address:</strong><KakaoMap /></p>
                <input v-else v-model="editData.address" class="input-field" placeholder="Enter Address" @click.stop />
                <hr class="divider" />
                <p v-if="editIndex !== index">{{ schedule.content }}</p>
                <textarea v-else v-model="editData.content" class="input-field textarea-field" placeholder="Enter Content" @click.stop></textarea>

                <div v-if="schedule.mapUrl" class="map-container">
                  <img :src="schedule.mapUrl" alt="Map" class="map-image" />
                </div>

                <div class="button-group">
                  <button v-if="editIndex !== index" @click.stop="startEdit('diary', index)">Edit</button>
                  <button v-else @click.stop="saveEdit('diary', index)">Save</button>
                  <button v-if="editIndex === index" @click.stop="cancelEdit()">Cancel</button>
                  <!-- Cancel 버튼 추가 -->
                  <button @click.stop="deleteDiary(index)">Delete</button>
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
                  <button v-if="editIndex === index" @click.stop="cancelEdit()">Cancel</button>
                  <!-- Cancel 버튼 추가 -->
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
import { ref, onMounted, watch, onUnmounted } from 'vue';
import axios from 'axios';
import KakaoMap from '@/views/KakaoMap.vue';
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
const editIndex = ref(null);
const editData = ref({ title: '', content: '', address: '', time: '', repeat: '' });
const showDayView = ref(true);

let pollingInterval = null; // 풀링으로 시간마다 돌리기 하게

const fetchDayData = async selectedDate => {
  // 현재 UI 상태 보존
  const previousExpandedStates = {
    schedules: [...isScheduleExpanded.value],
    diaries: [...isDiaryExpanded.value],
  };

  const [year, month, day] = selectedDate.split('-');
  const idx = 1;

  try {
    const scheduleResponse = await axios.get(`${BASE_URL}/schedule/${idx}/${year}/${month}/${day}`);
    schedules.value = scheduleResponse.data.map(schedule => ({
      ...schedule,
      date: `${year}-${month}-${day}`,
      mapUrl: schedule.mapUrl || null,
      time: schedule.start ? `${schedule.start} - ${schedule.end}` : '',
      repeat: schedule.repeat || 'N/A',
      address: schedule.location || 'No address provided',
      content: schedule.content || 'No details provided',
    }));

    // 스케줄 확장 상태 복원
    isScheduleExpanded.value = schedules.value.map((_, index) => previousExpandedStates.schedules[index] || false);

    //isScheduleExpanded.value = schedules.value.map(() => false);

    const diaryResponse = await axios.get(`${BASE_URL}/diary/${idx}/${year}/${month}/${day}`);
    diaries.value = diaryResponse.data.map(diary => ({
      ...diary,
      id: diary.idx,
      date: `${year}-${month}-${day}`,
      content: diary.content || 'No content available',
      category: diary.category || 'Uncategorized',
    }));

    //다이어리 확장 상태 복원
    isDiaryExpanded.value = diaries.value.map((_, index) => previousExpandedStates.diaries[index] || false);

    //isDiaryExpanded.value = diaries.value.map(() => false);
  } catch (error) {
    console.error('데이터 조회 실패:', error);
  }
};

// 폴링 시작 함수
const startPolling = selectedDate => {
  // 먼저 데이터를 가져옴
  fetchDayData(selectedDate);

  // 5초마다 fetchDayData 호출
  pollingInterval = setInterval(() => {
    fetchDayData(selectedDate);
  }, 1100); // 5000ms = 5초
};

// 폴링 중지 함수
const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
};

// 컴포넌트가 마운트될 때 폴링 시작
onMounted(() => {
  if (props.selectedDate) {
    startPolling(props.selectedDate);
  }
});

// 컴포넌트가 파괴될 때 폴링 중지
onUnmounted(() => {
  stopPolling();
});

// selectedDate가 변경될 때마다 폴링 재설정
watch(
  () => props.selectedDate,
  newDate => {
    stopPolling();
    if (newDate) {
      startPolling(newDate);
    }
  },
  { immediate: true },
);

const toggleScheduleExpand = index => {
  if (editIndex.value === index) return;
  isScheduleExpanded.value[index] = !isScheduleExpanded.value[index];
};

const toggleDiaryExpand = index => {
  if (editIndex.value === index) return;
  isDiaryExpanded.value[index] = !isDiaryExpanded.value[index];
};

const startEdit = (type, index) => {
  editIndex.value = index;
  editData.value = type === 'schedule' ? { ...schedules.value[index] } : { ...diaries.value[index] };
};

const saveEdit = async (type, index) => {
  if (type !== 'diary') return;

  const diaryToUpdate = diaries.value[index];

  const diaryRequest = {
    idx: diaryToUpdate.id,
    title: editData.value.title,
    date: editData.value.date, // 수정된 날짜 그대로 사용
    content: editData.value.content,
    category: diaryToUpdate.category,
  };

  const formData = new FormData();
  formData.append('diaryRequest', new Blob([JSON.stringify(diaryRequest)], { type: 'application/json' }));

  if (editData.value.imageFiles && editData.value.imageFiles.length > 0) {
    editData.value.imageFiles.forEach(image => {
      formData.append('imageFiles', image.file);
    });
  }

  try {
    const response = await axios({
      method: 'post',
      url: `${BASE_URL}/diary/update`,
      data: formData,
    });
    console.log('Diary updated successfully:', response.data);

    Object.assign(diaryToUpdate, editData.value);
  } catch (error) {
    console.error('Error during diary update:', error.response ? error.response.data : error.message);
  } finally {
    editIndex.value = null;
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

const cancelEdit = () => {
  editIndex.value = null; // 수정 중인 인덱스를 초기화하여 수정 모드 종료
  editData.value = { title: '', content: '', address: '', time: '', repeat: '' }; // 수정 데이터 초기화
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
  justify-content: center; /* 버튼들을 가운데 정렬 */
  margin-top: 10px;
  margin-right: 0; /* 오른쪽 여백 제거 */
}

.button-group button {
  background-color: #343434; /* 기본 파란색 배경 */
  color: white; /* 흰색 글자 */
  border: none; /* 테두리 제거 */
  border-radius: 5px; /* 둥근 모서리 */
  padding: 8px 18px; /* 버튼 안쪽 여백 */
  font-size: 0.9rem; /* 폰트 크기 */
  cursor: pointer; /* 커서가 버튼 위에 있을 때 포인터로 변경 */
  transition:
    background-color 0.3s,
    transform 0.2s; /* 색상 및 크기 변환 효과 */
  margin-right: 5px; /* 버튼 사이의 간격 */
}

.button-group button:last-child {
  margin-right: 0; /* 마지막 버튼의 오른쪽 여백 제거 */
}

.button-group button:hover {
  background-color: #808080; /* 호버 시 더 어두운 색상 */
  transform: translateY(-2px); /* 호버 시 살짝 올라가는 효과 */
}

.button-group button:active {
  background-color: #004080; /* 클릭 시 더 어두운 색상 */
  transform: translateY(0); /* 클릭 시 원래 위치로 돌아옴 */
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
