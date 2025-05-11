<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useSessionStore } from "../stores/session";
import TaskComponent from "../components/TaskComponent.vue";
import Countdown from "../components/Countdown.vue";
import socket from "../socket";

const session = useSessionStore();

const selectedTeam = ref(localStorage.getItem("selectedTeam"));
const sessionId = localStorage.getItem("sessionId");

const currentTask = computed(() => session.currentTask);
const taskAnswer = computed(() => session.taskAnswer);
const seconds = computed(() => session.seconds);
const currentIndex = computed(() => session.currentIndex);
const noMoreTasks = computed(() => !currentTask.value && seconds.value !== null);
const allAnswers = computed(() => JSON.parse(localStorage.getItem("allAnswers") || "[]"));

let intervalId = null;

onMounted(() => {
  if (!selectedTeam.value || !sessionId) return;

  session.restoreTaskFromStorage();

  const fetchStatus = () => {
    socket.emit("get-session-status", { sessionId });
  };

  socket.on("session-status", (scoreboard) => {
    session.updateTimerFromScoreboard(scoreboard, selectedTeam.value);
  });

  socket.on("receive-task", (task) => {
    console.log("🔥 Modtaget ny opgave:", task);
    if (task?.Tid) session.setCurrentTask(task);
  });

  fetchStatus();
  intervalId = setInterval(fetchStatus, 1000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

const saveAnswerAndContinue = () => {
  session.saveAnswer(selectedTeam.value, sessionId);
};

const submitAll = () => {
  session.submitAllAnswers(sessionId, selectedTeam.value);
  localStorage.removeItem("allAnswers");
};
</script>

<template>
  <div>
    <div class="header">
      <img src="../assets/hjv_logo_hvid.png" />
      <h1>Militeam</h1>
      <div class="countdown-wrapper">
        <Countdown v-if="seconds > 0 && seconds !== null" :seconds="seconds" :key="seconds" />
        <div v-else class="placeholder"></div>
      </div>
    </div>

    <div v-if="seconds > 0 && currentTask">
      <p>🆔 task ID: {{ currentTask._id }}</p>
      <TaskComponent :task="currentTask" :key="session.componentKey" />
      <input v-model="session.taskAnswer" type="text" placeholder="Skriv din besvarelse her"
        style="margin-top: 20px; padding: 5px; width: 100%;" />
      <button @click="saveAnswerAndContinue" style="margin-top: 10px;">
        Aflever besvarelse
      </button>
    </div>

    <div v-else-if="noMoreTasks">
      <h2>✔️ Du har besvaret alle opgaver!</h2>
      <h3>Dine svar:</h3>
      <ul>
        <li v-for="(ans, index) in allAnswers" :key="index">
          📝 Opgave {{ index + 1 }}: "{{ ans.answer }}"
        </li>
      </ul>
      <button @click="submitAll" style="margin-top: 20px;">
        Indsend alle besvarelser
      </button>
    </div>

    <div v-else-if="seconds === 0">
      <p style="text-align: center; font-weight: bold; color: #8d1b3d">
        Tiden er udløbet!
      </p>
    </div>

    <div v-if="seconds > 0 && currentTask">
      <button @click="session.submitAllAnswers(sessionId, selectedTeam)" style="margin-top: 20px;">
        Aflever alle besvarelser
      </button>
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
