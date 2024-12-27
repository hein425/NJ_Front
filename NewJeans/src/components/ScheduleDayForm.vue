<template>
  <div>
    <!-- 일정 및 일기 조회 섹션 -->
    <div class="day-form" v-if="showDayView">
      <!-- 스케줄 섹션 -->
      <div class="schedule-section">
        <div v-if="schedules.length > 0">
          <div v-for="(schedule, index) in schedules" :key="index" class="schedule-item" :style="{ borderColor: schedule.color }" @click="toggleScheduleExpand(index)">
            <div class="title-container">
              <h4 v-if="scheduleEditIndex !== index">{{ schedule.title }}</h4>
              <input v-else v-model="editData.title" class="input-field" placeholder="Enter Title" @click.stop />
              <p class="date">{{ schedule.date }}</p>
            </div>

            <transition name="slide-fade">
              <div v-show="isScheduleExpanded[index]" class="expanded-content">
                <hr class="divider" />

                <div class="form-row" style="width: 450px">
                  <p v-if="scheduleEditIndex !== index"><strong>시작 시간:</strong> {{ formatDateTime(schedule.start) }}</p>
                  <input v-else v-model="editData.start" class="input-field" type="datetime-local" placeholder="Start Time" @click.stop />
                </div>
                <div class="form-row" style="width: 450px">
                  <p v-if="scheduleEditIndex !== index"><strong>종료 시간:</strong> {{ formatDateTime(schedule.end) }}</p>
                  <input v-else v-model="editData.end" class="input-field" type="datetime-local" placeholder="End Time" @click.stop />
                </div>

                <p v-if="scheduleEditIndex !== index"><strong>반복: </strong> {{ repeatTypeKorean(schedule.repeatType) }}</p>

                <div v-if="scheduleEditIndex === index">
                  <div class="form-row" style="width: 450px">
                    <label>반복</label>
                    <div class="repeat-options">
                      <label for="yearly" class="radio-label">
                        <input id="yearly" type="radio" v-model="editData.repeatType" value="YEARLY" />
                        매년
                      </label>
                      <label for="monthly" class="radio-label">
                        <input id="monthly" type="radio" v-model="editData.repeatType" value="MONTHLY" />
                        매월
                      </label>
                      <label for="weekly" class="radio-label">
                        <input id="weekly" type="radio" v-model="editData.repeatType" value="WEEKLY" />
                        매주
                      </label>
                      <label for="daily" class="radio-label">
                        <input id="daily" type="radio" v-model="editData.repeatType" value="DAILY" />
                        매일
                      </label>
                      <label for="none" class="radio-label">
                        <input id="none" type="radio" v-model="editData.repeatType" value="NONE" />
                        안함
                      </label>
                    </div>
                  </div>

                  <div class="form-row" v-if="editData.repeatType !== 'NONE'" style="width: 450px">
                    <label for="repeatEndDate">반복 종료 날짜</label>
                    <input id="repeatEndDate" v-model="editData.repeatEndDate" type="date" />
                  </div>
                </div>

                <hr class="divider" />
                <p v-if="scheduleEditIndex !== index">{{ schedule.content }}</p>
                <textarea v-else v-model="editData.content" class="input-field textarea-field" placeholder="Enter Content" @click.stop></textarea>

                <hr class="divider" />
                <p v-show="scheduleEditIndex !== index"><strong>Address:</strong></p>

                <!-- 기존 맵: 데이터가 없을 때 지도 표시하지 않도록 조건 추가 -->
                <div v-if="isScheduleExpanded[index] && scheduleEditIndex !== index && schedule.latitude && schedule.longitude" class="map-container">
                  <KakaoMapView :latitude="schedule.latitude" :longitude="schedule.longitude" :key="schedule.id" />
                </div>

                <!-- 수정 모드에서는 KakaoMap 컴포넌트를 그대로 유지 -->
                <div v-if="scheduleEditIndex === index" class="map-edit-section">
                  <KakaoMap @updateLocation="updateLocation" :latitude="editData.latitude" :longitude="editData.longitude" />
                </div>

                <!-- 이미지 관리 섹션 -->
                <div v-if="scheduleEditIndex === index" class="schedule-images">
                  <div v-for="(imageUrl, imgIndex) in editData.images" :key="imgIndex" class="image-container">
                    <img :src="isNewImage(imageUrl) ? imageUrl : `${BASE_URL}${imageUrl}`" alt="Schedule Image" style="width: 150px; margin: 5px" />
                    <button class="delete-btn" @click.stop="removeScheduleImage(imgIndex, imageUrl)">X</button>
                  </div>
                  <input type="file" @change="onScheduleFileChange" multiple accept="image/*" />
                </div>

                <div v-else class="schedule-images">
                  <div v-for="(imageUrl, imgIndex) in schedule.images" :key="imgIndex" class="image-container">
                    <img :src="`${BASE_URL}${imageUrl}`" alt="Schedule Image" style="width: 150px; margin: 5px" />
                  </div>
                </div>

                <div class="button-group">
                  <button @click.stop="startEdit('schedule', index)" v-if="scheduleEditIndex !== index">Edit</button>
                  <button @click.stop="openDeleteModal(index)" v-if="scheduleEditIndex !== index">Delete</button>

                  <div v-if="scheduleEditIndex === index">
                    <button @click.stop="saveScheduleEdit('schedule', index)">Save</button>
                    <button @click.stop="cancelEdit('schedule')">Cancel</button>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
        <div v-else>
          <p class="no-DS-message">해당 날짜에 등록된 일정이 없습니다.</p>
        </div>
      </div>

      <!-- 반복 일정 삭제 옵션 모달 -->
      <div v-if="showRepeatDeleteModal" class="modal-overlay" @click.self="closeRepeatDeleteModal">
        <div class="modal-content">
          <h3>삭제 옵션 선택</h3>
          <p>삭제할 방식을 선택해주세요:</p>
          <div class="delete-options">
            <button @click="confirmDelete('deleteOnlyThis')">현재 일정만 삭제</button>
            <button @click="confirmDelete('deleteAllRepeats')">모든 반복 일정 삭제</button>
            <button @click="confirmDelete('deleteAfter')">이후 반복 일정 삭제</button>
          </div>
          <button class="close-btn" @click="closeRepeatDeleteModal">취소</button>
        </div>
      </div>

      <!-- 일반 일정 삭제 확인 모달 -->
      <div v-if="showSingleDeleteModal" class="modal-overlay" @click.self="closeSingleDeleteModal">
        <div class="modal-content">
          <h3>일정 삭제</h3>
          <p>이 일정을 삭제하시겠습니까?</p>
          <div class="delete-options">
            <button @click="confirmSingleDelete('deleteOnlyThis')">삭제</button>
            <button @click="closeSingleDeleteModal">취소</button>
          </div>
        </div>
      </div>

      <!-- 다이어리 삭제 확인 모달 -->
      <div v-if="showDiaryDeleteModal" class="modal-overlay">
        <div class="modal-content">
          <h3>삭제하시겠습니까?</h3>
          <div class="modal-buttons">
            <button @click="confirmDeleteDiary">확인</button>
            <button @click="closeDeleteDiaryModal">취소</button>
          </div>
        </div>
      </div>

      <!--  수정 성공 모달 -->
      <BaseModal :visible="showSuccessModal" :message="'수정이 완료되었습니다.'" @close="() => closeModal('success')" class="modal-edit-success" />

      <!-- 다이어리 섹션 -->
      <div class="diary-section">
        <div v-if="diaries.length > 0">
          <div v-for="(diary, index) in diaries" :key="index" class="diary-item" @click="toggleDiaryExpand(index)">
            <div class="title-container">
              <h4 v-if="diaryEditIndex !== index">{{ diary.title }}</h4>
              <input v-else v-model="editData.title" class="input-field" placeholder="Enter Title" @click.stop />
              <p class="category">{{ categoryKorean(diary.category) }}</p>
            </div>

            <transition name="slide-fade">
              <div v-show="isDiaryExpanded[index]" class="expanded-content">
                <hr class="divider" />
                <p v-if="diaryEditIndex !== index"><strong>Date:</strong> {{ diary.date }}</p>
                <input v-else v-model="editData.date" class="input-field" placeholder="Enter Date" type="date" @click.stop />
                <hr class="divider" />
                <p v-if="diaryEditIndex !== index">{{ diary.content }}</p>
                <textarea v-else v-model="editData.content" class="input-field textarea-field" placeholder="Enter Content" @click.stop></textarea>

                <!-- 이미지 관리 섹션 -->
                <div v-if="diaryEditIndex === index" class="diary-images">
                  <div v-for="(imageUrl, imgIndex) in editData.images" :key="imgIndex" class="image-container">
                    <img :src="isNewImage(imageUrl) ? imageUrl : `${BASE_URL}${imageUrl}`" alt="Diary Image" style="width: 150px; margin: 5px" />
                    <button class="delete-btn" @click.stop="removeImage(imgIndex, imageUrl)">X</button>
                  </div>
                  <input type="file" @change="onFileChange" multiple accept="image/*" />
                </div>

                <div v-else class="diary-images">
                  <div v-for="(imageUrl, imgIndex) in diary.images" :key="imgIndex" class="image-container">
                    <img :src="`${BASE_URL}${imageUrl}`" alt="Diary Image" style="width: 150px; margin: 5px" />
                  </div>
                </div>
                <div class="button-group">
                  <button @click.stop="startEdit('diary', index)" v-if="diaryEditIndex !== index">Edit</button>
                  <button @click.stop="openDeleteDiaryModal(index)">Delete</button>

                  <div v-if="diaryEditIndex === index">
                    <button @click.stop="saveDiaryEdit('diary', index)">Save</button>
                    <button @click.stop="cancelEdit('diary')">Cancel</button>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
        <div v-else>
          <p class="no-DS-message">해당 날짜에 작성된 일기가 없습니다.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import axios from 'axios';
