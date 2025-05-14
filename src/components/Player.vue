<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import socket from "../socket";
import { useSessionStore } from "../stores/session";

const router = useRouter();
const session = useSessionStore();
const sessionInput = ref("");
const error = ref("");
const teams = ["Alpha", "Beta", "Delta", "Sigma", "Omega"];
const greekLetters = computed(() => ({
  Alpha: "Α",
  Beta: "Β",
  Delta: "Δ",
  Sigma: "Σ",
  Omega: "Ω",
}));

let redirected = false;

// Socket listener til player join. Fjerner bl.a. task og allAnswers i localStorage.
// Sætter samtidig et hold og hvilken session man er i, til localStorage.
socket.on("joined", ({ teamName }) => {
  session.setJoinedTeam(teamName);
  localStorage.removeItem("task");
  localStorage.removeItem("allAnswers");
  localStorage.setItem("selectedTeam", teamName);
  localStorage.setItem("sessionId", sessionInput.value);
});

// Socket listener til at man modtager en opgave
// Hvis det er første gang, sender den en til /task
socket.on("receive-task", (task) => {
  if (redirected) return;
  redirected = true;
  localStorage.setItem("task", JSON.stringify(task));
  router.push("/task");
});

// Socket listener til fejl
socket.on("error", (msg) => {
  error.value = msg;
  console.error("❌ Fejl:", msg);
});

// Socket listener fra server til om ens session er valid
socket.on("session-valid", () => {
  session.sessionCodeConfirmed = true;
});

// Socket listener til hvis sessionen ikke er fundet
// Bruges til at man ikke kan tilkoble en ikke-eksisterende session
socket.on("session-not-found", () => {
  error.value = "Session findes ikke. Tjek den 6-cifrede kode.";
  session.sessionCodeConfirmed = false;
});

// Funktion til tilkobling af session
function joinSession() {
  if (!sessionInput.value || sessionInput.value.length !== 6) {
    error.value = "Indtast en gyldig 6-cifret kode";
    return;
  }

  error.value = "";
  session.sessionId = sessionInput.value;
  socket.emit("validate-session", { sessionId: sessionInput.value });
}

// Funktion til håndtering af holdvalg
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
}
</script>

<template>
  <div class="join-session-container">
    <h1>Lobby</h1>

    <div v-if="!session.sessionCodeConfirmed" class="container">
      <p v-if="error" class="error-message">{{ error }}</p>

      <input v-model="sessionInput" placeholder="Indtast kode" />
      <p style="color: white; font-weight: 300">Du modtager spilkoden af Game Masteren</p>
      <button @click="joinSession">Join</button>
    </div>

    <div v-else-if="!session.selectedTeamName" class="team-selection">
      <p>Vælg dit hold</p>
      <button class="selectTeamNames" v-for="team in teams" :key="team" @click="chooseTeam(team)">
        {{ greekLetters[team] || team }}
      </button>
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>

    <div v-else>
      <h2>Du har valgt {{ session.selectedTeamName }}</h2>
      <h3>Afvent at Game Master starter</h3>
      <h4>⏳</h4>
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
}

button:focus {
  outline: none;
}

p {
  color: #e74c3c;
  margin-top: 0.5rem;
}

.error-message {
  color: white;
  font-size: 1.1rem;
  animation-name: blinkEffect;
  animation-duration: 0.5s;
  animation-iteration-count: 2;
}

.team-selection p {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: white;
}

@keyframes blinkEffect {
  0% {
    color: white;
  }
  50% {
    color: #8d1b3d;
  }
  100% {
    color: white;
  }
}
.team-selection button {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #34495e;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
  text-align: center;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.team-selection button:hover {
  background-color: #2c3e50;
}

.team-selection button:focus {
  outline: none;
}

.team-selection {
  display: flex;
  flex-direction: column;

  align-items: center;
}

h2 {
  color: #2ecc71;
  font-size: 1.5rem;
  margin-top: 1.5rem;
  font-weight: 700;
}
h3 {
  color: #fff;
  font-size: 1rem;
  margin-top: 1.5rem;
  font-weight: 300;
  text-align: center;
}
h4 {
  font-size: 6rem;
  text-align: center;
  margin-top: 1.5rem;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
}
</style>
