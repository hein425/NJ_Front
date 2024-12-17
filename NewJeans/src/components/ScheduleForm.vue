<template>
  <div class="schedule-form">
    <form @submit.prevent="submitSchedule">
      <!-- 녹음 상태 모달 -->
      <div v-if="isRecording" class="modal-overlay">
        <div class="modal">
          <p>마이크에 입력하고 싶은 음성을 녹음하세요</p>
          <p>녹음 중입니다...🎙️</p>
          <button @click="stopRecording" class="stop-recording-button">녹음 중지</button>
        </div>
      </div>
      <!-- 제목 -->
      <div class="row">
        <label for="title" style="width: 80px; margin-bottom: 5px">제목</label>
        <div class="input-with-buttons">
          <input id="title" v-model="title" placeholder="Enter Title" class="input-field" @input="checkTitleLength" />
          <button type="button" @click="toggleRecordingMenu" class="record-button">음성 텍스트 변환⏺️</button>
        </div>
      </div>

      <!-- 제목 비어있음 경고 모달 -->
      <div v-if="showEmptyTitleModal" class="modal-overlay modal-empty-title">
        <div class="modal">
          <p>제목을 입력해주세요.</p>
          <button @click="closeModal('emptyTitle')" class="close-modal-btn">확인</button>
        </div>
      </div>

      <!-- 제목 글자수 경고 모달 -->
      <div v-if="showTitleLimitModal" class="modal-overlay modal-title-limit">
        <div class="modal">
          <p>제목은 최대 50자까지 입력할 수 있습니다.</p>
          <button @click="closeModal('titleLimit')" class="close-modal-btn">확인</button>
        </div>
      </div>

      <!-- 일정 저장 성공 모달 -->
      <div v-if="showSuccessModal" class="modal-overlay modal-title-success">
        <div class="modal">
          <p>일정이 저장되었습니다.</p>
          <button @click="closeModal('success')" class="close-modal-btn">확인</button>
        </div>
      </div>

      <!-- 언어 선택 및 듣기 버튼 - 기본 숨김 -->

      <div class="language-recording-container" v-if="isRecordingMenuVisible">
        <!-- 닫기 버튼 -->
        <button type="button" class="close-button" @click="closeLanguageRecordingContainer">X</button>
        <!-- 언어 선택 -->
        <div class="row">
          <label style="width: 80px; margin-bottom: 5px">언어 선택</label>
          <div class="language-options">
            <button v-for="(lang, index) in languages" :key="index" :class="{ 'active-lang': selectedLanguage === lang.code }" @click="changeLanguage(lang.code)" type="button">
              {{ lang.name }}
            </button>
          </div>
        </div>
        <button type="button" @click="startRecording('title')" class="play-button">시작하기⏺️</button>
        <button type="button" @click="playText('title')" class="play-button">듣기▶️</button>
      </div>

      <!-- 색깔 선택 -->
      <div class="row">
        <label style="width: 80px; margin-bottom: 5px">색깔 선택</label>
        <div class="color-options">
          <label v-for="(colorOption, index) in colorList" :key="index" class="color-label">
            <input type="radio" v-model="color" :value="colorOption.value" class="color-radio" />
            <span class="color-circle" :style="{ backgroundColor: colorOption.color }" @click="color = colorOption.value"></span>
          </label>
        </div>
      </div>

      <!-- 시작 날짜, 종료 날짜 -->
      <div class="row">
        <label for="startdate" style="width: 80px; margin-bottom: 5px">시작 날짜</label>
        <input id="startdate" v-model="startdate" type="datetime-local" class="input-field" />
      </div>
      <div class="row">
        <label for="enddate" style="width: 80px; margin-bottom: 5px">종료 날짜</label>
        <input id="enddate" v-model="enddate" type="datetime-local" :min="startdate" class="input-field" />
      </div>

      <!-- 반복 설정 -->
      <div class="row">
        <label style="width: 80px; margin-bottom: 5px">반복</label>
        <div class="repeat-options">
          <label for="yearly" class="radio-label">
            <input id="yearly" type="radio" v-model="repeatType" value="YEARLY" />
            매년
          </label>
          <label for="monthly" class="radio-label">
            <input id="monthly" type="radio" v-model="repeatType" value="MONTHLY" />
            매월
          </label>
          <label for="weekly" class="radio-label">
            <input id="weekly" type="radio" v-model="repeatType" value="WEEKLY" />
            매주
          </label>
          <label for="daily" class="radio-label">
            <input id="daily" type="radio" v-model="repeatType" value="DAILY" />
            매일
          </label>
          <label for="none" class="radio-label">
            <input id="none" type="radio" v-model="repeatType" value="NONE" />
            안함
          </label>
        </div>
      </div>

      <div class="row" v-if="repeatType !== 'NONE'">
        <label for="repeatEndDate" style="width: 80px; margin-bottom: 5px">반복 종료</label>
        <input id="repeatEndDate" v-model="repeatEndDate" type="date" class="input-field" />
      </div>

      <!-- 지도 -->
      <div class="row">
        <label for="location" style="width: 80px; margin-bottom: 5px">지도</label>
        <div class="map-container">
          <KakaoMap @updateLocation="updateLocation" />
        </div>
      </div>

      <!-- 내용입력 -->
      <div class="row">
        <label for="content" style="width: 80px; margin-bottom: 5px">메모</label>
        <div class="input-with-buttons">
          <textarea id="content" v-model="description" placeholder="Enter your note" class="input-field textarea-field"></textarea>
          <button type="button" @click="toggleMemoRecordingMenu" class="record-button">음성 텍스트 변환⏺️</button>
        </div>
      </div>

      <!-- 메모 언어 선택 및 듣기 버튼 - 기본 숨김 -->
      <div class="language-recording-container-memo" v-if="isMemoRecordingMenuVisible">
        <!-- 닫기 버튼 -->
        <button type="button" class="close-button" @click="closeMemoLanguageRecordingContainer">X</button>
        <!-- 언어 선택 -->
        <div class="row">
          <label style="width: 80px; margin-bottom: 5px">언어 선택</label>
          <div class="language-options">
            <button v-for="(lang, index) in languages" :key="index" :class="{ 'active-lang': selectedLanguage === lang.code }" @click="changeLanguage(lang.code)" type="button">
              {{ lang.name }}
            </button>
          </div>
        </div>
        <button type="button" @click="startRecording('description')" class="play-button">시작하기⏺️</button>
        <button type="button" @click="playText('description')" class="play-button">듣기▶️</button>
      </div>

      <!-- 이미지 업로드 -->
      <div class="row">
        <label for="image" style="width: 80px; margin-bottom: 5px">이미지</label>
        <input id="image" type="file" @change="handleImageUpload" multiple class="input-field" />
      </div>

      <div class="image-preview">
        <div v-for="(image, index) in images" :key="index" class="image-container">
          <img :src="image.url" alt="Preview" />
          <button class="delete-btn" type="button" @click.stop.prevent="removeImage(index)">X</button>
        </div>
      </div>

      <!-- 버튼 -->
      <div class="button-row">
        <button type="submit" class="submit-button">
          <font-awesome-icon :icon="['fas', 'check']" style="font-size: 24px; color: white" />
        </button>
        <button type="button" @click="cancelForm" class="cancel-button">
          <font-awesome-icon :icon="['fas', 'times']" style="font-size: 24px; color: white" />
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import dayjs from 'dayjs';
import KakaoMap from '@/views/KakaoMap.vue';
import { BASE_URL } from '@/config';
import { useAuthStore } from '@/stores/authStore';

