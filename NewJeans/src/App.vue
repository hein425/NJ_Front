<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router' // 현재 경로 확인을 위해 추가
import MenuBar from './components/MenuBar.vue'
import HeaderTop from './components/HeaderTop.vue'
import Kakao from 'kakao-js-sdk' // 카카오 SDK 사용

const route = useRoute()

// 회원가입 페이지인지 여부 확인 ("/signupp" 경로)
const isSignUpPage = computed(() => route.path === '/signupp')

// 로그인 상태 관리
const isLoggedIn = ref(false)
const userName = ref('John Doe')
const profileImage = ref('john-doe-profile.png')

// Kakao SDK 초기화
Kakao.init('0f30b60c440ee37e2b4dc3a7bab61f1b') // 카카오 앱 키를 입력하세요

// 카카오 로그인 함수
const loginWithKakao = () => {
  Kakao.Auth.login({
    success: authObj => {
      console.log('로그인 성공', authObj)
      // 로그인 상태 업데이트
      isLoggedIn.value = true
      // 사용자 정보 가져오기
      Kakao.API.request({
        url: '/v2/user/me',
        success: response => {
          userName.value = response.kakao_account.profile.nickname
          profileImage.value = response.kakao_account.profile.profile_image_url
        },
        fail: error => {
          console.error(error)
        },
      })
    },
    fail: err => {
      console.error('로그인 실패', err)
    },
  })
}

// 카카오 로그아웃 함수
const logout = () => {
  Kakao.Auth.logout(() => {
    console.log('로그아웃 완료')
    isLoggedIn.value = false
    userName.value = 'John Doe'
    profileImage.value = 'john-doe-profile.png'
  })
}
</script>

<template>
  <!-- 회원가입 페이지가 아닐 때만 HeaderTop과 MenuBar를 보여줌 -->
  <HeaderTop v-if="!isSignUpPage" />
  <div class="app-layout">
    <MenuBar
      v-if="!isSignUpPage"
      :isLoggedIn="isLoggedIn"
      @login="loginWithKakao"
      @logout="logout"
    />
    <div class="content-area">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex; /* MenuBar와 콘텐츠 영역을 가로로 배치 */
}

.content-area {
  padding: 0; /* 콘텐츠와 화면 사이에 여백 추가 */
  width: 100%;
}
</style>
