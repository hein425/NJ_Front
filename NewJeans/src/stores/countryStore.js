// stores/countryStore.js
import { defineStore } from 'pinia';

export const useCountryStore = defineStore('countryStore', {
  state: () => ({
    countryCode: 'KR', // 기본값
  }),
  actions: {
    setCountryCode(code) {
      this.countryCode = code;
    },
  },
});
