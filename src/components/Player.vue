<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import socket from "../socket";
import { useSessionStore } from "../stores/session";

const router = useRouter();
const session = useSessionStore();
const sessionInput = ref("");
const error = ref("");
const teams = ["Alpha", "Beta", "Delta", "Sigma", "Omega"];

let redirected = false;

socket.on("connect", () => {
  console.log("🧩 Player socket ID:", socket.id);
});

socket.on("joined", ({ teamName }) => {
  session.setJoinedTeam(teamName);
  localStorage.removeItem("task");
  localStorage.removeItem("allAnswers");
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

socket.on("session-valid", () => {
  session.sessionCodeConfirmed = true;
  console.log("✅ Session eksisterer");
});

socket.on("session-not-found", () => {
  error.value = "Session findes ikke. Tjek den 6-cifrede kode.";
  session.sessionCodeConfirmed = false;
});

function joinSession() {
  if (!sessionInput.value || sessionInput.value.length !== 6) {
    error.value = "Indtast en gyldig 6-cifret kode";
    return;
  }

  error.value = "";
  // Gem midlertidigt
  session.sessionId = sessionInput.value;

  // Emit validering til backend
  socket.emit("validate-session", { sessionId: sessionInput.value });
}

function chooseTeam(team) {
  error.value = "";

  if (!team) {
    error.value = "Team-navn mangler";
    return;
  }

  socket.emit("join-team", {
    sessionId: session.sessionId,
    teamName: team,
  });

  console.log("📤 Join request sendt:", session.sessionId, team);
}
</script>

<template>
  <div class="join-session-container">
    <h1>Lobby</h1>
    <div v-if="!session.sessionCodeConfirmed" class="container">
      <input v-model="sessionInput" placeholder="Indtast kode" />
      <button @click="joinSession">Join</button>
    </div>

    <div v-else-if="!session.selectedTeamName" class="team-selection">
      <p>Vælg dit hold</p>
      <button v-for="team in teams" :key="team" @click="chooseTeam(team)">
        {{ team }}
      </button>
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>

    <div v-else>
      <h2>Du er nu på hold {{ session.selectedTeamName }}</h2>
    </div>
  </div>
</template>

<style scoped>
.join-session-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
}

h1 {
  font-size: 3rem;
  color: white;
  font-weight: 300;
}

input {
  padding: 1rem;
  border: 1px solid #ccc;

  font-size: 1rem;
  background-color: #ffffff;
  margin-bottom: 1.5rem;
  width: 300px;
  transition: border-color 0.3s ease;
}

input:focus {
  border-color: #8d1b3d;
  outline: none;
}

button {
  padding: 1rem 2rem;
  background-color: #8d1b3d;
  color: white;
  border: none;

  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
  width: 300px;
  margin-bottom: 1rem;
}

button:hover {
  background-color: #551025;
  transform: scale(1.05);
}

button:focus {
  outline: none;
}

p {
  color: #e74c3c;
  font-weight: bold;
  margin-top: 1rem;
}

.team-selection p {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: white;
}

.team-selection button {
  background-color: #34495e;
}

.team-selection button:hover {
  background-color: #2c3e50;
}

.team-selection {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

h2 {
  color: #2ecc71;
  font-size: 1.5rem;
  margin-top: 1.5rem;
  font-weight: 700;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  margin-top: 2rem;
}
</style>