import KakaoMapView from '@/views/KakaoMapView.vue';
import KakaoMap from '@/views/KakaoMap.vue';
import { BASE_URL } from '@/config';
import { useAuthStore } from '@/stores/authStore';
import BaseModal from './BaseModal.vue';

const props = defineProps({
  selectedDate: String,
});

const schedules = ref([]);
const diaries = ref([]);
const isScheduleExpanded = ref([]);
const isDiaryExpanded = ref([]);
// const editIndex = ref(null);
const editData = ref({ title: '', content: '', address: '', start: '', end: '', repeatType: '', repeatEndDate: '', images: [] });
const showDayView = ref(true);
const scheduleEditIndex = ref(null); // 일정 편집 상태 인덱스
const diaryEditIndex = ref(null); // 일기 편집 상태 인덱스

// let pollingInterval = null;

const authStore = useAuthStore();

// 모달 관련 상태
const showRepeatDeleteModal = ref(false);
const showSingleDeleteModal = ref(false);
const showSuccessModal = ref(false);
const deleteIndex = ref(null);
const isRepeatSchedule = ref(false); // 반복 일정 여부 상태

const diaryToDeleteIndex = ref(null); // 다이어리 삭제 모달
const showDiaryDeleteModal = ref(false);

const closeModal = modalName => {
  if (modalName === 'success') {
    showSuccessModal.value = false;
  }
};

