import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false, // 로그인 상태
    accessToken: '', // 사용자 토큰
    userName: '', // 사용자 이름
    profile: '', // 프로필 이미지 추가
  }),
  actions: {
    login(token, userName, profile) {
      console.log(token + ' ' + userName + ' ' + profile);
      this.accessToken = token;
      this.userName = userName;
      this.profile = profile; // 프로필 이미지 저장
      this.isLoggedIn = true;

      // localStorage에 토큰과 유저명 저장
      localStorage.setItem('token', token);
      localStorage.setItem('userName', userName);
      localStorage.setItem('profile', profile);
    },
    logout() {
      // 로그아웃 처리: 상태 초기화 및 localStorage 정리
      this.accessToken = null;
      this.userName = '';
      this.isLoggedIn = false;

      // localStorage에서 토큰과 사용자 이름 제거
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
    },
    // 새로고침 시 로그인 상태 복원
    restoreLogin() {
      const accessToken = localStorage.getItem('token');
      const userName = localStorage.getItem('userName');
      const profile = localStorage.getItem('profile'); // 이미지도 복원

      if (accessToken && userName) {
        this.accessToken = accessToken;
        this.userName = userName;
        this.profile = profile;
        this.isLoggedIn = true;
      }
    },
  },
});
