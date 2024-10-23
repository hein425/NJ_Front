<template>
  <div class="schedule-form">
    <h2>일정 작성</h2>
    <form @submit.prevent="submitSchedule">
      
      <div>
        <label for="title">제목</label>

        <input id="title" v-model="title" />
      </div>
      <label for="colors">색깔</label>
      <select v-model="colors" id="colors">
        <option
          v-for="category in categories"
          :key="category"
          :value="category"
        >
          {{ category }}
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

      <!-- 지도 넣을 자리 비워놨습니다 태호형님 여기입니다  -->
       
      <div>
        <label for="location">위치</label>
        <div id="map" style="width:100%;height:300px;"></div>
      </div>

      <!-- 지도 넣을 자리 비워놨습니다 태호형님 여기입니다  -->

      <div>
        <label for="content">내용</label>
        <textarea id="content" v-model="content"></textarea>
      </div>

      <button type="submit">저장</button>
      <button type="button">취소</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios';

const props = defineProps({
  selectedDate: String,
});

const title = ref('');
const date =  ref(props.selectedDate || '');
const colors = ['빨','주','노','초'];
const content = ref('');
const time = ref('');
const repeatOption = ref('NO'); // 라디오 기본값

const submitSchedule = () => {
  console.log('Schedule Submitted', {
    title: title.value,
    date: date.value,
    content: content.value,
    repeatOption: repeatOption.value,
    colors: colors.value,
  })
}
</script>

<style scoped>
/* 스타일링 */
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
