<template>
  <div id="center">
    <div id="game">
      <div id="maze">
        <div id="end"></div>
      </div>
      <div id="joystick">
        <div class="joystick-arrow"></div>
        <div class="joystick-arrow"></div>
        <div class="joystick-arrow"></div>
        <div class="joystick-arrow"></div>
        <div id="joystick-head"></div>
      </div>
      <div id="note">
        Click the joystick to start!
        <p>Move every ball to the center. Ready for hard mode? Press H</p>
      </div>
    </div>
  </div>
</template>

<script>
import '/src/views/games/1/StickMan.js'; // JS 파일을 import

export default {
  mounted() {
    console.log('Game initialized');
  },
};
</script>

<style scoped>
@import '/src/views/games/1/StickMan.css'; /* CSS 경로 확인 */
</style>

