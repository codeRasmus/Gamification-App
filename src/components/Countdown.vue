<script setup>
import { ref, onUnmounted } from "vue";

const inputSeconds = ref("");
const displayTime = ref("");
const progress = ref(100); // 0-100 %

let timer = null;
let totalSeconds = 0;

function countDown(secondsLeft) {
  totalSeconds = secondsLeft;
  const countDownDate = new Date().getTime() + secondsLeft * 1000;

  timer = setInterval(() => {
    const now = new Date().getTime();
    const distance = countDownDate - now;

    if (distance < 0) {
      clearInterval(timer);
      displayTime.value = "TIDEN ER GÅET";
      progress.value = 0;
      return;
    }

    const secondsRemaining = Math.floor(distance / 1000);
    const minutes = Math.floor((secondsRemaining % 3600) / 60);
    const seconds = secondsRemaining % 60;

    displayTime.value = `${minutes}m ${seconds}s`;

    // Beregn procent tilbage
    progress.value = (secondsRemaining / totalSeconds) * 100;
  }, 1000);
}

function startCountdown() {
  const seconds = parseInt(inputSeconds.value);
  if (!isNaN(seconds) && seconds > 0) {
    clearInterval(timer);
    progress.value = 100;
    countDown(seconds);
    document.querySelector(".circle-wrapper").style.display = "inline";
  } else {
    displayTime.value = "Indtast et gyldigt tal";
  }
}

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<template>
  <div class="countdown-container">
    <input type="number" v-model="inputSeconds" placeholder="Indtast sekunder" />
    <button @click="startCountdown">Start timer</button>

    <div class="circle-wrapper">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" stroke="#555" stroke-width="12" fill="none" />
        <circle
          cx="60"
          cy="60"
          r="54"
          stroke="#8d1b3d"
          stroke-width="12"
          fill="none"
          stroke-linecap="round"
          :stroke-dasharray="339.292"
          :stroke-dashoffset="339.292 * (1 - progress / 100)"
          transform="rotate(-90 60 60)" />
      </svg>
      <div class="timer-text">{{ displayTime }}</div>
    </div>
  </div>
</template>

<style scoped>
.countdown-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: white;
}

.circle-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  display: none;
}

.timer-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: bold;
}
</style>
