<script setup>
import { ref, watch } from 'vue';
import dayjs from 'dayjs'

const now = ref(dayjs())
const columns = ref([])
const groupColumns = ref([])

// selectDate 가 값이 null일때는 false 값이 date 로 바뀌면 true;
const selectDate = ref(null)
const title = ref('')
const content = ref('')

const subMonth = () => {
  now.value = dayjs(now.value).subtract(1, 'month')
}
const addMonth = () => {
  now.value = dayjs(now.value).add(1, 'month')
}
const selectDateFn = date => {
  console.log('dateClick', dayjs(date).format('YYYY-MM-DD'))
  selectDate.value = dayjs(date).format('YYYY-MM-DD')
}

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

    groupColumns.value.push(columns.value.slice(0, 7))
    groupColumns.value.push(columns.value.slice(7, 14))
    groupColumns.value.push(columns.value.slice(14, 21))
    groupColumns.value.push(columns.value.slice(21, 28))
    groupColumns.value.push(columns.value.slice(28, 35))
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
          <button @click="subMonth()" class="B-Month-button">
            <i>이전달</i>
          </button>
          {{ now.format('YYYY년 MM월') }}
          <button @click="addMonth()" class="A-Month-button">
            <i>다음달</i>
          </button>
        </h1>
        <div class="DOWgrid">
          <div class="Sun">일</div>
          <div class="p-2 px-4">월</div>
          <div class="p-2 px-4">화</div>
          <div class="p-2 px-4">수</div>
          <div class="p-2 px-4">목</div>
          <div class="p-2 px-4">금</div>
          <div class="p-2 px-4 text-blue-500">토</div>
        </div>
        <div
          class="grid grid-cols-7 gap-2"
          v-for="group in groupColumns"
          :key="group.length"
        >
          <div
            @click="selectDateFn(column)"
            v-for="(column, index) in group"
            :key="column.format('YYYY-MM-DD')"
            class="text-center p-2 hover:bg-blue-200 cursor-pointer"
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
.aa{
display: flex;
justify-content: center;
}

.vv{
max-width: 32rem;
width: 100%;
background-color: white;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06); 
border-radius: 0.5rem; 
padding: 1rem; 
}

.Calender-title{
font-size: 1.25rem;
font-weight: bold; 
text-align: center; 
margin-bottom: 1rem;
}

.B-Month-button{
    margin-left: 0.5rem;
}
.A-Month-button{
    margin-right: 0.5rem;
} 

.DOWgrid{
    display: grid;
    grid-template-columns: repeat(7, 1fr); 
    gap: 0.5rem; 
    text-align: center; 
    color: #4b5563; 
}

.Sun{
    padding: 0.5rem; 
padding-left: 1rem;
padding-right: 1rem; 
color: #dc2626; 
}



</style>
