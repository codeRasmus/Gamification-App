<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import socket from "../socket";

const router = useRouter();

const sessionInput = ref("");
const joined = ref(false);
const selectedTeam = ref(null);
const error = ref("");
const teams = ["Alpha", "Beta", "Delta", "Sigma", "Omega"];

let redirected = false;

socket.on("connect", () => {
  console.log("🧩 Player socket ID:", socket.id);
});

socket.on("joined", ({ teamName }) => {
  selectedTeam.value = teamName;
  localStorage.setItem("selectedTeam", teamName);
  localStorage.setItem("sessionId", sessionInput.value);
  console.log("✅ Joined team:", teamName);
});

socket.on("receive-task", (task) => {
  if (redirected) return;
  redirected = true;
  console.log("🚀 Received task:", task);
  localStorage.setItem("task", JSON.stringify(task));
  router.push("/task");
});

socket.on("error", (msg) => {
  error.value = msg;
  console.error("❌ Fejl:", msg);
});

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

  console.log("📤 Join request sendt:", sessionInput.value, team);
}
</script>

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