// 매핑된 한글 반복 타입을 반환하는 함수
const repeatTypeKorean = repeatType => repeatTypeKoreanMap[repeatType] || '반복 없음';

const categoryKorean = category => categoryKoreanMap[category];

// 반복 타입에 대한 한글 매핑 정의
const repeatTypeKoreanMap = {
  YEARLY: '매년',
  MONTHLY: '매월',
  WEEKLY: '매주',
  DAILY: '매일',
  NONE: '없음',
};

const categoryKoreanMap = {
  DAILY: '일기',
  GROWTH: '성장일지',
  EXERCISE: '운동',
  TRIP: '여행',
  ETC: '기타',
};

const isMapVisible = ref(false);

const fetchDayData = async selectedDate => {
  const previousExpandedStates = {
    schedules: [...isScheduleExpanded.value],
    diaries: [...isDiaryExpanded.value],
  };

  const [year, month, day] = selectedDate.split('-');
  const calendarIdx = ref(authStore.calendarIdx);

  try {
    const scheduleResponse = await axios.get(`${BASE_URL}/schedule/${calendarIdx.value}/${year}/${month}/${day}`);

    schedules.value = scheduleResponse.data.map(schedule => {
      const hasValidLocation = schedule.location && schedule.location.includes(',');

      if (!hasValidLocation) {
        console.warn(`스케줄(${schedule.idx})에 유효한 지도 데이터가 없습니다.`);
      }

      return {
        ...schedule,
        id: schedule.idx,
        mapUrl: schedule.mapUrl || null,
        start: schedule.start,
        end: schedule.end,
        repeatType: schedule.repeatType || '없음',
        repeatEndDate: schedule.repeatEndDate || null,
        latitude: hasValidLocation ? parseFloat(schedule.location.split(',')[0]) : null,
        longitude: hasValidLocation ? parseFloat(schedule.location.split(',')[1]) : null,
        content: schedule.content || 'No details provided',
        images: schedule.images || [],
      };
    });

    isScheduleExpanded.value = schedules.value.map((_, index) => previousExpandedStates.schedules[index] || false);

    const diaryResponse = await axios.get(`${BASE_URL}/diary/${calendarIdx.value}/${year}/${month}/${day}`);
    diaries.value = diaryResponse.data.map(diary => ({
      ...diary,
      id: diary.idx,
      date: `${year}-${month}-${day}`,
      content: diary.content || 'No content available',
      category: diary.category || 'Uncategorized',
      images: diary.images || [],
    }));

    isDiaryExpanded.value = diaries.value.map((_, index) => previousExpandedStates.diaries[index] || false);
  } catch (error) {
    console.error('데이터 조회 실패:', error);
  }
};

