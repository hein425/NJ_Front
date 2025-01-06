<template>
  <div>
    <!-- 뒤로가기 버튼 -->
    <button @click="$emit('goBack')">뒤로가기</button>

    <!-- 게시글 상세 정보 -->
    <h3>{{ post.title }}</h3>
    <p>{{ post.content }}</p>

    <!-- 댓글 목록 -->
    <h4>댓글</h4>
    <ul>
      <li v-for="comment in comments" :key="comment.id">{{ comment.userId }}: {{ comment.content }}</li>
    </ul>

    <!-- 댓글 추가 -->
    <textarea v-model="newComment" placeholder="댓글을 입력하세요"></textarea>
    <button @click="addComment">댓글 추가</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { BASE_URL } from '@/config';
import axios from 'axios';
axios;

const props = defineProps({
  post: Object, //게시글 데이터
  comments: Array, // 댓글 데이터
});

const emits = defineEmits(['goBack', 'commentAdded']); // 댓글 추가 이벤트 emit 정의
const newComment = ref('');

/// 댓글 추가
async function addComment() {
  if (!newComment.value.trim()) return;

  try {
    const response = await axios.post(`${BASE_URL}/shared/create/comments`, {
      sharedIdx: props.post.id, // 게시글 ID
      content: newComment.value, // 댓글 내용
      type: props.post.type, // 게시글 타입
    });

    // 상위 컴포넌트로 새 댓글 전달
    emits('commentAdded', response.data);
    newComment.value = ''; // 댓글 입력 필드 초기화
  } catch (error) {
    console.error('댓글 추가 실패:', error);
  }
}
</script>

<style scoped>
.post-detail {
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.back-button {
  margin-bottom: 20px;
  font-size: 16px;
  cursor: pointer;
}

.post-content {
  margin-bottom: 20px;
}

.comments-section {
  margin-top: 20px;
}

.comment-form {
  margin-top: 10px;
}

.comment-form textarea {
  width: 100%;
  height: 50px;
  margin-bottom: 10px;
}
</style>