const props = defineProps({
  selectedDate: String,
});
const emit = defineEmits(['closeForm']);

const authStore = useAuthStore();

const title = ref('');
const showTitleLimitModal = ref(false);
const showEmptyTitleModal = ref(false);
const showSuccessModal = ref(false);

const color = ref('ORANGE');
const startdate = ref('');
const enddate = ref('');
const location = ref('');
const description = ref('');
const repeatType = ref('NONE');
const repeatEndDate = ref(''); // 반복 종료 날짜를 추가
const images = ref([]); // 이미지 파일을 저장
const calendarIdx = ref(authStore.calendarIdx);
const isRecording = ref(false); // 녹음 상태
const recordingField = ref(null); // 현재 녹음 중인 필드 ('title' 또는 'description')
let recognition = null; // SpeechRecognition 객체 초기화
const selectedLanguage = ref('ko-KR'); // 기본 언어: 한국어

const isRecordingMenuVisible = ref(false);
const isMemoRecordingMenuVisible = ref(false); // 메모 녹음 메뉴 상태

// 메모 메뉴 토글
const toggleMemoRecordingMenu = () => {
  isMemoRecordingMenuVisible.value = !isMemoRecordingMenuVisible.value;
};

// 메모 언어 선택 및 듣기 버튼 컨테이너 닫기
const closeMemoLanguageRecordingContainer = () => {
  isMemoRecordingMenuVisible.value = false;
};