const startPolling = async selectedDate => {
  const res = await fetchDayData(selectedDate);
  console.log(res);
  // pollingInterval = setInterval(() => {
  //   fetchDayData(selectedDate);
  // }, 1100);
};

// const stopPolling = () => {
//   if (pollingInterval) {
//     clearInterval(pollingInterval);
//   }
// };

// onMounted(() => {
//   if (props.selectedDate) {
//     startPolling(props.selectedDate);
//   }
// });

// onUnmounted(() => {
//   stopPolling();
// });

// watch(
//   () => props.selectedDate,
//   newDate => {
//     stopPolling();
//     if (newDate) {
//       startPolling(newDate);
//     }
//   },
//   { immediate: true },
// );

const toggleScheduleExpand = index => {
  if (scheduleEditIndex.value === index) return;
  isScheduleExpanded.value[index] = !isScheduleExpanded.value[index];
};

const toggleDiaryExpand = index => {
  if (diaryEditIndex.value === index) return;
  isDiaryExpanded.value[index] = !isDiaryExpanded.value[index];
};

// 수정 모드 시작
const startEdit = (type, index) => {
  if (type === 'schedule') {
    scheduleEditIndex.value = index; // 일정 편집 상태 설정
    editData.value = { ...schedules.value[index] }; // 편집 데이터 복사

    // 🔄 카카오맵 관련 데이터 설정
    editData.value.latitude = schedules.value[index].latitude || 37.5665; // 기본값
    editData.value.longitude = schedules.value[index].longitude || 126.978;

    isMapVisible.value = true; // 🔄 지도 표시
  } else if (type === 'diary') {
    diaryEditIndex.value = index; // 일기 편집 상태 설정
    editData.value = { ...diaries.value[index] }; // 편집 데이터 복사
    isMapVisible.value = false; // 🔄 지도 숨김 (일기에는 필요 없음)
  }
};

