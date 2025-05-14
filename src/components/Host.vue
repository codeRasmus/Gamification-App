<script setup>
import { onMounted, onBeforeUnmount, computed, ref, h } from "vue";
import socket from "../socket";
import { useSessionStore } from "../stores/session";
import { CheckSquare, Square } from "lucide-vue-next";
const session = useSessionStore();

const intervalId = ref(null);

// Computed proxies for reactive store state
const sessionId = computed(() => session.sessionId);
const tasks = computed(() => session.tasks);
const selectedTaskIds = computed(() => session.selectedTaskIds);
const teamStatus = computed(() => session.teamStatus);
const scoreboard = computed(() => session.scoreboard);
const gameStarted = computed(() => session.gameStarted);
const gameCreated = computed(() => session.gameCreated);
const hasConnectedTeam = computed(() => Object.values(session.teamStatus).some((status) => status === true));

async function fetchTasks() {
  const res = await fetch("http://localhost:5500/api/tasks");
  const data = await res.json();
  session.setTasks(data);
}

function getSessionStatus() {
  socket.emit("get-session-status", { sessionId: session.sessionId });
}

function formatTime(seconds) {
  if (!seconds || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function createGame() {
  session.createSession();
  socket.emit("host-join", { sessionId: session.sessionId });
  fetchTasks();
}

function startGame() {
  if (!session.startGame()) {
    alert("Vælg mindst én opgave!");
    return;
  }

  socket.emit("start-game", {
    sessionId: session.sessionId,
    selectedTaskIds: session.selectedTaskIds,
  });

  intervalId.value = setInterval(() => {
    getSessionStatus();
  }, 1000);

  getSessionStatus();
}

onBeforeUnmount(() => {
  if (intervalId.value) clearInterval(intervalId.value);
});

socket.on("session-status", (data) => {
  session.updateScoreboard(data);
});

socket.on("team-update", (updatedTeams) => {
  session.updateTeamStatus(updatedTeams);
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
        <div v-if="tasks.length === 0">
          <p>Ingen opgaver fundet</p>
        </div>
        <ul>
          <li v-for="task in tasks" :key="task._id">
            <label>
              <input
                type="checkbox"
                :value="task._id"
                :checked="selectedTaskIds.includes(task._id)"
                @change="session.toggleTaskSelection(task._id)" />
              {{ task.Spørgsmål || task.title }}
            </label>
          </li>
        </ul>
      </div>

      <div id="breaker"></div>

      <div class="team-status">
        <ul>
          <li v-for="team in Object.keys(teamStatus)" :key="team">
            {{ team }}:
            <span class="icon" :class="{ taken: teamStatus[team] }">
              <component
                :is="teamStatus[team] ? CheckSquare : Square"
                class="w-5 h-5"
                :title="teamStatus[team] ? 'Optaget' : 'Ledig'"
                :size="32" />
            </span>
          </li>
        </ul>
      </div>
      <p style="text-align: center; font-size: 12px" v-if="!hasConnectedTeam">
        Vent på, at et hold tilslutter sig for at starte spillet.
      </p>
      <button v-if="hasConnectedTeam" :disabled="!hasConnectedTeam" @click="startGame">Start spillet</button>
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
  accent-color: #8d1b3d;
  transform: scale(2);
  margin: 10px;
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

#breaker {
  width: 100%;
  height: 2px;
  background-color: #8d1b3d;
}

.team-status {
  display: flex;
  justify-content: center;
  width: 100%;
}

.team-status ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.team-status li {
  width: 150px;
  font-size: 24px;
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.icon {
  display: inline-block;
  margin-right: 0.5rem;
}

.icon svg {
  color: #8d1b3d;
}

.icon.taken svg {
  color: #3f5b58;
}
</style>
