<template>
  <div class="schedule-form">
    <h2>일정 작성</h2>
    <form @submit.prevent="submitSchedule">
      <div class="form-grid">
        <!-- 제목 -->
        <div class="form-row">
          <label for="title">제목</label>
          <input id="title" v-model="title" placeholder="Enter Title" />
        </div>

        <!-- 색깔 선택 (색상 원으로 표시) -->
        <div class="form-row">
          <label>색깔 선택</label>
          <div class="color-options">
            <label v-for="(colorOption, index) in colorList" :key="index">
              <input type="radio" v-model="color" :value="colorOption.value" :style="{ backgroundColor: colorOption.color }" />
              <span class="color-circle" :style="{ backgroundColor: colorOption.color }"></span>
            </label>
          </div>
        </div>

        <!-- 시작 날짜, 종료 날짜 -->
        <div class="form-row">
          <label for="startdate">시작 날짜</label>
          <input id="startdate" v-model="startdate" type="datetime-local" />
        </div>
        <div class="form-row">
          <label for="enddate">종료 날짜</label>
          <input id="enddate" v-model="enddate" type="datetime-local" />
        </div>

        <!-- 반복 설정 -->
        <div class="form-row repeat-row">
          <label>반복</label>
          <div class="repeat-options">
            <label for="yearly" class="radio-label">
              <input id="yearly" type="radio" v-model="repeat" value="YEARLY" />
              매년
            </label>
            <label for="monthly" class="radio-label">
              <input id="monthly" type="radio" v-model="repeat" value="MONTHLY" />
              매월
            </label>
            <label for="none" class="radio-label">
              <input id="none" type="radio" v-model="repeat" value="NONE" />
              안함
            </label>
          </div>
        </div>

        <!-- 장소 입력 -->
        <div class="form-row">
          <label for="location">지도 넣는 곳</label>
          <input id="location" v-model="location" placeholder="Add Place" />
        </div>

        <!-- 내용 입력 -->
        <div class="form-row">
          <div class="icon-label">
            <i class="icon-note"></i>
            <label for="content">Add Note</label>
          </div>
          <textarea id="content" v-model="description" placeholder="Enter your note" class="input-field textarea-field"></textarea>
        </div>

        <!-- 저장 및 취소 버튼 -->
        <div class="button-row">
          <button type="submit" class="submit-button">
            <i class="fas fa-check"></i>
          </button>
          <button type="button" @click="cancelForm" class="cancel-button">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import dayjs from 'dayjs';

const props = defineProps({
  selectedDate: String,
});

const emit = defineEmits(['closeForm']);

const title = ref('');
const color = ref('ORANGE');
const startdate = ref('');
const enddate = ref('');
const location = ref('');
const description = ref('');
const repeat = ref('NONE');

const colorList = [
  { value: 'PINK', color: '#ff7f7f' },
  { value: 'ORANGE', color: '#ff9933' },
  { value: 'YELLOW', color: '#ffe066' },
  { value: 'BLUE', color: '#4da6ff' },
  { value: 'GREEN', color: '#5cd65c' },
  { value: 'VIOLET', color: '#b366ff' },
  { value: 'GRAY', color: '#a6a6a6' },
];

onMounted(() => {
  if (props.selectedDate) {
    startdate.value = dayjs(props.selectedDate).format('YYYY-MM-DDTHH:mm');
  }
});

const submitSchedule = async () => {
  const scheduleData = {
    title: title.value,
    color: color.value,
    start: startdate.value,
    end: enddate.value,
    location: location.value,
    content: description.value,
    repeat: repeat.value,
  };

  try {
    const response = await axios.post('http://localhost:8080/schedule/create', scheduleData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Schedule Submitted Successfully', response.data);
    emit('closeForm');
  } catch (error) {
    console.error('Failed to submit schedule:', error);
  }
};

const cancelForm = () => {
  emit('closeForm');
};
</script>

<style scoped>
.schedule-form {
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  max-width: 600px;
  margin: auto;
  border: 1px solid #ccc;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 20px;
}

.form-row {
  display: flex;
  flex-direction: column;
}

.form-row label {
  margin-bottom: 5px;
  font-weight: bold;
}

input,
select,
textarea {
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

textarea {
  height: 80px;
}

/* 색깔 선택 부분 */
.color-options {
  display: flex;
  gap: 10px;
}

.color-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #ccc;
  display: inline-block;
}

input[type='radio'] {
  margin-right: 5px; /* 라디오 버튼을 보여줍니다. */
}

/* 반복 옵션 스타일 */
.repeat-options {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.icon-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-note {
  font-size: 18px;
  color: #343434;
}

.input-field {
  border: 1px solid #ccc;
  padding: 10px;
  font-size: 14px;
  border-radius: 5px;
}

.textarea-field {
  height: 80px;
  resize: none;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.submit-button,
.cancel-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  font-size: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.submit-button {
  background-color: #343434;
  color: white;
}

.cancel-button {
  background-color: #808080;
  color: white;
}
</style>