const saveDiaryEdit = async (type, index) => {
  if (type !== 'diary') return;

  const diaryToUpdate = diaries.value[index];

  const diaryRequest = {
    idx: diaryToUpdate.id,
    title: editData.value.title,
    date: editData.value.date,
    content: editData.value.content,
    category: diaryToUpdate.category,
    deletedImageList: editData.value.deletedImageList || [],
  };

  try {
    const formData = new FormData();
    formData.append('diaryRequest', new Blob([JSON.stringify(diaryRequest)], { type: 'application/json' }));

    if (editData.value.imageFiles) {
      for (let file of editData.value.imageFiles) {
        formData.append('imageFiles', file);
      }
    }

    const response = await axios.post(`${BASE_URL}/diary/update`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Diary updated successfully:', response.data);

    Object.assign(diaryToUpdate, editData.value);
    showSuccessModal.value = true;
  } catch (error) {
    console.error('Error during diary update:', error.response ? error.response.data : error.message);
  } finally {
    diaryEditIndex.value = null;
  }
};

const saveScheduleEdit = async (type, index) => {
  if (type !== 'schedule') return;

  // 스케줄 수정
  const scheduleToUpdate = schedules.value[index];

  // JSON으로 보낼 기본 요청 데이터
  const scheduleRequest = {
    idx: scheduleToUpdate.id,
    title: editData.value.title,
    start: editData.value.start, // 시작 시간 추출
    end: editData.value.end, // 종료 시간 추출
    repeatType: editData.value.repeatType,
    repeatEndDate: editData.value.repeatEndDate,
    address: editData.value.address,
    content: editData.value.content,
    color: editData.value.color || 'DEFAULT_COLOR', // color 필드를 기본값으로 설정
    deletedImageList: editData.value.deletedImageList || [],
  };

  // FormData 생성 및 데이터 추가
  const formData = new FormData();
  formData.append('scheduleRequest', new Blob([JSON.stringify(scheduleRequest)], { type: 'application/json' }));

  // imageFiles 추가 (다이어리 방식과 동일)
  if (editData.value.imageFiles) {
    for (let file of editData.value.imageFiles) {
      formData.append('imageFiles', file);
    }
  }

  try {
    const response = await axios.post(`${BASE_URL}/schedule/update`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Schedule updated successfully:', response.data);
    Object.assign(scheduleToUpdate, editData.value);
    showSuccessModal.value = true;
  } catch (error) {
    console.error('Error during schedule update:', error.response ? error.response.data : error.message);
  } finally {
    scheduleEditIndex.value = null;
    isMapVisible.value = false; // 🔄 지도 숨김
  }
};

const cancelEdit = type => {
  if (type === 'schedule') {
    scheduleEditIndex.value = null;
    isMapVisible.value = false; // 🔄 지도 숨김
  } else if (type === 'diary') {
    diaryEditIndex.value = null;
  }
};

// 🔄 KakaoMap에서 위치 데이터 업데이트
const updateLocation = ({ lat, lng }) => {
  editData.value.latitude = lat; // 위도 업데이트
  editData.value.longitude = lng; // 경도 업데이트
  console.log('Updated location:', lat, lng);
};

// 모달을 열 때 호출되는 함수
const openDeleteModal = index => {
  deleteIndex.value = index;
  console.log('index = ' + index);

  // 반복 일정 여부 확인
  isRepeatSchedule.value = schedules.value[index].repeatType && schedules.value[index].repeatType.toUpperCase() !== 'NONE';

  // 반복 일정이면 반복 삭제 모달을 열고, 아니면 일반 삭제 모달을 엽니다.
  if (isRepeatSchedule.value) {
    showRepeatDeleteModal.value = true;
  } else {
    showSingleDeleteModal.value = true;
  }
};

// 반복 삭제 모달을 닫을 때 호출되는 함수
const closeRepeatDeleteModal = () => {
  showRepeatDeleteModal.value = false;
  deleteIndex.value = null;
};

// 일반 삭제 모달을 닫을 때 호출되는 함수
const closeSingleDeleteModal = () => {
  showSingleDeleteModal.value = false;
  deleteIndex.value = null;
};

// 반복 일정 삭제 확인 함수
const confirmDelete = async deleteOption => {
  if (deleteIndex.value !== null) {
    const scheduleId = schedules.value[deleteIndex.value].id;

    try {
      const response = await axios.delete(`${BASE_URL}/schedule/delete/${scheduleId}`, {
        params: {
          deleteOnlyThis: deleteOption === 'deleteOnlyThis',
          deleteAllRepeats: deleteOption === 'deleteAllRepeats',
          deleteAfter: deleteOption === 'deleteAfter',
        },
      });

      schedules.value.splice(deleteIndex.value, 1);
      console.log('Schedule deleted successfully:', response.data);
    } catch (error) {
      console.error('Failed to delete schedule:', error);
    } finally {
      closeRepeatDeleteModal();
    }
  }
};

// 일반 일정 삭제 확인 함수
const confirmSingleDelete = async deleteOption => {
  if (deleteIndex.value !== null) {
    const scheduleId = schedules.value[deleteIndex.value].id;

    try {
      const response = await axios.delete(`${BASE_URL}/schedule/delete/${scheduleId}`, {
        params: {
          deleteOnlyThis: deleteOption === 'deleteOnlyThis',
          deleteAllRepeats: deleteOption === 'deleteAllRepeats',
          deleteAfter: deleteOption === 'deleteAfter',
        },
      });
      schedules.value.splice(deleteIndex.value, 1);
      console.log('Schedule deleted successfully:', response.data);
    } catch (error) {
      console.error('Failed to delete schedule:', error);
    } finally {
      closeSingleDeleteModal();
    }
  }
};

const openDeleteDiaryModal = index => {
  diaryToDeleteIndex.value = index;
  showDiaryDeleteModal.value = true;
};

const closeDeleteDiaryModal = () => {
  showDiaryDeleteModal.value = false;
  diaryToDeleteIndex.value = null;
};

const confirmDeleteDiary = async () => {
  if (diaryToDeleteIndex.value !== null) {
    const diaryId = diaries.value[diaryToDeleteIndex.value].id;
    try {
      await axios.delete(`${BASE_URL}/diary/delete/${diaryId}`);
      diaries.value.splice(diaryToDeleteIndex.value, 1);
      console.log('Diary deleted successfully');
    } catch (error) {
      console.error('Failed to delete diary:', error);
    } finally {
      closeDeleteDiaryModal();
    }
  }
};

const onFileChange = event => {
  const files = event.target.files;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const reader = new FileReader();
    reader.onload = e => {
      editData.value.images.push(e.target.result);
    };
    reader.readAsDataURL(file);

    if (!editData.value.imageFiles) {
      editData.value.imageFiles = [];
    }
    editData.value.imageFiles.push(file);
  }

  event.target.value = '';
};

const removeImage = index => {
  const imageUrl = editData.value.images[index];

  if (!imageUrl) {
    console.error('Image URL is not defined');
    return;
  }

  if (!editData.value.deletedImageList) {
    editData.value.deletedImageList = [];
  }
  editData.value.deletedImageList.push(imageUrl);

  editData.value.images.splice(index, 1);
};

const isNewImage = imageUrl => {
  return imageUrl.startsWith('data:image');
};

//시간 표현법 바꾸기
const formatDateTime = dateTimeString => {
  if (!dateTimeString) return '';

  // 날짜와 시간 분리
  const [date, time] = dateTimeString.split('T');
  const [hour, minute] = time.split(':');

  // 시간 포맷팅
  let period = 'AM';
  let hourInt = parseInt(hour, 10);

  if (hourInt >= 12) {
    period = 'PM';
    if (hourInt > 12) {
      hourInt -= 12;
    }
  }
  if (hourInt === 0) {
    hourInt = 12;
  }

  return `${date} ${period} ${String(hourInt).padStart(2, '0')}:${minute}`;
};

// 스케줄 수정시 이미지 삭제,추가
const onScheduleFileChange = event => {
  const files = event.target.files;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const reader = new FileReader();
    reader.onload = e => {
      editData.value.images.push(e.target.result);
    };
    reader.readAsDataURL(file);

    if (!editData.value.imageFiles) {
      editData.value.imageFiles = [];
    }
    editData.value.imageFiles.push(file);
  }

  event.target.value = '';
};

