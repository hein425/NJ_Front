<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal">
      <p>{{ message }}</p>
      <button @click="handleClose" class="close-modal-btn">확인</button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

// 부모 컴포넌트에서 전달되는 값
defineProps({
  visible: Boolean, // 모달 표시 여부
  message: String, // 모달 메시지
});

// 부모로 닫기 신호 전송
const emit = defineEmits(['close']);
const handleClose = () => {
  emit('close'); // 부모에게 닫기 이벤트 발생
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  padding: 20px 50px;
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
/* 개별 모달 위치 */
.modal-empty-title {
  top: -30%;
}

.modal-title-limit {
  top: -20%;
}
.modal-title-success {
  top: -30%;
}
</style>
