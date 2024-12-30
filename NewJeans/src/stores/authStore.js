import { defineStore } from 'pinia';
import defaultProfileImage from '@/assets/profile2.jpg'; // 기본 프로필 이미지 경로
import axios from 'axios';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
    accessToken: '',
    userName: '',
    profileImageUrl: '',
    email: '',
    idx: null,
    calendarIdx: null, // idx 값 그대로 저장
  }),
  actions: {
    check() {
      console.log(`this.accessToken = ${this.accessToken}`);
      console.log(`this.isLoggedIn = ${this.isLoggedIn}`);
      console.log(`this.userName = ${this.userName}`);
      console.log(`this.profileImageUrl = ${this.profileImageUrl}`);
      console.log(`this.email = ${this.email}`);
      console.log(`this.idx = ${this.idx}`);
      console.log(`this.calendarIdx = ${this.calendarIdx}`);
    },
    login(token, userName, profileImageUrl, email, idx) {
      this.accessToken = token;
      this.userName = userName;
      this.profileImageUrl = profileImageUrl && profileImageUrl !== 'undefined' ? profileImageUrl : defaultProfileImage; // 기본 이미지 적용
      this.email = email;
      this.idx = idx;
      this.calendarIdx = idx; // idx 값을 그대로 저장
      this.isLoggedIn = true;

      localStorage.setItem('token', token);
      localStorage.setItem('userName', userName);
      localStorage.setItem('profileImageUrl', profileImageUrl || '');
      localStorage.setItem('email', email || '');
      localStorage.setItem('idx', idx || '');
      localStorage.setItem('calendarIdx', idx || ''); // idx 값을 저장

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },
    logout() {
      this.accessToken = null;
      this.userName = '';
      this.profileImageUrl = '';
      this.email = '';
      this.idx = null;
      this.isLoggedIn = false;
      this.calendarIdx = null;

      this.showLoginSuccessModal = true; // 로그인 성공 모달 활성화
      setTimeout(() => {
        this.showLoginSuccessModal = false; // 모달 자동 초기화
      }, 2000);

      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('profileImageUrl');
      localStorage.removeItem('email');
      localStorage.removeItem('idx');
      localStorage.removeItem('calendarIdx');

      delete axios.defaults.headers.common['Authorization'];
    },
    restoreLogin() {
      const accessToken = localStorage.getItem('token');
      const userName = localStorage.getItem('userName');
      const profileImageUrl = localStorage.getItem('profileImageUrl');
      const email = localStorage.getItem('email');
      const idx = localStorage.getItem('idx');
      const calendarIdx = localStorage.getItem('calendarIdx');

      console.log('restoreLogin 호출됨 - 가져온 데이터:', { accessToken, userName, profileImageUrl, email, idx, calendarIdx });

      if (accessToken && userName) {
        this.accessToken = accessToken;
        this.userName = userName;
        this.profileImageUrl = profileImageUrl && profileImageUrl !== 'undefined' && profileImageUrl !== '' ? profileImageUrl : defaultProfileImage; // 기본 이미지 적용
        this.email = email || '';
        this.idx = idx ? Number(idx) : null;
        this.calendarIdx = idx ? Number(idx) : null; // idx 값을 그대로 복원
        this.isLoggedIn = true;

        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        console.log('restoreLogin 실행 후 상태:', this.$state); // 최종 상태 확인
      } else {
        console.warn('localStorage에 저장된 로그인 정보가 없습니다.');
      }
    },
    changeProfileImage(newprofileImageUrl) {
      this.profileImageUrl = newprofileImageUrl && newprofileImageUrl !== '' ? newprofileImageUrl : defaultProfileImage; // 기본 이미지 적용
      localStorage.setItem('profileImageUrl', newprofileImageUrl || '');
    },
  },
});

// Notification 스토어
export const toolBox = defineStore('notification', {
  state: () => ({
    messages: [],
  }),
  actions: {
    addMessage(message) {
      this.messages.push(message);
    },
    removeMessage(index) {
      this.messages.splice(index, 1);
    },
  },
});