const removeScheduleImage = index => {
  const imageUrl = editData.value.images[index];

  if (!imageUrl) {
    console.error('Image URL is not defined');
    return;
  }

  if (!editData.value.deletedImageList) {
    editData.value.deletedImageList = [];
  }
  editData.value.deletedImageList.push(imageUrl);

  editData.value.images.splice(index, 1);
};

watch(
  () => props.selectedDate,
  async newDate => {
    console.log('와치 하고 있음');
    if (newDate) {
      await fetchDayData(newDate);
    }
  },
  { immediate: true },
);
console.log('재 랜더링');
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
  border: 2px solid #c7c7c7;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  color: black;
  background-color: transparent;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date,
.category {
  font-size: 0.9rem;
  color: gray;
  margin-left: auto;
}

.expanded-content {
  margin-top: 10px;
  padding-top: 10px;
  overflow: hidden;
}

.divider {
  border: none;
  border-top: 1px solid #ccc;
  margin: 10px 0;
}

.button-group {
  display: flex;
  justify-content: center;
  margin-top: 10px;
  margin-right: 0;
}

.button-group button {
  background-color: #343434;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 18px;
  font-size: 0.9rem;
  cursor: pointer;
  transition:
    background-color 0.3s,
    transform 0.2s;
  margin-right: 5px;
}

