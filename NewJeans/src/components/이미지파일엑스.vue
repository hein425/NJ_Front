<template>
    <div>
      <h2>이미지 수정 화면</h2>
      <div id="image-list">
        <!-- 이미지 리스트 -->
        <div v-for="(image, index) in images" :key="index" class="image-container">
          <img :src="image.url" alt="Preview" />
          <button class="delete-btn" @click="removeImage(index, image.url)">X</button>
        </div>
      </div>
  
      <!-- 이미지 업로드 -->
      <input type="file" @change="onFileChange" multiple accept="image/*" />
    </div>
  </template>
  
  <script>
  import axios from "axios"; // axios를 사용하여 HTTP 요청을 보냅니다.
  
  export default {
    data() {
      return {
        images: [], // 이미지 리스트
      };
    },
    methods: {
      // 파일 입력이 변경되면 이미지 리스트에 추가
      onFileChange(event) {
        const files = event.target.files;
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const reader = new FileReader();
  
          reader.onload = (e) => {
            this.images.push({ url: e.target.result });
          };
  
          reader.readAsDataURL(file);
        }
        event.target.value = ""; // 입력 초기화
      },
      // 이미지 제거 함수
      async removeImage(index, imageUrl) {
        try {
          // 서버로 이미지 삭제 요청을 보냅니다.
          await axios.post("http://localhost:8080/api/deleteImage", { imageUrl });
          
          // 요청이 성공하면 이미지 리스트에서 제거합니다.
          this.images.splice(index, 1);
        } catch (error) {
          console.error("Failed to delete image:", error);
          alert("이미지를 삭제하는 데 실패했습니다.");
        }
      },
    },
  };

  // watchEffect(async () => {
  // if (props.selectedDate) {
  //   await fetchDayData(props.selectedDate);
  // }});

  </script>
  
  <style scoped>
  .image-container {
    position: relative;
    display: inline-block;
    margin: 10px;
  }
  .image-container img {
    width: 100px;
    height: 100px;
    border: 1px solid #ddd;
    border-radius: 8px;
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
  }
  </style>

import { ref, onMounted, watch, watchEffect } from 'vue';
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
const editIndex = ref(null); // 현재 수정 중인 항목 인덱스
const editData = ref({ title: '', content: '', address: '', time: '', repeat: '' });
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
      time: schedule.start ? `${schedule.start} - ${schedule.end}` : '',
      repeat: schedule.repeat || 'N/A',
      address: schedule.location || 'No address provided',
      content: schedule.content || 'No details provided',
    }));

    isScheduleExpanded.value = schedules.value.map(() => false);

    const diaryResponse = await axios.get(`${BASE_URL}/diary/${idx}/${year}/${month}/${day}`);
    diaries.value = diaryResponse.data.map(diary => ({
      ...diary,
      id: diary.idx,
      date: `${year}.${month}.${day}`,
      content: diary.content || 'No content available',
      category: diary.category || 'Uncategorized',
    }));

    isDiaryExpanded.value = diaries.value.map(() => false);
  } catch (error) {
    console.error('데이터 조회 실패:', error);
  }
};

const toggleScheduleExpand = index => {
  if (editIndex.value === index) return; // 수정 중일 때 닫기 방지
  isScheduleExpanded.value[index] = !isScheduleExpanded.value[index];
};

const toggleDiaryExpand = index => {
  if (editIndex.value === index) return; // 수정 중일 때 닫기 방지
  isDiaryExpanded.value[index] = !isDiaryExpanded.value[index];
};

const startEdit = (type, index) => {
  editIndex.value = index;
  editData.value = type === 'schedule' ? { ...schedules.value[index] } : { ...diaries.value[index] };
};

const saveEdit = async (type, index) => {
  const dataToUpdate = type === 'schedule' ? schedules.value[index] : diaries.value[index];
  const id = dataToUpdate.id; // 수정할 항목의 ID

  try {
    // API 요청: 일정 또는 일기에 따라 URL을 결정
    await axios.post(`${BASE_URL}/${type === 'schedule' ? 'schedule' : 'diary'}/update/${id}`, editData.value);

    // 서버에서 응답받은 데이터를 UI에 반영
    Object.assign(dataToUpdate, editData.value); // 수정된 데이터로 업데이트
    console.log(`${type} data saved to DB:`, dataToUpdate);
  } catch (error) {
    console.error(`Failed to save ${type} data:`, error);
  } finally {
    editIndex.value = null; // 수정 완료 후 편집 모드 종료
  }
};

const deleteSchedule = async index => {
  const scheduleId = schedules.value[index].id;
  try {
    await axios.delete(`${BASE_URL}/schedule/${scheduleId}`);
    schedules.value.splice(index, 1);
    console.log('Schedule deleted successfully');
  } catch (error) {
    console.error('Failed to delete schedule:', error);
  }
};

const deleteDiary = async index => {
  const diaryId = diaries.value[index].id;
  if (!diaryId) {
    console.error('Failed to delete diary: diaryId is undefined');
    return;
  }
  try {
    await axios.delete(`${BASE_URL}/diary/delete/${diaryId}`);
    diaries.value.splice(index, 1);
    console.log('Diary deleted successfully');
  } catch (error) {
    console.error('Failed to delete diary:', error);
  }
};

onMounted(fetchDayData);
