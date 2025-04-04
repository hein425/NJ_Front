<template>
    <div>
      <h2>월별 통계</h2>
      <div class="header">
        <button @click="goToPreviousMonth" class="tooltip-btn" data-tooltip="이전달">〈</button>
        <span>{{ displayDate }}</span>
        <button @click="goToNextMonth" class="tooltip-btn" data-tooltip="다음달">〉</button>
      </div>
      <canvas ref="combinedChartCanvas" id="combined-chart-month"></canvas>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, BarController, BarElement } from 'chart.js';
  import { BASE_URL } from '@/config';
  import { useAuthStore } from '@/stores/authStore';
  import 'tippy.js/dist/tippy.css';
  import tippy from 'tippy.js';
  import { onMounted } from 'vue';


  Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, BarController, BarElement);
  

  export default {
    name: 'CombinedChartMonth',
    data() {
      const today = new Date();
      return {
        combinedChart: null,
        currentYear: today.getFullYear(),
        currentMonth: today.getMonth() + 1,
        colors: {
          DAILY: '#fcd1d7',
          GROWTH: '#adf2f1',
          TRIP: '#d0eed5',
          EXERCISE: '#ffffc9',
          ETC: '#ebcbf4',
        },
        isLoading: false,
      };
    },
    computed: {
      displayDate() {
        return `${this.currentYear}년 ${this.currentMonth}월`;
      },
    },
    async mounted() {
      const authStore = useAuthStore();
      await this.loadChartData(authStore.idx);
    },
    methods: {
      async loadChartData(userIdx) {
        if (this.isLoading) return;
        this.isLoading = true;
  
        try {
          const canvasElement = this.$refs.combinedChartCanvas;
          if (!canvasElement) {
            console.error('Canvas element not found');
            return;
          }
  
          if (this.combinedChart) {
            this.combinedChart.destroy();
            this.combinedChart = null;
          }
  
          const response = await axios.get(`${BASE_URL}/statistics/month`, {
            params: { userIdx: userIdx, year: this.currentYear, month: this.currentMonth },
          });
  
          const data = response.data || [];
          const daysInMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
          const dayLabels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
          const categoryData = {
            DAILY: Array(daysInMonth).fill(0),
            GROWTH: Array(daysInMonth).fill(0),
            TRIP: Array(daysInMonth).fill(0),
            EXERCISE: Array(daysInMonth).fill(0),
            ETC: Array(daysInMonth).fill(0),
          };
          const totalPercentages = Array(daysInMonth).fill(0);
  
          for (const entry of data) {
            const day = entry.date ? parseInt(entry.date.split('-')[2], 10) - 1 : null;
            if (day !== null) {
              for (const [category, percentage] of Object.entries(entry.categoryPercentageMap || {})) {
                if (categoryData[category]) {
                  categoryData[category][day] = percentage;
                }
              }
              totalPercentages[day] = entry.totalPercentage;
            }
          }
  
          const maxCount = daysInMonth;
  
          this.combinedChart = new Chart(canvasElement.getContext('2d'), {
            type: 'bar',
            data: {
              labels: dayLabels,
              datasets: [
                {
                  label: '전체 작성 비율 (%) - 꺾은선',
                  data: totalPercentages.map(count => Math.round((count / maxCount) * 100)), // 소수점 없이 정수로 표시
                  borderColor: '#3b82f6',
                  fill: false,
                  type: 'line',
                  yAxisID: 'y2',
                  tension: 0.4,
                  pointRadius: totalPercentages.map((value, index, arr) => (index === 0 || value !== arr[index - 1] ? 5 : 0)),
                  pointBackgroundColor: totalPercentages.map((value, index, arr) => (index === 0 || value !== arr[index - 1] ? '#3b82f6' : 'transparent')),
                  datalabels: {
                    display: ctx => {
                      const { dataIndex, dataset } = ctx;
                      const currentValue = dataset.data[dataIndex];
                      const previousValue = dataset.data[dataIndex - 1];
                      // 이전 값과 동일한 경우 표시하지 않음
                      return dataIndex === 0 || currentValue !== previousValue;
                    },
                    formatter: value => Math.round(value), // 소수점 없이 정수로 표시
                    color: '#333',
                  },
                },
                ...Object.keys(categoryData).map(category => ({
                  label: category,
                  data: categoryData[category],
                  backgroundColor: this.colors[category],
                  type: 'bar',
                  stack: 'stacked',
                  datalabels: {
                    display: ctx => ctx.dataset.data[ctx.dataIndex] !== 0, // 값이 0인 경우 숨김
                  },
                })),
              ],
            },
            options: {
              responsive: true,
              plugins: {
                datalabels: {
                  display: ctx => ctx.dataset.data[ctx.dataIndex] !== 0, // 값이 0인 경우 숨김
                  formatter: value => Math.round(value), // 소수점 없는 정수로 표시
                  color: '#333',
                },
              },
              scales: {
                x: {
                  ticks: {
                    autoSkip: false,
                    maxRotation: 0,
                  },
                },
                y: {
                  beginAtZero: true,
                  max: 100,
                  stacked: true,
                  title: {
                    display: true,
                    text: '비율 (%)',
                  },
                },
                y2: {
                  beginAtZero: true,
                  max: maxCount,
                  position: 'right',
                  grid: {
                    drawOnChartArea: false,
                  },
                },
              },
            },
          });
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          this.isLoading = false;
        }
      },
      goToPreviousMonth() {
        const authStore = useAuthStore();
        if (this.currentMonth === 1) {
          this.currentMonth = 12;
          this.currentYear -= 1;
        } else {
          this.currentMonth -= 1;
        }
        this.loadChartData(authStore.idx);
      },
      goToNextMonth() {
        const authStore = useAuthStore();
        if (this.currentMonth === 12) {
          this.currentMonth = 1;
          this.currentYear += 1;
        } else {
          this.currentMonth += 1;
        }
        this.loadChartData(authStore.idx);
      },
    },
  };

  onMounted(() => {
  const buttons = document.querySelectorAll('.tooltip-btn');
  
  buttons.forEach((button) => {
    const tooltipContent = button.getAttribute('data-tooltip');
    tippy(button, {
      content: tooltipContent,
      interactive: true,
      trigger: 'mouseenter',
      duration: [300, 300],
      theme: 'light',
    });
  });
});
  </script>
  
  <style scoped>
  .header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
    font-size: 18px;
  }
  
  .header button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 0 15px;
  }
  
  canvas {
    width: 100%;
    max-width: 800px;
    height: 400px;
  }
  </style>
  