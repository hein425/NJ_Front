<template>
  <header>
    <div class="nav_wrapper">
      <Profile
        :isLoggedIn="isLoggedIn"
        :userName="userName"
        :profileImage="profileImage"
      />
      <nav class="menu-grid">
        <RouterLink to="/" class="menu-item" active-class="active">
          <FontAwesomeIcon class="fa-icon" :icon="faCalendarAlt" />
          Calendar
        </RouterLink>
        <RouterLink to="/diary" class="menu-item" active-class="active">
          <FontAwesomeIcon class="fa-icon" :icon="faBook" />
          Diary
        </RouterLink>
        <RouterLink to="/teams" class="menu-item" active-class="active">
          <FontAwesomeIcon class="fa-icon" :icon="faUsers" />
          Teams
        </RouterLink>
        <RouterLink to="/setting" class="menu-item" active-class="active">
          <FontAwesomeIcon class="fa-icon" :icon="faCog" />
          Setting
        </RouterLink>

        <!-- 로그인 상태에 따라 버튼 전환 -->
        <button
          v-if="!isLoggedIn"
          class="menu-item sign-in"
          @click="showModal = true"
        >
          <FontAwesomeIcon class="fa-icon" :icon="faSignInAlt" />
          Sign In
        </button>
        <button v-else class="menu-item sign-out" @click="logoutFromKakao">
          <FontAwesomeIcon class="fa-icon" :icon="faSignOutAlt" />
          Sign Out
        </button>
      </nav>

      <!-- Modal 컴포넌트 -->
      <Modal
        :show="showModal"
        @close="showModal = false"
        @login="loginWithKakao"
      />
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue' // vue에서 onMounted 가져오기
import Profile from './ProfileSide.vue'
import Modal from './MoDal.vue' // Modal 컴포넌트 import
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faCalendarAlt,
  faBook,
  faUsers,
  faCog,
  faSignInAlt,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons'

// 부모 컴포넌트로 이벤트를 전송하기 위한 emit 정의
const emit = defineEmits(['login', 'logout']) // defineEmits를 사용해 emit 정의

// 로그인 상태 관리
const isLoggedIn = ref(false)
const userName = ref('John Doe')
const profileImage = ref('default-profile.png')

// 모달 표시 상태 관리
const showModal = ref(false)

// Kakao SDK 초기화 및 기존 로그인 상태 확인
onMounted(() => {
  if (!window.Kakao.isInitialized()) {
    window.Kakao.init('YOUR_APP_KEY') // 여기에 본인의 JavaScript 키 사용
  }

  // 기존 로그인 상태 확인
  if (window.Kakao.Auth.getAccessToken()) {
    window.Kakao.API.request({
      url: '/v2/user/me',
      success: function (res) {
        isLoggedIn.value = true
        userName.value = res.properties.nickname
        profileImage.value = res.properties.profile_image
      },
      fail: function (error) {
        console.log(error)
      },
    })
  }
})

// 카카오 로그인 함수
const loginWithKakao = () => {
  window.Kakao.Auth.login({
    success: function (authObj) {
      console.log(authObj)
      window.Kakao.API.request({
        url: '/v2/user/me',
        success: function (res) {
          console.log(res)
          isLoggedIn.value = true
          userName.value = res.properties.nickname
          profileImage.value = res.properties.profile_image
          showModal.value = false // 로그인 성공 시 모달 닫기
          emit('login') // 부모 컴포넌트로 로그인 이벤트 emit
        },
        fail: function (error) {
          console.log(error)
        },
      })
    },
    fail: function (err) {
      console.log(err)
    },
  })
}

// 카카오 로그아웃 함수
const logoutFromKakao = () => {
  if (window.Kakao.Auth.getAccessToken()) {
    window.Kakao.Auth.logout(() => {
      console.log('로그아웃 완료')
      isLoggedIn.value = false
      userName.value = 'John Doe'
      profileImage.value = 'default-profile.png'
      emit('logout') // 부모 컴포넌트로 로그아웃 이벤트 emit
    })
  }
}
</script>

<style scoped>
.nav_wrapper {
  display: flex;
  flex-direction: column; /* 세로 방향으로 정렬 */
  align-items: flex-start; /* 왼쪽 정렬 */
  padding: 5vh 0 0 20vw; /* vh와 vw 단위로 패딩 설정 */
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2개의 열 */
  grid-template-rows: repeat(3, 10vh); /* vh 단위로 행 높이 설정 */
  gap: 0;
  width: 12vw; /* 전체 너비를 vw 단위로 설정 */
  margin-top: 2vh; /* 프로필과 메뉴 간의 간격 */
}

/* 각 메뉴 항목의 스타일 */
.menu-item {
  padding: 1.5rem 1rem; /* rem 단위로 패딩 설정 */
  background-color: #f5f5f5;
  color: #5c5c5c;
  border: 1px solid #ccc;
  text-align: center;
  cursor: pointer;
  font-size: 1rem; /* rem 단위로 폰트 크기 설정 */
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  border-radius: 0;
}

/* 아이콘과 텍스트 간격 */
.menu-item .fa-icon {
  margin-bottom: 0.5rem; /* rem 단위로 간격 설정 */
}

/* 활성화된 메뉴 (클릭 후 유지되는 상태) */
.active {
  background-color: white;
  color: black;
  transform: scale(1.1); /* 버튼을 살짝 키워서 다른 버튼들과 겹침 */
  z-index: 1; /* 다른 버튼들 위로 올라옴 */
  border-color: transparent; /* 테두리 색을 투명하게 만들어 테두리 제거 */
  border-radius: 0.8rem; /* rem 단위로 둥근 모서리 설정 */
}

/* Calendar 메뉴 */
.menu-item:nth-child(1) {
  border-top-left-radius: 1rem; /* 좌측 상단 모서리 둥글게 */
}

/* Diary 메뉴 */
.menu-item:nth-child(2) {
  border-top-right-radius: 1rem; /* 우측 상단 모서리 둥글게 */
}

/* Teams 메뉴 */
.menu-item:nth-child(3) {
  border-radius: 0; /* 기본적으로 둥근 모서리 없음 */
}

/* Setting 메뉴 */
.menu-item:nth-child(4) {
  border-radius: 0; /* 기본적으로 둥근 모서리 없음 */
}

/* Sign In 버튼 */
.sign-in {
  grid-column: span 2; /* 마지막 줄에서 두 칸 병합 */
  border-bottom-right-radius: 1rem;
  border-bottom-left-radius: 1rem;
}
</style>
