<script setup>
import TaskComponent from "../components/TaskComponent.vue";
import Countdown from "../components/Countdown.vue";

import { ref, onMounted, onUnmounted } from "vue";
import { io } from "socket.io-client";

const socket = io("http://localhost:5500");

const selectedTeam = ref(localStorage.getItem("selectedTeam"));
const sessionId = localStorage.getItem("sessionId");

const seconds = ref(null);

let intervalId = null;

onMounted(() => {
  if (!selectedTeam || !sessionId) return;

  const fetchStatus = () => {
    socket.emit("get-session-status", { sessionId });
  };

  socket.on("session-status", (scoreboard) => {
    const serverTime = scoreboard[selectedTeam.value]?.time;
    if (typeof serverTime === "number") {
      seconds.value = serverTime;
    }
  });

  fetchStatus();
  intervalId = setInterval(fetchStatus, 1000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<template>
  <div>
    <div class="header">
      <img src="../assets/hjv_logo_hvid.png" />

      <h1>Militeam</h1>

      <div class="countdown-wrapper">
        <Countdown v-if="seconds > 0 && seconds !== null" :seconds="seconds" />
        <div v-else class="placeholder"></div>
      </div>
    </div>

    <div v-if="seconds > 0">
      <TaskComponent />
    </div>

    <div v-else-if="seconds === 0">
      <p style="text-align: center; font-weight: bold; color: #8d1b3d">Tiden er udløbet!</p>
    </div>
  </div>
</template>

<style scoped>
.header {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #3f5b58;
  color: white;
}

.header img {
  height: 70%;
  width: 50px;
}

.header h1 {
  font-size: 1.5rem;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  text-decoration: none;
  font-weight: bold;
  text-align: center;
  flex: 1;
  text-transform: uppercase;
}

.countdown-wrapper {
  width: 50px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.placeholder {
  width: 100px;
  height: 80px;
}
</style>
