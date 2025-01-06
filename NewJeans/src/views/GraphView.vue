<template>
  <div class="page-container">
    <div class="message-box">
      <h1>페이지 준비중입니다</h1>
      <p>이용에 불편을 드려 죄송합니다.</p>
      <div class="character">
        <img src="../assets/crybabe.jpg" alt="캐릭터 이미지" />
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f8f9fa;
  margin: 0;
}

.message-box {
  text-align: center;
  padding: 20px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 300px;
}

h1 {
  font-size: 2rem;
  color: #495057;
  margin-bottom: 10px;
}

p {
  font-size: 1rem;
  color: #868e96;
  margin-bottom: 20px;
}

.character {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.character img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}
</style>
