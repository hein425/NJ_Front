<template>
  <div class="schedule-form">
    <h2>일정 작성</h2>
    <form @submit.prevent="submitSchedule">
      
      <div>
        <label for="title">제목</label>
        <input id="title" v-model="title" />
      </div>

      <!-- 색깔 선택 드롭다운 -->
      <label for="colors">색깔</label>
      <select v-model="selectedColor" id="colors">
        <option v-for="color in colors" :key="color" :value="color">
          {{ color }}
        </option>
      </select>

      <div>
        <label for="date">날짜</label>
        <input id="date" v-model="date" type="date" />
      </div>

      <div>
        <label for="time">시간</label>
        <input id="time" v-model="time" type="time" />
      </div>

      <!-- 반복 여부 선택 라디오 버튼 -->
      <div>
        <label>반복 여부</label>
        <div>
          <label>
            <input type="radio" v-model="repeatOption" value="EY" />
            매년
          </label>
          <label>
            <input type="radio" v-model="repeatOption" value="EM" />
            매월
          </label>
          <label>
            <input type="radio" v-model="repeatOption" value="NO" />
            안함
          </label>
        </div>
      </div>

      <!-- 지도 (추후 구현 가능) -->
      <div>
        <label for="location">위치</label>
        <div id="map" style="width:100%;height:300px;"></div>
      </div>

      <div>
        <label for="content">내용</label>
        <textarea id="content" v-model="content"></textarea>
      </div>

      <button type="submit">저장</button>
      <button type="button" @click="cancelForm">취소</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const props = defineProps({
  selectedDate: String,
});

// 폼 데이터 상태
const title = ref('');
const date = ref(props.selectedDate || '');
const selectedColor = ref('빨'); // 선택된 색깔을 저장할 ref
const colors = ['빨', '주', '노', '초']; // 색깔 리스트
const content = ref('');
const time = ref('');
const repeatOption = ref('NO'); // 반복 옵션
const location = ref('');

// 스케줄 저장 함수
const submitSchedule = async () => {
  const scheduleData = {
    title: title.value,
    date: date.value,
    time: time.value,
    content: content.value,
    repeatOption: repeatOption.value,
    color: selectedColor.value, // 선택한 색깔
    location: location.value,
  };

  try {
    const response = await axios.post(
      'http://localhost:8080/schedule/create',
      scheduleData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    console.log('Schedule Submitted Successfully', response.data);
  } catch (error) {
    console.error('Failed to submit schedule:', error);
  }
};

// 취소 버튼 클릭 시 폼 초기화
const cancelForm = () => {
  title.value = '';
  date.value = props.selectedDate || '';
  selectedColor.value = '빨';
  content.value = '';
  time.value = '';
  repeatOption.value = 'NO';
  location.value = '';
};
</script>

<style scoped>
.schedule-form {
  padding: 20px;
  background-color: white;
  border-radius: 10px;
}

label {
  font-weight: bold;
}

input,
select,
textarea {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  padding: 10px 20px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 5px;
}

button:hover {
  background-color: #555;
}
</style>