const closeLanguageRecordingContainer = () => {
  isRecordingMenuVisible.value = false; // 메뉴 닫기
};

// 메뉴 토글 함수
const toggleRecordingMenu = () => {
  isRecordingMenuVisible.value = !isRecordingMenuVisible.value;
};

// 지원 언어 목록
const languages = ref([
  { name: '한국어', code: 'ko-KR' },
  { name: '영어', code: 'en-US' },
  { name: '일본어', code: 'ja-JP' },
  { name: '중국어', code: 'zh-CN' },
]);

// 녹음 시작
const startRecording = field => {
  if (isRecording.value) {
    alert('이미 녹음 중입니다.');
    return;
  }

  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
    alert('Web Speech API를 지원하지 않는 브라우저입니다.');
    return;
  }

  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = selectedLanguage.value;

  isRecording.value = true;
  recordingField.value = field;

  recognition.onresult = event => {
    const transcript = Array.from(event.results)
      .map(result => result[0].transcript)
      .join('');
    if (field === 'title') {
      title.value += transcript;
    } else if (field === 'description') {
      description.value += transcript;
    }
  };

  recognition.onend = () => {
    isRecording.value = false;
    recordingField.value = null;
  };

  recognition.onerror = error => {
    console.error('SpeechRecognition Error:', error);
    isRecording.value = false;
    recordingField.value = null;
  };

  recognition.start();
};

// 녹음 중지
const stopRecording = () => {
  if (!isRecording.value || !recognition) {
    alert('녹음 중이 아닙니다.');
    return;
  }

  recognition.stop();
  isRecording.value = false;
  recordingField.value = null;
};

// 텍스트 읽기
const playText = field => {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance();

  utterance.lang = selectedLanguage.value;
  utterance.text = field === 'title' ? title.value : description.value;

  synth.speak(utterance);
};

// 언어 변경
const changeLanguage = langCode => {
  selectedLanguage.value = langCode;
};

const colorList = [
  { value: 'PINK', color: '#ff7f7f' },
  { value: 'ORANGE', color: '#ff9933' },
  { value: 'YELLOW', color: '#ffe066' },
  { value: 'BLUE', color: '#4da6ff' },
  { value: 'GREEN', color: '#5cd65c' },
  { value: 'VIOLET', color: '#b366ff' },
  { value: 'GRAY', color: '#a6a6a6' },
];

const updateLocation = coords => {
  console.log('부모 컴포넌트에서 받은 좌표:', coords);
  location.value = `${coords.lat}, ${coords.lng}`; // 위치를 위도, 경도로 저장
  console.log('위치 업데이트:', location.value);
};

onMounted(() => {
  if (props.selectedDate) {
    startdate.value = dayjs(props.selectedDate).format('YYYY-MM-DDTHH:mm');
  }
});

// 이미지 업로드 핸들러
const handleImageUpload = event => {
  const files = Array.from(event.target.files); // 선택한 모든 파일을 배열로 변환
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      images.value.push({ file, url: e.target.result }); // 이미지 파일과 URL을 모두 추가
    };
    reader.readAsDataURL(file);
  });
  event.target.value = ''; // 입력 초기화
};

// 제목 길이 확인 함수
const checkTitleLength = () => {
  if (title.value.length > 50) {
    title.value = title.value.slice(0, 50); // 최대 50자까지 자르기
    showTitleLimitModal.value = true; // 모달 표시
  }
};

