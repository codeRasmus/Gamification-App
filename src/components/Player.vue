<template>
  <div v-if="!joined">
    <input v-model="sessionInput" placeholder="Indtast kode" />
    <button @click="joinSession">Join</button>
  </div>

  <div v-else-if="!selectedTeam">
    <p>Vælg dit hold</p>
    <button v-for="team in teams" :key="team" @click="chooseTeam(team)">
      {{ team }}
    </button>
    <p v-if="error">{{ error }}</p>
  </div>

  <div v-else>
    <h2>Du er nu på hold {{ selectedTeam }}</h2>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { io } from "socket.io-client";

const router = useRouter();
const socket = io("http://localhost:5500");

onMounted(() => {
  socket.on("receive-task", (task) => {
    localStorage.setItem("task", JSON.stringify(task));
    router.push("/task");
  });
});

const sessionInput = ref("");
const joined = ref(false);
const selectedTeam = ref(null);
const error = ref("");
const teams = ["Alpha", "Beta", "Delta", "Sigma", "Omega"];

function joinSession() {
  joined.value = true;
}

function chooseTeam(team) {
  error.value = "";

  if (!team) {
    socket.emit("error", "Team-navn mangler");
    return;
  }

  socket.emit("join-team", {
    sessionId: sessionInput.value,
    teamName: team,
  });
}

socket.on("joined", ({ teamName }) => {
  selectedTeam.value = teamName;
  localStorage.setItem("selectedTeam", teamName);
  localStorage.setItem("sessionId", sessionInput.value);
});

socket.on("error", (msg) => {
  error.value = msg;
});
</script>
