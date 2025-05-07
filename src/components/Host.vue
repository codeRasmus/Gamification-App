<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { io } from "socket.io-client";

const socket = io("http://localhost:5500");

const sessionId = ref(null);
const tasks = ref([]);
const selectedTaskIds = ref([]);
const teamStatus = ref({
  Alpha: false,
  Beta: false,
  Delta: false,
  Sigma: false,
  Omega: false,
});
const scoreboard = ref({});
const intervalId = ref(null);
const gameStarted = ref(false);
const gameCreated = ref(false);

async function fetchTasks() {
  const res = await fetch("http://localhost:5500/api/tasks");
  const data = await res.json();
  tasks.value = data;
}

function getSessionStatus() {
  socket.emit("get-session-status", { sessionId: sessionId.value });
}

function formatTime(seconds) {
  if (!seconds || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function createGame() {
  const id = Math.floor(100000 + Math.random() * 900000).toString();
  sessionId.value = id;
  socket.emit("host-join", { sessionId: id });
  gameCreated.value = true;
  fetchTasks();
}

function startGame() {
  if (selectedTaskIds.value.length === 0) {
    alert("Vælg mindst én opgave!");
    return;
  }

  gameStarted.value = true;

  socket.emit("start-game", {
    sessionId: sessionId.value,
    selectedTaskIds: selectedTaskIds.value,
  });

  intervalId.value = setInterval(() => {
    getSessionStatus();
  }, 1000);

  getSessionStatus();
}

onBeforeUnmount(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
  }
});

socket.on("session-status", (data) => {
  scoreboard.value = data;
});

socket.on("team-update", (updatedTeams) => {
  for (const team in teamStatus.value) {
    teamStatus.value[team] = !!updatedTeams[team];
  }
});
</script>

<template>
  <div class="container">
    <h2 class="title" v-show="!gameCreated">Start nyt spil</h2>
    <button v-if="!sessionId" @click="createGame">Åbn nyt spil</button>
    <div class="sessionDetails" v-show="gameCreated && !gameStarted">
      <h2>Kode: {{ sessionId }}</h2>

      <div class="task-selection">
        <h3>Vælg opgaver:</h3>
        <ul>
          <li v-for="task in tasks" :key="task._id">
            <label>
              <input type="checkbox" :value="task._id" v-model="selectedTaskIds" />
              {{ task.Spørgsmål || task.title }}
            </label>
          </li>
        </ul>
      </div>

      <div class="team-status">
        <h3>Holdstatus:</h3>
        <ul>
          <li v-for="team in Object.keys(teamStatus)" :key="team">
            {{ team }}:
            <span :class="{ taken: teamStatus[team] }">
              {{ teamStatus[team] ? "Optaget" : "Ledig" }}
            </span>
          </li>
        </ul>
      </div>

      <button @click="startGame">Start spillet</button>
    </div>

    <div class="scoreboard" v-show="gameStarted">
      <h3>Spil {{ sessionId }} - Overblik</h3>
      <h4 v-show="gameCreated && !gameStarted">Kode: {{ sessionId }}</h4>
      <table v-if="Object.keys(scoreboard).length > 0">
        <thead>
          <tr>
            <th>Hold</th>
            <th>Opgave</th>
            <th>Tid</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(info, teamName) in scoreboard" :key="teamName">
            <td>{{ teamName }}</td>
            <td>{{ info.task?.Spørgsmål || info.task?.title || "Ingen opgave" }}</td>
            <td>
              <span v-if="info.time > 0">{{ formatTime(info.time) }}</span>
              <span v-else>Tid udløbet</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
* {
  font-family: Verdana, sans-serif;
  box-sizing: border-box;
}

.team-status {
  margin: 2rem 0;
}

.container {
  width: 100%;
  padding: 1rem;
  color: #000;
  background-color: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.sessionDetails,
.task-selection,
.team-status,
.scoreboard {
  margin-bottom: 2rem;
}

h2,
h3 {
  margin-bottom: 1rem;
  font-weight: bold;
  color: #000;
}

ul {
  list-style-type: none;
  padding-left: 0;
}

li {
  margin-bottom: 0.5rem;
}

label {
  cursor: pointer;
}

input[type="checkbox"] {
  margin-right: 0.5rem;
}

button {
  padding: 0.8rem 1.5rem;
  background-color: #8d1b3d;
  color: white;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
  width: 100%;
}

button:hover {
  background-color: #551025;
  transform: scale(1.05);
}

button:focus {
  outline: none;
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  color: black;
}

th,
td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ccc;
}

.taken {
  color: #8d1b3d;
  font-weight: bold;
}
</style>
