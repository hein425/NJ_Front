import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
    accessToken: '',
    userName: '',
    profile: '',
    email: '',
    idx: null, // 초기 값을 null로 설정
  }),
  actions: {
    login(token, userName, profile, email, idx) {
      this.accessToken = token;
      this.userName = userName;
      this.profile = profile;
      this.email = email;
      this.idx = idx;
      this.isLoggedIn = true;

      // localStorage에 모든 값을 저장
      localStorage.setItem('token', token);
      localStorage.setItem('userName', userName);
      localStorage.setItem('profile', profile || '');
      localStorage.setItem('email', email || '');
      localStorage.setItem('idx', idx || '');
    },
    logout() {
      // 로그아웃 시 상태 초기화 및 localStorage 정리
      this.accessToken = null;
      this.userName = '';
      this.profile = '';
      this.email = '';
      this.idx = null;
      this.isLoggedIn = false;

      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('profile');
      localStorage.removeItem('email');
      localStorage.removeItem('idx');
    },
    restoreLogin() {
      const accessToken = localStorage.getItem('token');
      const userName = localStorage.getItem('userName');
      const profile = localStorage.getItem('profile');
      const email = localStorage.getItem('email');
      const idx = localStorage.getItem('idx');

      console.log('restoreLogin 호출됨 - 가져온 데이터:', { accessToken, userName, profile, email, idx });

      if (accessToken && userName) {
        this.accessToken = accessToken;
        this.userName = userName;
        this.profile = profile || '';
        this.email = email || '';
        this.idx = idx ? Number(idx) : null;
        this.isLoggedIn = true;
        console.log('restoreLogin 실행 후 상태:', this.$state); // 최종 상태 확인
      } else {
        console.warn('localStorage에 저장된 로그인 정보가 없습니다.');
      }
    },
    changeProfileImage(newProfile) {
      this.profile = newProfile;
      localStorage.setItem('profile', newProfile);
    },
  },
});