.button-group button:last-child {
  margin-right: 0;
}

.button-group button:hover {
  background-color: #808080;
  transform: translateY(-2px);
}

.button-group button:active {
  background-color: #004080;
  transform: translateY(0);
}

.map-container {
  margin-top: 10px;
}

.map-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.input-field {
  border: none;
  width: 25%;
  padding: 10px;
  border-radius: 5px;
  font-size: 1rem;
}

.textarea-field {
  height: 100px;
  resize: none;
}

.delete-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.modal-button-group {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

.modal-button-group button {
  background-color: #343434;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  transition:
    background-color 0.3s,
    transform 0.2s;
}

.modal-button-group button:hover {
  background-color: #808080;
  transform: translateY(-2px);
}

.modal-button-group button:active {
  background-color: #004080;
  transform: translateY(0);
}
/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

.modal-buttons button {
  margin: 5px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.modal-buttons button:first-child {
  background-color: #333;
  color: white;
}

.modal-buttons button:last-child {
  background-color: #ddd;
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

.image-container {
  position: relative;
  display: inline-block;
  margin: 5px;
}

.no-DS-message {
  font-size: 1.1rem; /* 글씨를 조금 더 크게 설정 */
  color: #666; /* 부드러운 회색 */
  text-align: center; /* 중앙 정렬 */
  margin: 20px 0; /* 위아래 여백 추가 */
  font-weight: 500; /* 약간 두껍게 설정 */
  padding: 15px;
  border-radius: 5px;
  background-color: #f8f8f8; /* 살짝 톤다운된 배경색 */
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); /* 부드러운 그림자 */
}
</style>
