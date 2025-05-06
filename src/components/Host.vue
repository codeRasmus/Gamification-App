<script setup>
import { ref, onMounted } from "vue";
import { io } from "socket.io-client";

const socket = io("http://localhost:5500");

const sessionId = ref(null);
const tasks = ref([]);
const selectedTaskIds = ref([]);
const teamStatus = ref({ Alpha: false, Beta: false, Delta: false, Sigma: false, Omega: false });

async function fetchTasks() {
  const res = await fetch("http://localhost:5500/api/tasks");
  const data = await res.json();
  tasks.value = data;
}

function createGame() {
  const id = Math.floor(100000 + Math.random() * 900000).toString();
  sessionId.value = id;
  socket.emit("host-join", { sessionId: id });
  fetchTasks();
}

function startGame() {
  if (selectedTaskIds.value.length === 0) {
    alert("Vælg mindst én opgave!");
    return;
  }

  socket.emit("start-game", {
    sessionId: sessionId.value,
    selectedTaskIds: selectedTaskIds.value,
  });
}

socket.on("team-update", (updatedTeams) => {
  for (const team in teamStatus.value) {
    teamStatus.value[team] = !!updatedTeams[team];
  }
});
</script>

<template>
  <div>
    <button v-if="!sessionId" @click="createGame">Åbn nyt spil</button>
    <h2 v-if="sessionId">Kode: {{ sessionId }}</h2>

    <div v-if="sessionId">
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

    <h3>Holdstatus:</h3>
    <ul>
      <li v-for="team in Object.keys(teamStatus)" :key="team">
        {{ team }}: {{ teamStatus[team] ? "Optaget" : "Ledig" }}
      </li>
    </ul>

    <button v-if="sessionId" @click="startGame">Start spillet</button>
  </div>
</template>
