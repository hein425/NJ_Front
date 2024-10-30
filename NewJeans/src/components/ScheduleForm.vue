<template>
  <div class="schedule-form">
    <form @submit.prevent="submitSchedule">
      <div class="form-grid">
        <!-- 제목 -->
        <div class="form-row" style="width: 450px">
          <label for="title">제목</label>
          <input id="title" v-model="title" placeholder="Enter Title" />
        </div>

        <!-- 색깔 선택 (색상 원으로 표시, 라디오 버튼 숨김) -->
        <div class="form-row" style="width: 450px">
          <label>색깔 선택</label>
          <div class="color-options">
            <label v-for="(colorOption, index) in colorList" :key="index" class="color-label">
              <!-- 색상 선택 부분에서만 라디오 버튼 숨김 -->
              <input type="radio" v-model="color" :value="colorOption.value" class="color-radio" />
              <span class="color-circle" :style="{ backgroundColor: colorOption.color }" @click="color = colorOption.value"></span>
            </label>
          </div>
        </div>

        <!-- 시작 날짜, 종료 날짜 -->
        <div class="form-row" style="width: 450px">
          <label for="startdate">시작 날짜</label>
          <input id="startdate" v-model="startdate" type="datetime-local" />
        </div>
        <div class="form-row" style="width: 450px">
          <label for="enddate">종료 날짜</label>
          <input id="enddate" v-model="enddate" type="datetime-local" />
        </div>

        <!-- 반복 설정을 세로로 배치 (라디오 버튼 보이도록) -->
        <div class="form-row" style="width: 450px">
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

        <!-- 카카오 지도 컴포넌트를 Add Note 위에 배치 -->
        <div class="form-row">
          <label for="location">지도</label>
          <KakaoMap />
        </div>

        <!-- 내용 입력 -->
        <div class="form-row" style="width: 450px">
          <div class="icon-label">
            <i class="icon-note"></i>
            <label for="content">메모</label>
          </div>
          <textarea id="content" v-model="description" placeholder="Enter your note" class="input-field textarea-field"></textarea>
        </div>

         <!-- 이미지 업로드 -->
        <div class="form-row" style="width: 450px">
          <label for="image">이미지</label>
          <input id="image" type="file" @change="handleImageUpload" />
        </div> 

        <div class="button-row">
          <!-- 저장 버튼 -->
          <button type="submit" class="submit-button">
            <font-awesome-icon :icon="['fas', 'check']" style="font-size: 24px; color: white" />
          </button>

          <!-- 취소 버튼 -->
          <button type="button" @click="cancelForm" class="cancel-button">
            <font-awesome-icon :icon="['fas', 'times']" style="font-size: 24px; color: white" />
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
import KakaoMap from '@/views/KakaoMap.vue';

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
const imageFiles = ref(null); // 이미지 파일을 저장

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

// 이미지 업로드 핸들러
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    imageFiles.value = file;
  }
};


const submitSchedule = async () => {
  // diaryRequest JSON 객체 생성
  const scheduleRequest = {
    title: title.value,
    color: color.value,
    start: startdate.value,
    end: enddate.value,
    location: location.value,
    content: description.value,
    repeat: repeat.value,
    calendarsIdx: 1,
  };

  // FormData 생성 및 diaryRequest JSON과 이미지 파일 추가
  const formData = new FormData();
  formData.append('scheduleRequest', new Blob([JSON.stringify(scheduleRequest)], {
      type: "application/json"
    })); // JSON 데이터를 문자열로 변환해 추가

  // 이미지 파일이 선택된 경우 FormData에 추가
  if (imageFiles.value) {
    formData.append('imageFiles', imageFiles.value);
  }

  try {
    const response = await axios.post('http://112.222.157.156:10004/schedule/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Schedule Submitted Successfully', response.data);
    emit('closeForm');
  } catch (error) {
    console.error('Failed to submit Schedule:', error);
    emit('closeForm');
  }
};








// const submitSchedule = async () => {
//   const formData = new FormData();
//   formData.append('title', title.value);
//   formData.append('color', color.value);
//   formData.append('start', startdate.value);
//   formData.append('end', enddate.value);
//   formData.append('location', location.value);
//   formData.append('content', description.value);
//   formData.append('repeat', repeat.value);
//   formData.append('calendarsIdx', 1);
  
//   if (imageFiles.value) {
//     formData.append('image', imageFiles.value);
//   }

//   try {
//     const response = await axios.post('http://192.168.0.17:8080/schedule/create', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     console.log('Schedule Submitted Successfully', response.data);
//     emit('closeForm');
//   } catch (error) {
//     console.error('Failed to submit schedule:', error);
//     emit('closeForm');
//   }
// };

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
  margin-top: 100px;
  padding: 50px 0;
  border: 1px solid #ccc;
}

/* 그리드를 1열로 변경 */
.form-grid {
  display: grid;
  grid-template-columns: 1fr; /* 1열로 배치 */
  grid-gap: 20px;
}

.form-row {
  display: flex;
  flex-direction: column;
  margin: 0 auto;
}

.form-row label {
  margin-bottom: 15px;
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
  gap: 20px;
}

.color-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #ccc;
  display: inline-block;
  cursor: pointer;
}

/* 색깔 선택 라디오 버튼만 숨김 */
.color-radio {
  display: none;
}

/* 선택된 색깔 원에 스타일 추가 */
input[type='radio']:checked + .color-circle {
  border: 2px solid black;
}

/* 반복 옵션 스타일 (라디오 버튼 보이게) */
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
