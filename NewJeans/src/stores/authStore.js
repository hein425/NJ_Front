import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false, //로그인 상태
    token: null, // 사용자 토큰
    userName: '', // 사용자 이름
  }),
  actions: {
    login(token, userName) {
      this.token = token
      this.userName = userName
      this.isLoggedIn = true
    },
    logout() {
      this.token = null
      this.userName = ''
      this.isLoggedIn = false
    },
  },
})
