<template>
  <div class="map_wrap">
    <div id="map" style="width: 450px; height: 250px"></div>

    <div id="menu_wrap" class="bg_white">
      <div class="option">
        <form @submit.prevent="searchPlaces">
          키워드 : <input type="text" v-model="keyword" id="keyword" size="15" />
          <button type="submit" class="searchBtn">검색하기</button>
        </form>
      </div>
      <hr />
      <ul id="placesList"></ul>
      <div id="pagination"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const keyword = ref(''); // 검색어
const map = ref(null); // 지도 객체
const markers = ref([]); // 마커 배열
let infowindow = null; // 인포윈도우 객체

const initMap = () => {
  if (!window.kakao || !window.kakao.maps) {
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=YOUR_APP_KEY&libraries=services`;
    script.onload = () => {
      // Kakao Maps API가 로드된 후에 지도 생성
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
  const mapContainer = document.getElementById('map');
  const mapOption = {
    center: new kakao.maps.LatLng(37.566826, 126.9786567),
    level: 3,
  };

  map.value = new kakao.maps.Map(mapContainer, mapOption);
  infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });
};

const searchPlaces = () => {
  const ps = new kakao.maps.services.Places();
  const searchKeyword = keyword.value.trim();

  if (!searchKeyword) {
    alert('키워드를 입력해주세요!');
    return;
  }

  ps.keywordSearch(searchKeyword, placesSearchCB);
};

const placesSearchCB = (data, status, pagination) => {
  if (status === kakao.maps.services.Status.OK) {
    displayPlaces(data);
    displayPagination(pagination);
  } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
    alert('검색 결과가 존재하지 않습니다.');
  } else if (status === kakao.maps.services.Status.ERROR) {
    alert('검색 결과 중 오류가 발생했습니다.');
  }
};

const displayPlaces = places => {
  const listEl = document.getElementById('placesList');
  const bounds = new kakao.maps.LatLngBounds();
  removeAllChildNods(listEl);
  removeMarker();

  places.forEach((place, i) => {
    const placePosition = new kakao.maps.LatLng(place.y, place.x);
    const marker = addMarker(placePosition, i);

    const itemEl = document.createElement('li');
    itemEl.className = 'item';
    itemEl.innerHTML = `<h5>${place.place_name}</h5>`;

    kakao.maps.event.addListener(marker, 'mouseover', () => {
      displayInfowindow(marker, place.place_name);
    });
    kakao.maps.event.addListener(marker, 'mouseout', () => {
      infowindow.close();
    });

    itemEl.onmouseover = () => {
      displayInfowindow(marker, place.place_name);
    };
    itemEl.onmouseout = () => {
      infowindow.close();
    };

    listEl.appendChild(itemEl);
    bounds.extend(placePosition);
  });

  map.value.setBounds(bounds);
};

const addMarker = (position, idx) => {
  const marker = new kakao.maps.Marker({
    position: position,
    map: map.value,
  });
  markers.value.push(marker);
  return marker;
};

const removeMarker = () => {
  markers.value.forEach(marker => marker.setMap(null));
  markers.value = [];
};

const displayInfowindow = (marker, title) => {
  const content = `<div style="padding:5px;z-index:1;">${title}</div>`;
  infowindow.setContent(content);
  infowindow.open(map.value, marker);
};

const removeAllChildNods = el => {
  while (el.hasChildNodes()) {
    el.removeChild(el.lastChild);
  }
};

const displayPagination = pagination => {
  const paginationEl = document.getElementById('pagination');
  removeAllChildNods(paginationEl);

  for (let i = 1; i <= pagination.last; i++) {
    const el = document.createElement('a');
    el.href = '#';
    el.innerHTML = i;
    if (i === pagination.current) {
      el.className = 'on';
    } else {
      el.onclick = () => pagination.gotoPage(i);
    }
    paginationEl.appendChild(el);
  }
};

onMounted(() => {
  initMap();
});
</script>

<style scoped>
.map_wrap {
  position: relative;
  width: 100%;
  height: 50%;
  text-align: center;
}

#menu_wrap {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 300px;
  height: 100%;
  margin: 10px 0 30px 10px;
  padding: 5px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.7);
  z-index: 1;
  font-size: 12px;
  border-radius: 10px;
}

.searchBtn {
  margin-left: 20px;
}

#placesList li {
  list-style: none;
  padding: 5px 0;
  border-bottom: 1px solid #ccc;
  cursor: pointer;
}

#pagination a {
  margin-right: 5px;
  cursor: pointer;
}

#pagination .on {
  font-weight: bold;
  color: #777;
}
</style>
