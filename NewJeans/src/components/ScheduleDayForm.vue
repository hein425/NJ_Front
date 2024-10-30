<template>
  <div>
    <!-- 일정 및 일기 조회 섹션 -->
    <div class="day-form" v-if="showDayView">
      <div class="schedule-section">
        <div v-if="schedules.length > 0">
          <div v-for="(schedule, index) in schedules" :key="index" class="schedule-item" :style="{ borderColor: schedule.color }" @click="toggleScheduleExpand(index)">
            <!-- 타이틀과 날짜만 표시 -->
            <h4>{{ schedule.title }}</h4>
            <p>{{ schedule.date }}</p>

            <!-- 일정 상세 내용 슬라이드 애니메이션 -->
            <transition name="slide-fade">
              <div v-show="isScheduleExpanded[index]" class="expanded-content">
                <p><strong>Time:</strong> {{ schedule.time }}</p>
                <p><strong>Address:</strong> {{ schedule.address }}</p>
                <p>{{ schedule.content }}</p>

                <!-- 수정/닫기 버튼 그룹 -->
                <div class="button-group">
                  <button @click.stop="editSchedule(index)">Edit</button>
                  <button @click.stop="toggleScheduleExpand(index)">Close</button>
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
            <!-- 타이틀과 카테고리만 표시 -->
            <h4>{{ diary.title }}</h4>
            <p>{{ diary.category }}</p>

            <!-- 일기 상세 내용 슬라이드 애니메이션 -->
            <transition name="slide-fade">
              <div v-show="isDiaryExpanded[index]" class="expanded-content">
                <p>{{ diary.content }}</p>

                <!-- 이미지 렌더링 -->
                <div v-if="diary.images && diary.images.length" class="diary-images">
                  <img v-for="(imageUrl, imgIndex) in diary.images" :key="imgIndex" :src="`${BASE_URL}/auth/login/diary/${imageUrl}`" alt="Diary Image" style="width: 150px; margin: 5px" />
                </div>

                <!-- 수정/닫기 버튼 그룹 -->
                <div class="button-group">
                  <button @click.stop="editDiary(index)">Edit</button>
                  <button @click.stop="toggleDiaryExpand(index)">Close</button>
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
import { useRouter, useRoute } from 'vue-router';
import { BASE_URL } from '@/config';

const router = useRouter();
const route = useRoute();

// props로 받은 selectedDate 처리
const props = defineProps({
  selectedDate: String, // 날짜를 프롭스로 받음
});

// 날짜가 변경되면 해당 날짜에 대한 일정을 불러오기
watch(
  () => props.selectedDate,
  async newDate => {
    if (newDate) {
      await fetchDayData(newDate); // 날짜가 바뀌면 데이터 가져오기
    }
  },
  { immediate: true },
);

// 일정 및 일기 조회 관련 상태
const schedules = ref([]); // 일정 목록
const diaries = ref([]); // 일기 목록
const formattedDate = ref('');
const isScheduleExpanded = ref([]); // 일정 확장/축소 상태
const isDiaryExpanded = ref([]); // 일기 확장/축소 상태
const showDayView = ref(true); // 일정 및 일기 조회 화면이 보일지 여부

// 일정 및 일기 조회 함수
const fetchDayData = async selectedDate => {
  const [year, month, day] = selectedDate.split('-');
  const idx = 1; // 테스트를 위한 고정 idx 값

  try {
    console.log('idx = ' + idx);
    console.log('year = ' + year);
    console.log('month = ' + month);
    console.log('day = ' + day);

    // 일정 조회
    const scheduleResponse = await axios.get(`${BASE_URL}/schedule/${idx}/${year}/${month}/${day}`);
    schedules.value = scheduleResponse.data;

    // 일정 수만큼 isScheduleExpanded 배열 초기화
    isScheduleExpanded.value = schedules.value.map(() => false);

    // 일기 조회
    const diaryResponse = await axios.get(`${BASE_URL}/diary/${idx}/${year}/${month}/${day}`);
    diaries.value = diaryResponse.data;

    // 일기 수만큼 isDiaryExpanded 배열 초기화
    isDiaryExpanded.value = diaries.value.map(() => false);

    formattedDate.value = `${year}.${month}.${day}`;
  } catch (error) {
    console.error('데이터 조회 실패:', error);
  }
};

// 일정 확장/축소 상태 토글 함수
const toggleScheduleExpand = index => {
  isScheduleExpanded.value[index] = !isScheduleExpanded.value[index];
};

// 일기 확장/축소 상태 토글 함수
const toggleDiaryExpand = index => {
  isDiaryExpanded.value[index] = !isDiaryExpanded.value[index];
};

// 수정 기능 (임시 기능으로 로그 출력)
const editSchedule = index => {
  console.log(`Editing schedule at index: ${index}`);
};

const editDiary = index => {
  console.log(`Editing diary at index: ${index}`);
};

// 컴포넌트가 마운트될 때 데이터 조회 함수 호출
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
  border: 2px solid;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  color: black;
  background-color: transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.schedule-item h4,
.diary-item h4 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: bold;
}

.schedule-item p,
.diary-item p {
  margin: 0;
  font-size: 0.9rem;
  color: gray;
}

/* 상세 내용 및 버튼 그룹 스타일 */
.expanded-content {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #ccc;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

/* 트랜지션 애니메이션 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}
</style>
