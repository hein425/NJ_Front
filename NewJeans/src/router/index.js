import { createRouter, createWebHistory } from 'vue-router';
import Calendar from '../views/CalendarView.vue';
import Diary from '../views/DiaryView.vue';
import Teams from '../views/TeamsView.vue';
import YearlyCalendar from '@/components/YearlyCalendar.vue';
import Setting from '../views/SettingView.vue';
import SignUpp from '../views/SignUpp.vue';
import ScheduleDayForm from '@/components/ScheduleDayForm.vue';
import SearchForm from '@/components/SearchForm.vue';
import DiaryDetail from '@/views/DiaryDetail.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'calendar',
      component: Calendar,
    },
    {
      path: '/diary',
      name: 'diary',
      component: Diary,
    },
    {
      path: '/diary/:idx',
      name: 'DiaryDetail',
      component: DiaryDetail,
      props: true
    },
    {
      path: '/teams',
      name: 'teams',
      component: Teams,
    },
    {
      path: '/setting',
      name: 'setting',
      component: Setting,
    },
    {
      path: '/signUpp',
      name: 'signUpp',
      component: SignUpp,
    },
    {
      path: '/schedule',
      name: 'ScheduleDay',
      component: ScheduleDayForm,
      props: true
    },
    {
      path: '/yearlyCalendar',
      name: 'YearlyCalendar',
      component: YearlyCalendar,
      props: true  
    },
    {
      path: '/searchForm',
      name: 'SearchForm',
      component: SearchForm,
      props: true
    },
  ],
});

export default router;
