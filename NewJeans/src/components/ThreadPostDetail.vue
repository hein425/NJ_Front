<template>
  <div>
    <button @click="$emit('goBack')">뒤로가기</button>
    <div>
      <h3>{{ post.title }}</h3>
      <p>{{ post.content }}</p>
    </div>
    <div>
      <h4>댓글</h4>
      <ul>
        <li v-for="comment in comments" :key="comment.id">
          <p>{{ comment.content }} - {{ comment.date }}</p>
        </li>
      </ul>
      <textarea v-model="newComment" placeholder="댓글을 입력하세요"></textarea>
      <button @click="emitAddComment">댓글 달기</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  post: Object,
  comments: Array,
});

const emits = defineEmits(['goBack', 'addComment']);
const newComment = ref('');

function emitAddComment() {
  if (newComment.value.trim()) {
    emits('addComment', newComment.value);
    newComment.value = '';
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
