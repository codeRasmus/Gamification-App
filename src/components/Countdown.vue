<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  seconds: {
    type: Number,
    required: true,
  },
});

const displayTime = ref("");
const progress = ref(100);
const totalSeconds = ref(props.seconds);

watch(
  () => props.seconds,
  (newSeconds) => {
    if (typeof newSeconds !== "number" || isNaN(newSeconds)) {
      displayTime.value = "Ugyldig tid";
      progress.value = 0;
      return;
    }

    if (newSeconds <= 0) {
      displayTime.value = "TIDEN ER GÅET";
      progress.value = 0;
    } else {
      displayTime.value = formatTime(newSeconds);
      progress.value = (newSeconds / totalSeconds.value) * 100;
    }
  },
  { immediate: true }
);

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
</script>

<template>
  <div class="countdown-container">
    <div class="circle-wrapper">
      <svg width="70" height="70" viewBox="0 0 120 120">
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
  align-items: end;
  gap: 1rem;
  color: white;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
}

.circle-wrapper {
  position: relative;
  width: 70px;
  height: 70px;
}

.timer-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: bold;
}
</style>
