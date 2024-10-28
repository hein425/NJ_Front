import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false, // 로그인 상태
    accessToken: '', // 사용자 토큰
    userName: '', // 사용자 이름
    profile: '', // 프로필 이미지 추가
    email: '', // 이메일 상태 추가
  }),
  actions: {
    login(token, userName, profile, email) {
      this.accessToken = token;
      this.userName = userName;
      this.profile = profile;
      this.email = email;
      this.isLoggedIn = true;

      // localStorage에 토큰과 유저명 저장
      localStorage.setItem('token', token);
      localStorage.setItem('userName', userName);
      localStorage.setItem('profile', profile);
      localStorage.setItem('email', email);
    },
    logout() {
      // 로그아웃 처리: 상태 초기화 및 localStorage 정리
      this.accessToken = null;
      this.userName = '';
      this.profile = '';
      this.email = '';
      this.isLoggedIn = false;

      // localStorage에서 토큰과 사용자 이름 제거
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('profile');
      localStorage.removeItem('email');
    },
    // 새로고침 시 로그인 상태 복원
    restoreLogin() {
      const accessToken = localStorage.getItem('token');
      const userName = localStorage.getItem('userName');
      const profile = localStorage.getItem('profile');
      const email = localStorage.getItem('email');

      if (accessToken && userName) {
        this.accessToken = accessToken;
        this.userName = userName;
        this.profile = profile;
        this.email = email;
        this.isLoggedIn = true;
      }
    },
    changeProfileImage(newProfile) {
      this.profile = newProfile;
      localStorage.setItem('profile', newProfile);
    },
  },
});
