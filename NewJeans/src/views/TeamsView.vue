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
import axios from 'axios'; // axios를 사용하여 HTTP 요청을 보냅니다.
import { BASE_URL } from '@/config';

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

        reader.onload = e => {
          this.images.push({ url: e.target.result });
        };

        reader.readAsDataURL(file);
      }
      event.target.value = ''; // 입력 초기화
    },
    // 이미지 제거 함수
    async removeImage(index, imageUrl) {
      try {
        // 서버로 이미지 삭제 요청을 보냅니다.
        await axios.post(`${BASE_URL}http://112.222.157.156:10004/api/deleteImage`, { imageUrl });

        // 요청이 성공하면 이미지 리스트에서 제거합니다.
        this.images.splice(index, 1);
      } catch (error) {
        console.error('Failed to delete image:', error);
        alert('이미지를 삭제하는 데 실패했습니다.');
      }
    },
  },
};
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
