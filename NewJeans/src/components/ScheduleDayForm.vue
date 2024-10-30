<template>
  <div>
    <!-- 일정 및 일기 조회 섹션 -->
    <div class="day-form" v-if="showDayView">
      <div class="schedule-section">
        <div v-if="schedules.length > 0">
          <div v-for="(schedule, index) in schedules" :key="index" class="schedule-item" :style="{ borderColor: schedule.color }" @click="toggleScheduleExpand(index)">
            <!-- 제목과 날짜/카테고리 고정 위치 -->
            <div class="title-container">
              <h4>{{ schedule.title }}</h4>
              <p class="date">{{ schedule.date }}</p>
            </div>

            <!-- 일정 상세 내용 슬라이드 애니메이션 -->
            <transition name="slide-fade">
              <div v-show="isScheduleExpanded[index]" class="expanded-content">
                <hr class="divider" />
                <p><strong>Time:</strong> {{ schedule.time }}</p>
                <p><strong>Repeat:</strong> {{ schedule.repeat }}</p>
                <hr class="divider" />
                <p><strong>Address:</strong> {{ schedule.address }}</p>
                <div v-if="schedule.mapUrl" class="map-container">
                  <img :src="schedule.mapUrl" alt="Map" class="map-image" />
                </div>
                <hr class="divider" />
                <p>{{ schedule.content }}</p>
                <hr class="divider" />

                <!-- 수정/삭제 버튼 그룹 -->
                <div class="button-group">
                  <button @click.stop="editSchedule(index)">Edit</button>
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

      <div class="diary-section">
        <div v-if="diaries.length > 0">
          <div v-for="(diary, index) in diaries" :key="index" class="diary-item" @click="toggleDiaryExpand(index)">
            <!-- 제목과 카테고리 고정 위치 -->
            <div class="title-container">
              <h4>{{ diary.title }}</h4>
              <p class="category">{{ diary.category }}</p>
            </div>

            <!-- 일기 상세 내용 슬라이드 애니메이션 -->
            <transition name="slide-fade">
              <div v-show="isDiaryExpanded[index]" class="expanded-content">
                <hr class="divider" />
                <p><strong>Date:</strong> {{ diary.date }}</p>
                <hr class="divider" />
                <p>{{ diary.content }}</p>

                <!-- 이미지 렌더링 -->
                <div v-if="diary.images && diary.images.length" class="diary-images">
                  <img v-for="(imageUrl, imgIndex) in diary.images" :key="imgIndex" :src="`${BASE_URL}${imageUrl}`" alt="Diary Image" style="width: 150px; margin: 5px" />
                </div>

                <!-- 수정/닫기 버튼 그룹 -->
                <div class="button-group">
                  <button @click.stop="editDiary(index)">Edit</button>
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
      time: schedule.start ? `${schedule.start} - ${schedule.end}` : '', // 시간 범위 포맷팅
      repeat: schedule.repeat || 'N/A',
      address: schedule.location || 'No address provided',
      content: schedule.content || 'No details provided',
    }));

    isScheduleExpanded.value = schedules.value.map(() => false);

    const diaryResponse = await axios.get(`${BASE_URL}/diary/${idx}/${year}/${month}/${day}`);
    diaries.value = diaryResponse.data.map(diary => ({
      ...diary,
      date: `${year}.${month}.${day}`, // 날짜 추가
      content: diary.content || 'No content available',
      category: diary.category || 'Uncategorized',
    }));

    isDiaryExpanded.value = diaries.value.map(() => false);
  } catch (error) {
    console.error('데이터 조회 실패:', error);
  }
};

const toggleScheduleExpand = index => {
  isScheduleExpanded.value[index] = !isScheduleExpanded.value[index];
};

const toggleDiaryExpand = index => {
  isDiaryExpanded.value[index] = !isDiaryExpanded.value[index];
};

const editSchedule = index => {
  console.log(`Editing schedule at index: ${index}`);
};

const editDiary = index => {
  console.log(`Editing diary at index: ${index}`);
};

// 스케줄 삭제 함수
const deleteSchedule = async index => {
  const scheduleId = schedules.value[index].id;
  try {
    await axios.delete(`${BASE_URL}/schedule/${scheduleId}`);
    schedules.value.splice(index, 1); // 삭제 후 목록에서 제거
    console.log('Schedule deleted successfully');
  } catch (error) {
    console.error('Failed to delete schedule:', error);
  }
};

// 다이어리 삭제 함수
const deleteDiary = async index => {
  const diaryId = diaries.value[index].id;
  try {
    await axios.delete(`${BASE_URL}/diary/${diaryId}`);
    diaries.value.splice(index, 1); // 삭제 후 목록에서 제거
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

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition:
    max-height 0.3s ease,
    opacity 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}
</style>