// 모달 닫기 함수
// 모달 닫기 함수
const closeModal = modalName => {
  if (modalName === 'emptyTitle') showEmptyTitleModal.value = false;
  if (modalName === 'titleLimit') showTitleLimitModal.value = false;
  if (modalName === 'success') {
    showSuccessModal.value = false;
    emit('closeForm');
  }
};
const submitSchedule = async () => {
  //제목없으면 얼럿 띄우고 중단
  if (!title.value.trim()) {
    showEmptyTitleModal.value = true;
    return;
  }

  // scheduleRequest JSON 객체 생성
  const scheduleRequest = {
    title: title.value,
    color: color.value,
    start: startdate.value,
    end: enddate.value,
    location: location.value,
    content: description.value,
    calendarIdx: calendarIdx.value,
    repeatType: repeatType.value,
    repeatEndDate: repeatEndDate.value || null, // 반복 종료 날짜 추가
  };

  // FormData 생성 및 diaryRequest JSON과 이미지 파일 추가
  const formData = new FormData();
  formData.append(
    'scheduleRequest',
    new Blob([JSON.stringify(scheduleRequest)], {
      type: 'application/json',
    }),
  ); // JSON 데이터를 문자열로 변환해 추가

  // 이미지 파일이 선택된 경우 FormData에 추가
  if (images.value.length > 0) {
    images.value.forEach(image => {
      formData.append('imageFiles', image.file); // 이미지 파일 추가
    });
  } else {
    formData.append('imageFiles', new Blob([], { type: 'application/octet-stream' })); // 빈 Blob 추가
  }

  try {
    const response = await axios.post(`${BASE_URL}/schedule/create`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Schedule Submitted Successfully', response.data);

    // 일정 저장 성공 모달 표시
    showSuccessModal.value = true;
  } catch (error) {
    console.error('Failed to submit Schedule:', error);
    emit('closeForm');
  }
};

const cancelForm = () => {
  emit('closeForm');
};

// 시작일 정하면 자동으로 종료일은 같은날 1시간후로.
watch(startdate, newStartDate => {
  if (newStartDate) {
    const newEndDate = dayjs(newStartDate).add(1, 'hour').format('YYYY-MM-DDTHH:mm');
    enddate.value = newEndDate;
  }
});

const removeImage = index => {
  images.value.splice(index, 1); // 선택한 이미지를 배열에서 제거
};
</script>
<style scoped>
.schedule-form {
  border: 1px solid #ccc;
  margin-top: 10vh;
  padding: 20px;
  border-radius: 10px;
  height: auto;
}

.row {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #ccc;
  padding: 10px 0;
  font-weight: bold;
}

.color-options {
  align-items: center;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.color-label input:checked + .color-circle {
  border: 3px solid #000; /* 선택 시 검정색 테두리를 추가 */
  box-shadow: 0 0 5px 2px rgba(0, 0, 0, 0.3); /* 약간의 그림자 효과 추가 */
}

.color-circle {
  margin-top: 10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #ccc;
  display: inline-block;
  cursor: pointer;
  box-sizing: border-box; /* 테두리가 요소의 크기를 변경하지 않도록 */
  transition:
    border 0.3s ease,
    box-shadow 0.3s ease; /* 애니메이션 추가 */
}

.color-radio {
  display: none;
}

input,
select,
textarea {
  border: none;
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  font-size: 1rem;
}

.textarea-field {
  height: 220px;
  resize: none;
}

.repeat-options {
  justify-content: center;
  display: flex;
  flex-direction: row;
  gap: 20px;
  flex-wrap: nowrap; /* 줄바꿈 방지 */
}

.radio-label {
  display: flex;
  align-items: center; /* 라디오 버튼과 텍스트를 한 줄로 정렬 */
  gap: 5px;
  white-space: nowrap; /* 얘도 줄바꿈 방지 */
}

.image-preview {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
}

.image-container {
  margin: 5px;
  position: relative;
}

.image-container img {
  width: 100px;
  height: 100px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
  margin-bottom: 10px;
}

.submit-button,
.cancel-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.submit-button {
  background-color: #343434;
  color: white;
}

/* .map-container{
  display: flex;
  justify-content: center;
  width: 100%;
} */

.cancel-button {
  background-color: #808080;
  color: white;
}

.delete-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: red;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.schedule-form {
  border: 1px solid #ccc;
  margin-top: 10vh;
  padding: 25px;
  border-radius: 10px;
  background-color: #ffffff;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.row {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #e6e6e6;
  padding: 15px 0;
  font-weight: bold;
  font-size: 1.1rem;
}

.color-options {
  display: flex;
  gap: 15px;
  justify-content: center;
  align-items: center;
}

.color-label input:checked + .color-circle {
  border: 3px solid #555555;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

.color-circle {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  border: 1px solid #dddddd;
  display: inline-block;
  cursor: pointer;
  box-sizing: border-box;
  transition:
    border 0.3s ease,
    box-shadow 0.3s ease;
}

.color-radio {
  display: none;
}

input,
select,
textarea {
  border: 1px solid #ccc;
  padding: 12px;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #2196f3;
}

.textarea-field {
  height: 180px;
  resize: none;
}

.repeat-options {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 1rem;
  color: #555;
  cursor: pointer;
}

input[type='radio'] {
  appearance: none;
  width: px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #bbb;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

input[type='radio']:checked {
  border-color: #2196f3;
  background-color: #2196f3;
}

.input-field {
  font-size: 1.05rem;
  color: #333;
  padding: 10px 12px; /* 양쪽 패딩을 추가하여 입력 필드 안의 텍스트 위치를 조정 */
  margin: 0 5px; /* 외부 마진을 적용하여 양쪽 밸런스를 맞추기 */
  width: calc(100% - 34px); /* 좌우 패딩과 마진을 포함하여 전체 넓이에 맞추기 */
}

.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.image-container {
  position: relative;
}

.image-container img {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.submit-button,
.cancel-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: none;
  font-size: 24px;
}

.delete-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

/* 파일 선택 버튼 스타일 */
input[type='file'] {
  display: none;
}

label[for='image'] {
  display: inline-block;
  padding: 10px 20px;
  background-color: #222222;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
  text-align: center;
}

label[for='image']:hover {
  background-color: #525151;
}

/* 음성 텍스트 변환 버튼 */
.record-button {
  padding: 10px 15px;
  border: 1px solid #2196f3;
  border-radius: 5px;
  background-color: white;
  color: #2196f3;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.record-button:hover {
  background-color: #2196f3;
  color: white;
}

/* 듣기 버튼 */
.play-button {
  padding: 10px 15px;
  font-size: 16px;
  border: 1px solid #2196f3;
  border-radius: 5px;
  background-color: white;
  color: #2196f3;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.play-button:hover {
  background-color: #2196f3;
  color: white;
}

/* 언어 선택 버튼 */
.language-options {
  display: flex;
  gap: 10px;
}

.language-options button {
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  background-color: #fff;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.language-options button.active-lang {
  background-color: #2196f3;
  color: white;
  font-weight: bold;
}

.language-options button:hover {
  background-color: #f0f0f0;
}

/* 언어 선택 및 듣기 버튼 컨테이너 */
.language-recording-container {
  position: absolute;
  top: 0%;
  left: 430px;
  width: 310px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  z-index: 1000;
  animation: slideIn 0.3s ease-in-out;
}
.language-recording-container-memo {
  position: absolute;
  top: 115%;
  left: 430px;
  width: 300px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  z-index: 1000;
  animation: slideIn 0.3s ease-in-out;
}

/* 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* background-color: rgba(0, 0, 0, 0.5); */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.3s ease-in-out;
}

.modal p {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 20px;
}

.close-modal-btn {
  background-color: #333;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.close-modal-btn:hover {
  background-color: #5c5c5c;
}

/* 개별 모달 위치 */
.modal-empty-title {
  top: 35%;
}

.modal-title-limit {
  top: -20%;
}

.stop-recording-button {
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.stop-recording-button:hover {
  background-color: #d32f2f;
}

/* 슬라이드 애니메이션 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 페이드 인 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 닫기 버튼 */
.language-recording-container .close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: transparent;
  border: none;
  font-size: 16px;
  color: #ff4d4d;
  cursor: pointer;
  transition: color 0.3s ease;
}

.language-recording-container .close-button:hover {
  color: #d32f2f;
}
</style>
