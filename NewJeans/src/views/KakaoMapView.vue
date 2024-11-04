<template>
    <div id="map" style="width: 100%; height: 300px;"></div>
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue';
  
  const props = defineProps({
    latitude: {
      type: Number,
      default: 37.566826, // 기본값 설정 (서울의 위도)
    },
    longitude: {
      type: Number,
      default: 126.9786567, // 기본값 설정 (서울의 경도)
    },
  });
  
  
  const map = ref(null);
  
  const initMap = () => {
    if (!window.kakao || !window.kakao.maps) {
      const script = document.createElement('script');
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=b0061f834b78c5f38c345878962fc250&libraries=services`;
      script.onload = () => {
        kakao.maps.load(() => {
          createMap();
        });
      };
      document.head.appendChild(script);
    } else {
      createMap();
    }
  };
  
  const createMap = () => {
  const latitude = props.latitude || 37.566826;
  const longitude = props.longitude || 126.9786567;

  const mapContainer = document.getElementById('map');
  const mapOption = {
    center: new kakao.maps.LatLng(latitude, longitude),
    level: 3,
  };

  map.value = new kakao.maps.Map(mapContainer, mapOption);

  // 마커 생성
  const markerPosition = new kakao.maps.LatLng(latitude, longitude);
  const marker = new kakao.maps.Marker({
    position: markerPosition,
  });

  marker.setMap(map.value); // 마커를 지도에 표시
};
  
  onMounted(() => {
    initMap();
  });


  </script>
  
  <style scoped>
  #map {
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  </style>
  
  
  <style scoped>
  #map {
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  </style>
  