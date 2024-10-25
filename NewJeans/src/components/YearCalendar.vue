<script setup>
import { ref } from 'vue';
import dayjs from 'dayjs';

const now = ref(dayjs()); // 현재 날짜

// 연도 변경
const changeYear = direction => {
  if (direction === 'next') {
    now.value = now.value.add(1, 'year');
  } else {
    now.value = now.value.subtract(1, 'year');
  }
};

const getDaysInMonth = month => {
  const days = [];
  const startOfMonth = dayjs()
    .year(now.value.year())
    .month(month - 1)
    .startOf('month');
  const endOfMonth = dayjs()
    .year(now.value.year())
    .month(month - 1)
    .endOf('month');

  let currentDay = startOfMonth;

  while (currentDay.isBefore(endOfMonth) || currentDay.isSame(endOfMonth, 'day')) {
    days.push({
      date: currentDay.toDate(),
      dayOfWeek: currentDay.day(),
    });
    currentDay = currentDay.add(1, 'day'); 
  }

  return days;
};

// 12개월 배열 생성
const months = Array.from({ length: 12 }, (_, i) => i + 1);
</script>

<template>
  <div>
    <div class="year-calendar-wrapper">
      <!-- 연도 변경 버튼 -->
      <h1 class="year-title">
        <button @click="changeYear('prev')">‹</button>
        {{ now.format('YYYY') }} Year
        <button @click="changeYear('next')">›</button>
      </h1>

      <!-- 12개월을 그리드 형태로 표시 -->
      <div class="year-grid">
        <div v-for="month in months" :key="month" class="month-cell">
          <!-- 각 월 이름 -->
          <h3>
            {{
              dayjs()
                .month(month - 1)
                .format('MMMM')
            }}
          </h3>
          <!-- 요일 헤더 -->
          <div class="weekdays"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span> <span>Thu</span><span>Fri</span><span>Sat</span></div>
          <!-- 일자 그리드 -->
          <div class="days-grid">
            <div
              v-for="day in getDaysInMonth(month)"
              :key="day.date"
              :class="{
                sunday: day.dayOfWeek === 0,
                saturday: day.dayOfWeek === 6,
                today: dayjs(day.date).isSame(dayjs(), 'day'),
              }"
            >
              {{ dayjs(day.date).date() }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.year-calendar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  width: 90%;
  margin: auto;
}

.year-title {
  display: flex;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 20px;
}

.year-title button {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
}

.year-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 1년에 12개월을 4열로 나열 */
  gap: 20px; /* 그리드 간격 */
  width: 100%; /* 그리드가 화면에 맞게 배치되도록 조정 */
}

.month-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f7f7f7;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%; /* 부모 그리드에 맞추기 */
  min-width: 180px; /* 최소 너비 설정 (가독성 보장) */
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr); /* 요일 7칸 */
  font-weight: bold;
  text-align: center;
  margin-bottom: 5px;
  font-size: 14px; /* 요일 글자 크기 조정 */
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr); /* 날짜 7칸 */
  gap: 5px; /* 날짜 간격 */
  text-align: center;
}

.sunday {
  color: red;
}

.saturday {
  color: blue;
}

.today {
  background-color: #ddd;
  border-radius: 50%;
  font-weight: bold;
}

.month-cell h3 {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.date-number {
  font-size: 0.9rem; /* 날짜 폰트 크기 조정 */
}


</style>
