<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useSessionStore } from "../stores/session";
import TaskComponent from "../components/TaskComponent.vue";
import Countdown from "../components/Countdown.vue";
import socket from "../socket";
import Spinner from "../components/Spinner.vue";
import { useRouter } from "vue-router";

const session = useSessionStore();
const router = useRouter();

const selectedTeam = ref(localStorage.getItem("selectedTeam"));
const showSpinner = ref(false);
const showThankYou = ref(false);
const sessionId = localStorage.getItem("sessionId");

const currentTask = computed(() => session.currentTask);
const taskAnswer = computed(() => session.taskAnswer);
let seconds = computed(() => session.seconds);
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

  socket.on("no-more-tasks", () => {
    console.log("✅ Modtaget 'no-more-tasks' fra server");
    session.currentTask = null;
    session.gameCompleted = true;
    seconds = null;
  });

  fetchStatus();
  intervalId = setInterval(fetchStatus, 1000);
});

watch(
  () => session.gameCompleted,
  (newValue) => {
    console.log("Game Completed status changed:", newValue);
  }
);

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

const saveAnswerAndContinue = () => {
  session.saveAnswer(selectedTeam.value, sessionId);
};

const submitAll = () => {
  showSpinner.value = true;
  session.submitAllAnswers(sessionId, selectedTeam.value);
  localStorage.removeItem("allAnswers");
  setTimeout(() => {
    showSpinner.value = false;
    showThankYou.value = true;
  }, 2000);
  setTimeout(() => {
    router.push("/");
  }, 6000);
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
      <div v-if="seconds >= 0 && currentTask && !session.gameCompleted" class="task-section">
        <TaskComponent :task="currentTask" :key="session.componentKey" />
        <input v-model="session.taskAnswer" type="text" placeholder="Skriv din besvarelse her" class="answerInput" />
        <button @click="saveAnswerAndContinue">Aflever besvarelse</button>
      </div>

      <div v-else-if="session.gameCompleted" class="completed-tasks">
        <ul v-if="!showThankYou" class="completed-tasks-ul">
          <h2>Spillet er afsluttet!</h2>
          <h3>Dine besvarelser:</h3>
          <li v-for="(ans, index) in allAnswers" :key="index">
            <h4>Svar på: "{{ ans.question }}"</h4>
            <br />
            <em>Svar:</em> "{{ ans.answer }}"
          </li>
        </ul>
        <button v-if="!showSpinner && !showThankYou" @click="submitAll">Indsend alle besvarelser</button>

        <Spinner v-if="showSpinner" />

        <div v-if="showThankYou">
          <h1 class="thankYou">Tak fordi du spillede med!</h1>
        </div>
      </div>

      <div v-else-if="seconds === 0" class="time-up">
        <p>Tiden er udløbet!</p>
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
}

/* Task Section */

.task-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.task-section p {
  font-size: 1.2rem;
  color: #333;
}

.task-section input {
  border: 1px solid #ccc;
  font-size: 1rem;
  background-color: #f9f9f9;
  margin-top: 20px;
  width: 80%;
  transition: border-color 0.3s ease;
  padding: 10px;
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
  margin-top: 10;
}

.thankYou {
  color: #8d1b3d;
  font-size: 2rem;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  font-weight: bold;
  text-align: center;
}

.completed-tasks {
  background-color: #f1f5f4;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.5s ease-in-out;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.completed-tasks-ul h2 {
  color: #8d1b3d;
  font-size: 2rem;
  margin-bottom: 1rem;
  font-weight: bold;
  text-align: center;
}

.completed-tasks-ul h3 {
  color: #3f5b58;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  text-align: center;
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
  list-style: none;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
}

.completed-tasks button {
  padding: 1rem 2rem;
  background-color: #3f5b58;
  color: white;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.completed-tasks button:hover {
  background-color: #2e4744;
}
</style>
