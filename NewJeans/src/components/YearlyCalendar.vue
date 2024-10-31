<template>
  <div class="calendar-wrapper">
    <div class="year-selector">
      <button class="this-year-button" @click="resetToCurrentYear">This year</button>
      <button @click="$emit('toMonthlyView')" class="monthly-button">Monthly</button>
      <div class="yearCha">
        <button @click="changeYear(-1)">◀</button>
        <h1>{{ currentYear }}</h1>
        <button @click="changeYear(1)">▶</button>
      </div>
    </div>
    <div class="calendar-grid">
      <div v-for="month in calendar" :key="month.month" class="month">
        <h2>{{ month.name }}</h2>
        <div class="grid">
          <div v-for="day in weekDays" :key="day" :class="['day', day === 'Sun' ? 'sunday' : day === 'Sat' ? 'saturday' : '']">{{ day }}</div>
          <div v-for="blank in month.firstDay" :key="'blank-' + blank" class="blank"></div>
          <div
            v-for="date in month.days"
            :key="date"
            class="date"
            :class="{ 'has-schedule': getSchedulesForDate(dayjs(`${currentYear.value}-${String(month.month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`)).length > 0 }"
          >
            <span class="date-type">{{ date }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import dayjs from 'dayjs';
import axios from 'axios';
import { BASE_URL } from '@/config';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const calendar = ref([]);
const currentYear = ref(dayjs().year());
const schedules = ref([]); // 연도별 일정 데이터

// 연간 일정 데이터를 불러오는 함수
const loadYearlySchedules = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/schedule/1/${currentYear.value}`);
    schedules.value = response.data;
    console.log('Loaded schedules data:', schedules.value);
    generateCalendar(); // 일정 데이터 로드 후 캘린더 생성
  } catch (error) {
    console.error('Failed to load yearly schedules:', error);
  }
};

// 연간 캘린더 데이터를 생성하는 함수
const generateCalendar = () => {
  calendar.value = [];
  for (let month = 0; month < 12; month++) {
    const firstDay = dayjs().year(currentYear.value).month(month).date(1);
    const lastDay = firstDay.endOf('month').date();
    calendar.value.push({
      month,
      name: firstDay.format('MMMM'),
      firstDay: firstDay.day(),
      days: Array.from({ length: lastDay }, (_, i) => i + 1),
    });
  }
};

// 특정 날짜에 해당하는 일정을 필터링하는 함수
const getSchedulesForDate = date => {
  return schedules.value.filter(schedule => dayjs(schedule.start).isSame(date, 'day'));
};

// 연도 변경 시 새 일정 데이터 불러오기
const changeYear = amount => {
  currentYear.value += amount;
  loadYearlySchedules(); // 연도 변경 시 새 일정 데이터 불러오기
};

onMounted(() => {
  loadYearlySchedules(); // 컴포넌트가 마운트되면 연간 일정 데이터 로드
});

const resetToCurrentYear = () => {
  currentYear.value = dayjs().year();
  loadYearlySchedules();
};
</script>

<style scoped>
.calendar-wrapper {
  background-color: white;
  border-radius: 10px;
  perspective: 1000px;
  display: flex;
  align-items: flex-start;
  padding-bottom: 20px;
  padding-left: 50px;
  padding-right: 50px;
  min-height: 500px;
  width: 65%;
  padding-top: 30px;
  margin-left: 50px;
  margin-right: 50px;
  overflow: hidden;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); /* 그림자 추가 */
}

.yearCha {
  display: flex;
  align-items: center; /* 수직 정렬 */
  justify-content: center; /* 수평 가운데 정렬 */
  gap: 10px; /* 버튼과 텍스트 사이 간격 */
}

.year-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 20px;
  position: absolute; /* 캘린더 래퍼의 좌상단에 위치 */
  top: 57px; /* 상단 간격 */
  left: 71px; /* 좌측 간격 */
}

.year-selector h1 {
  font-size: 2rem;
  font-weight: 500;
  margin: 0;
}

.year-selector button {
  background-color: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #333;
}

.this-year-button {
  background-color: #333 !important;
  color: white !important;
  border: none !important;
  padding: 0.5rem 1rem !important;
  border-radius: 20px !important;
  font-size: 0.9rem !important;
  cursor: pointer !important;
}

.monthly-button {
  background-color: #333 !important;
  color: white !important;
  border: none !important;
  padding: 0.5rem 1rem !important;
  border-radius: 20px !important;
  font-size: 0.9rem !important;
  cursor: pointer !important;
}

/* 캘린더 그리드 */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3열로 설정하여 3x4 배치 */
  gap: 20px;
  width: 100%;
  margin-top: 80px; /* year-selector와 떨어지게 조정 */
}

/* 기타 스타일은 그대로 유지 */
.month {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.month h2 {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 10px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.day {
  font-size: 0.8rem;
  font-weight: bold;
  color: #666;
}

.sunday {
  color: red;
}

.saturday {
  color: blue;
}

.blank,
.date {
  text-align: center;
  padding: 5px;
  border-radius: 4px;
}

.date {
  background-color: #f1f3f5;
  color: #333;
  position: relative; /* 위치 설정 */
}

.has-schedule {
  /* 일정이 있는 경우 동그라미 테두리 추가 */
  border: 2px solid #333; /* 테두리 색상 설정 */
  border-radius: 50%; /* 동그라미 형태 */
  width: 40px; /* 원하는 크기로 설정 */
  height: 40px; /* 원하는 크기로 설정 */
  display: flex; /* flexbox 사용 */
  align-items: center; /* 중앙 정렬 */
  justify-content: center; /* 중앙 정렬 */
  margin: 0 auto; /* 가운데 정렬 */
}

.blank {
  background-color: transparent;
}
</style>
