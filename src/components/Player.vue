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
import { ref } from "vue";
import { io } from "socket.io-client";

const socket = io("http://localhost:5500");

const sessionInput = ref("");
const joined = ref(false);
const selectedTeam = ref(null);
const error = ref("");
const teams = ["Alpha", "Beta", "Delta", "Sigma", "Omega"];

function joinSession() {
  socket.emit("join-team", {
    sessionId: sessionInput.value,
    teamName: "", // sendes tomt – vi vælger team bagefter
  });
  joined.value = true;
}

function chooseTeam(team) {
  error.value = "";
  socket.emit("join-team", {
    sessionId: sessionInput.value,
    teamName: team,
  });
}

socket.on("joined", ({ teamName }) => {
  selectedTeam.value = teamName;
});

socket.on("error", (msg) => {
  error.value = msg;
});

socket.on("receive-task", (task) => {
  console.log("Din opgave:", task);
  localStorage.setItem("task", JSON.stringify(task));
  router.push("/task");
});
</script>
