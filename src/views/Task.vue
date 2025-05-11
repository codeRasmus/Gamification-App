<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
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

  checkGameCompletion();
});

const checkGameCompletion = () => {
  console.log("Tjekker om spillet er afsluttet, gameCompleted:", session.gameCompleted);
  console.log("Session currentIndex:", session.currentIndex);
  console.log("Session taskQueue:", session.taskQueue);
  const isLastTask = session.currentIndex >= session.taskQueue.length - 1;
  if (isLastTask) {
    session.gameCompleted = true;
  } else {
    session.gameCompleted = false;
  }
};

watch(() => session.gameCompleted, (newValue) => {
  console.log("Game Completed status changed:", newValue);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

const saveAnswerAndContinue = () => {
  session.saveAnswer(selectedTeam.value, sessionId);
  checkGameCompletion();  
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

    <div class="task-container">
      <div v-if="seconds > 0 && currentTask" class="task-section">
        <p>🆔 task ID: {{ currentTask._id }}</p>
        <TaskComponent :task="currentTask" :key="session.componentKey" />
        <input v-model="session.taskAnswer" type="text" placeholder="Skriv din besvarelse her" />
        <button @click="saveAnswerAndContinue">
          Aflever besvarelse
        </button>
      </div>

      <div v-if="session.gameCompleted" class="completed-tasks">
        <h2>Spillet er afsluttet!</h2>
        <h3>Dine besvarelser:</h3>
        <ul>
          <li v-for="(ans, index) in allAnswers" :key="index">
            Opgave {{ index + 1 }}: "{{ ans.answer }}"
          </li>
        </ul>
        <button @click="submitAll">
          Indsend alle besvarelser
        </button>
      </div>

      <div v-else-if="seconds === 0" class="time-up">
        <p>
          Tiden er udløbet!
        </p>
      </div>
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

/* Task Container */
.task-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  margin: 2rem;
}

/* Task Section */
.task-section p {
  font-size: 1.2rem;
  color: #333;
}

.task-section input {
  padding: 0.8rem;
  border: 1px solid #ccc;
  font-size: 1rem;
  background-color: #f9f9f9;
  margin-top: 20px;
  width: 100%;
  transition: border-color 0.3s ease;
}

.task-section input:focus {
  border-color: #8d1b3d;
  outline: none;
}

.task-section button {
  padding: 1rem 2rem;
  background-color: #8d1b3d;
  color: white;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10
}

.completed-tasks {
  background-color: #f1f5f4;

  padding: 2rem;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  animation: fadeIn 0.5s ease-in-out;
}

.completed-tasks h2 {
  color: #8d1b3d;
  font-size: 2rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

.completed-tasks h3 {
  color: #3f5b58;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.completed-tasks ul {
  padding-left: 0;
  text-align: left;
  margin-bottom: 1.5rem;
}

.completed-tasks li {
  background-color: #ffffff;
  margin-bottom: 0.5rem;
  padding: 0.8rem 1rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 1rem;
  color: #333;
}

.completed-tasks button {
  padding: 1rem 2rem;
  background-color: #3f5b58;
  color: white;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.completed-tasks button:hover {
  background-color: #2e4744;
}
</style>
