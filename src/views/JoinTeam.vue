<template>
  <div>
    <h1 v-if="!teamName">Vælg hold</h1>
    <h1 v-else>Joined as {{ teamName }}</h1>

    <div v-if="!teamName">
      <input v-model="sessionIdInput" placeholder="Indtast sessionskode (fx 123456)" />
      <div style="margin-top: 10px">
        <button @click="joinTeam('Alpha')">Hold Alpha</button>
        <button @click="joinTeam('Beta')">Hold Beta</button>
        <button @click="joinTeam('Delta')">Hold Delta</button>
        <button @click="joinTeam('Sigma')">Hold Sigma</button>
        <button @click="joinTeam('Omega')">Hold Omega</button>
      </div>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import socket from "../socket"; // ✅ din socket.js klient

const sessionIdInput = ref("");
const teamName = ref(null);
const sessionId = ref(null);
const error = ref(null);

onMounted(() => {
  socket.on("joined", ({ teamName: team, sessionId: id }) => {
    teamName.value = team;
    sessionId.value = id;
    error.value = null;
    sessionStorage.setItem("sessionId", id);
    sessionStorage.setItem("team", team);
  });

  socket.on("game_start", () => {
    window.location.href = "/Game";
  });

  socket.on("error", (message) => {
    error.value = message;
    teamName.value = null;
    sessionId.value = null;
    sessionStorage.removeItem("sessionId");
  });
});

const joinTeam = (team) => {
  if (!sessionIdInput.value || sessionIdInput.value.length !== 6) {
    error.value = "Ugyldig sessionskode. Den skal være 6 cifre.";
    return;
  }

  socket.emit("join-team", {
    teamName: team,
    sessionId: sessionIdInput.value,
  });
};
</script>

<style scoped>
button {
  margin: 5px;
}
.error {
  color: red;
  margin-top: 10px;
}
</style>
