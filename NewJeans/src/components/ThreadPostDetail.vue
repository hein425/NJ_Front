<template>
  <!-- 뒤로가기 버튼 -->
  <button class="back-button" @click="$emit('goBack')">
    <i class="fas fa-arrow-left"></i>
  </button>
  <div class="post-detail-container">
    <!-- 다이어리 레이아웃 -->
    <div v-if="post.type === 'DIARY'" class="diary-layout">
      <div class="header-section">
        <img :src="post.profileImg || '/default-profile.png'" alt="Profile" class="profile-img" />
        <div class="text-info">
          <h3 class="author">{{ post.author }}</h3>
          <div class="meta-info">
            <span class="title" :style="{ backgroundColor: '#FFD6D6' }">{{ post.title }}</span>
            <span class="category" v-if="post.category" :style="{ backgroundColor: '#FFEBCC' }">#{{ post.category }}</span>
            <span class="category" v-if="post.category" :style="{ backgroundColor: '#d6f7ff' }">#{{ post.date }}</span>
          </div>
        </div>
        <span class="date">{{ formatDate(post.shareDate) }}</span>
      </div>
      <div class="content-section">
        <p class="content">{{ post.content }}</p>
        <div class="diary-images" v-if="post.images && post.images.length">
          <img v-for="image in post.images" :src="image" :key="image" alt="Diary Image" class="diary-img" />
        </div>
      </div>
    </div>

    <!-- 스케줄 레이아웃 -->
    <div v-else-if="post.type === 'SCHEDULE'" class="schedule-layout">
      <div class="header-section">
        <img :src="post.profileImg || '/default-profile.png'" alt="Profile" class="profile-img" />
        <div class="text-info">
          <h3 class="author">{{ post.author }}</h3>
          <span class="title" :style="{ backgroundColor: '#FFD6D6' }">{{ post.title }}</span>
        </div>
        <span class="date">{{ formatDate(post.shareDate) }}</span>
      </div>
      <div class="schedule-info">
        <p><strong>시작 시간:</strong> {{ post.start }}</p>
        <p><strong>종료 시간:</strong> {{ post.end }}</p>
        <p><strong>반복:</strong> {{ post.repeatType || '없음' }}</p>
        <p class="content">{{ post.content }}</p>
        <!-- <div class="map-section">
          <p><span>Address:</span> {{ post.location }}</p>
          <img :src="post.mapImg || '/default-map.png'" alt="Map" class="map-img" />
        </div> -->
      </div>
    </div>

    <!-- 댓글 섹션 -->
    <div class="comments-section">
      <div class="comments-form">
        <textarea v-model="newComment" placeholder="댓글을 입력하세요" class="comment-input"></textarea>
        <button @click="addComment" class="comment-submit">등록</button>
      </div>

      <ul class="comments-list">
        <li v-for="comment in comments" :key="comment.commentsIdx" class="comment-item">
          <div class="comment-header">
            <span class="comment-author">{{ comment.comAuthor }}</span>
            <span class="comment-date">{{ formatDate(comment.dateTime) }}</span>
            <div class="comment-actions">
              <i class="fas fa-ellipsis-h"></i>
              <div class="actions-menu">
                <button @click="editComment(comment)">수정</button>
                <button @click="deleteComment(comment.commentsIdx)">삭제</button>
              </div>
            </div>
          </div>
          <p class="comment-content">{{ comment.content }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { BASE_URL } from '@/config';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
axios;

// Pinia를 통해 로그인한 사용자의 ID 가져오기
const authStore = useAuthStore();

const props = defineProps({
  post: Object, //게시글 데이터
  comments: Array, // 댓글 데이터
});

const emits = defineEmits(['goBack', 'commentAdded']); // 댓글 추가 이벤트 emit 정의
const newComment = ref('');

/// 댓글 추가
async function addComment() {
  if (!newComment.value.trim()) {
    console.error('댓글 내용이 비어 있습니다.');
    return;
  }

  try {
    // `diaryIdx` 또는 `scheduleIdx`를 선택
    const idxKey = props.post.type === 'DIARY' ? 'diaryIdx' : 'scheduleIdx';
    const targetIdx = props.post[idxKey];
    console.log(props.post);

    if (!targetIdx) {
      console.error(`댓글 추가를 위한 ${idxKey}가 없습니다.`);
      return;
    }

    const userIdx = authStore.userIdx;
    if (!userIdx) {
      console.error('사용자 ID가 설정되지 않았습니다.');
      return;
    }

    let newData = {
      userIdx: userIdx,
      [idxKey]: targetIdx, // diaryIdx 또는 scheduleIdx
      content: newComment.value,
      dateTime: new Date().toISOString(),
    };

    const response = await axios.post(`${BASE_URL}/shared/create/comments`, newData);

    console.log(response.data);

    newData = { ...newData, ...response.data };

    // 댓글 목록을 다시 가져와서 업데이트
    emits('commentAdded', { type: 'add', data: newData });
    newComment.value = ''; // 댓글 입력 필드 초기화
    console.log('댓글이 성공적으로 추가되었습니다.');
  } catch (error) {
    console.error('댓글 추가 실패:', error.response?.data || error.message);
  }
}

// 댓글 삭제
async function deleteComment(commentIdx) {
  try {
    await axios.delete(`${BASE_URL}/shared/delete/${commentIdx}`);
    alert('댓글이 삭제되었습니다.');

    emits('commentAdded', { type: 'delete', data: commentIdx });
  } catch (error) {
    console.error('댓글 삭제 실패:', error);
  }
}

// 댓글 수정
async function editComment(comment) {
  const newContent = prompt('댓글을 수정하세요:', comment.content);
  if (!newContent || newContent.trim() === '') {
    alert('댓글 내용이 비어있습니다.');
    return;
  }

  try {
    // 서버에 보낼 데이터 확인
    const requestData = {
      commentsIdx: comment.commentsIdx, // 댓글 ID
      content: newContent, // 수정된 댓글 내용
    };

    console.log('수정 요청 데이터:', requestData);

    const response = await axios.post(`${BASE_URL}/shared/update/comments`, requestData);
    console.log('수정 성공:', response.data);

    // 댓글 내용 업데이트
    comment.content = newContent;
    alert('댓글이 수정되었습니다.');
  } catch (error) {
    // 에러 응답 출력
    console.error('댓글 수정 실패:', error.response?.data || error.message);
    if (error.response?.status === 500) {
      alert('서버 오류가 발생했습니다. 관리자에게 문의하세요.');
    } else {
      alert('댓글 수정 중 오류가 발생했습니다.');
    }
  }
}

// 날짜 포맷 함수
function formatDate(dateTime) {
  const date = new Date(dateTime);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
</script>

<style scoped>
.post-detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f7f8fa;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.back-button {
  margin-left: 24%;
  padding-top: 5vh;
  background: none;
  border: none;
  font-size: 24px; /* 아이콘 크기 */
  color: #555;
  cursor: pointer;
  margin-bottom: 40px;
  text-align: left;
  display: flex;
  align-items: center;
}

.back-button i {
  margin-right: 8px; /* 아이콘과 텍스트 간격 */
}

.back-button:hover {
  color: #000; /* 마우스 오버 시 색상 변경 */
  text-decoration: none;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.schedule-layout,
.diary-layout {
  text-align: left;
}

.profile-img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
}

.title,
.category {
  font-size: 0.9rem;
  padding: 5px 10px;
  border-radius: 10px;
  font-weight: bold;
}

.text-info {
  flex: 1;
}

.author {
  font-size: 18px;
  font-weight: bold;
}

.meta-info {
  display: flex;
  gap: 10px;
}

.date {
  font-size: 0.9rem;
  color: #888;
}

.content-section {
  margin: 10px 7.6%;
}

.diary-images img {
  max-width: 100%;
  margin-top: 10px;
  border-radius: 8px;
}

.schedule-info p {
  margin: 5px 7.6%;
}

.schedule-info .content {
  border-top: 1px solid rgb(221, 221, 221);
  border-bottom: 1px solid rgb(221, 221, 221);
  padding: 10px 0px;
  width: 90%;
}

.map-img {
  max-width: 100%;
  border-radius: 8px;
  margin-top: 10px;
}

.comments-section {
  margin-top: 20px;
}

.comments-form {
  display: flex;
  gap: 10px; /* 텍스트 영역과 버튼 사이 간격 */
  align-items: flex-start; /* 수직 정렬 */
}

.comment-input {
  flex: 1; /* 버튼을 제외한 나머지 공간을 차지 */
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  resize: none;
}

.comment-submit {
  padding: 16px 20px;
  background-color: #303030;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  align-self: flex-start; /* 버튼이 textarea와 위쪽 정렬 */
}

.comments-list {
  list-style: none;
  padding: 0;
  margin-top: 10px;
}

.comment-item {
  padding: 10px 0;
  border-bottom: 1px solid #ddd;
}

.comment-header {
  display: flex;
  justify-content: space-between;
}

.comment-author {
  font-weight: bold;
}

.comment-date {
  font-size: 0.9rem;
  color: #888;
}
</style>
