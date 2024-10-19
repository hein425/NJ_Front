<script setup>
import { ref, watch } from 'vue';
import dayjs from 'dayjs';

const now = ref(dayjs());
const columns = ref([]);
const groupColumns = ref([]);

// selectDate 가 값이 null일때는 false 값이 date 로 바뀌면 true;
const selectDate = ref(null);
const title = ref('');
const content = ref('');

const subMonth = () => {
  now.value = dayjs(now.value).subtract(1, 'month')
};
const addMonth = () => {
  now.value = dayjs(now.value).add(1, 'month')
};
const selectDateFn = date => {
  console.log('dateClick', dayjs(date).format('YYYY-MM-DD'))
  selectDate.value = dayjs(date).format('YYYY-MM-DD')
};
const goToday = () => {
  now.value = dayjs(); // 오늘 날짜로 돌아가기
};

watch(
  now,
  (newValue, _) => {
    columns.value = [] // 원래 있던 값 제거
    groupColumns.value = [] // 원래 있던 값 제거
    // 제일 처음 로딩 할때는 now는 현재 달력...
    const startday = dayjs(now.value).startOf('month')
    const lastday = dayjs(now.value).endOf('month')
    const startdayOfWeek = startday.get('day')
    const lastdayOfWeek = lastday.get('day')

    // 저번달에 날짜 추가
    for (let i = 1; i <= startdayOfWeek; i++) {
      columns.value.unshift(dayjs(startday).subtract(i, 'day'))
    }
    // 현재 달력에 날짜 추가
    for (let i = 0; i < lastday.get('date'); i++) {
      columns.value.push(dayjs(startday).add(i, 'day'))
    }
    // 다음달에 날짜 추가
    for (let i = 1; i <= 6 - lastdayOfWeek; i++) {
      columns.value.push(dayjs(lastday).add(i, 'day'))
    }

    for (let i = 0; i < columns.value.length; i += 7) {
        groupColumns.value.push(columns.value.slice(i, i + 7));
    }

    // groupColumns.value.push(columns.value.slice(0, 7))
    // groupColumns.value.push(columns.value.slice(7, 14))
    // groupColumns.value.push(columns.value.slice(14, 21))
    // groupColumns.value.push(columns.value.slice(21, 28))
    // groupColumns.value.push(columns.value.slice(28, 35))
  },
  {
    immediate: true, // 현재페이지 처음 로딩 될때 도 실행
    deep: true, // 안에 값이 객체이면 객체 안에 변수도 변경 될때 watch안에 있는 함수 실행
  },
)
</script>

<template>
  <div>
    <div class="aa">
      <div class="vv">
        <h1 class="Calender-title">
          <button @click="goToday" class="Today-button">Today</button>
          <button @click="subMonth()" class="B-Month-button">
            <i><<</i>
          </button>
          {{ now.format('YYYY MMMM') }}
          <button @click="addMonth()" class="A-Month-button">
            <i>>></i>
          </button>
        </h1>
        <div class="DOWgrid">
          <div class="Sun">Sun</div>
          <div class="Dayss">Mon</div>
          <div class="Dayss">Tue</div>
          <div class="Dayss">Wed</div>
          <div class="Dayss">Thur</div>
          <div class="Dayss">Fri</div>
          <div class="Sat">Sat</div>
        </div>  
        <div
          class="CALgrid"
          v-for="group in groupColumns"
          :key="group.length"
        >
          <div
            @click="selectDateFn(column)"
            v-for="(column, index) in group"
            :key="column.format('YYYY-MM-DD')"
            class="Datecell"
            :class="{
              'text-red-600': index % 7 == 0,
              'text-blue-600': index % 7 == 6,
              'opacity-20': !column.isSame(now, 'month'),
            }"
          >
            <span>{{ column.get('date') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.aa{ //전체 껍데기
  display: flex;
  justify-content: center;
  min-height: 100vh; /* 화면 전체 높이 */
  padding: 20px;
  border-radius: 20px;
}

.vv{ // 달력 껍데기
  max-width: 50rem; /* 전체 비율을 좌우로 넓힘 */
  width: 100%;
  background-color: white;
  padding: 1.5rem;
  text-align: center;
  border-radius: 20px;
}

.Calender-title{
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.Today-button {
  background-color: #333;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 20px;
}

.B-Month-button,
.A-Month-button {
  background-color: #f1f1f1;
  border: none;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 1.25rem;
}


// .B-Month-button{
//     margin-left: 0.5rem;
// }
// .A-Month-button{
//     margin-right: 0.5rem;
// } 

.DOWgrid{
  display: grid;
  grid-template-columns: repeat(7, 1fr); 
  gap: 0.5rem;
  text-align: center;
  margin-bottom: 1rem;
}

.Sun {
  padding: 0.75rem;
  color: red;
  font-weight: bold;
}

.Dayss {
  padding: 0.75rem;
  color: black;
  font-weight: bold;
}

.Sat {
  padding: 0.75rem;
  color: blue;
  font-weight: bold;
}

.CALgrid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  margin-bottom: 1rem;
}

.Datecell {
  text-align: center;
  padding: 1.5rem;
  background-color: #f7f7f7;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  border: 1px solid #eee;
  transition: background-color 0.2s, border 0.2s;
}

.Datecell:hover {
  background-color: #e1e1e1;
}

.red-text {
  color: #dc2626;
}

.blue-text {
  color: #2563eb;
}

.faded-opacity {
  opacity: 0.2;
}

</style>
