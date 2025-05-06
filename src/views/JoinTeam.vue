<template>
  <div>
    <h1 v-if="!teamName">Vælg hold</h1>
    <h1 v-if="teamName">Joined as {{ teamName }}</h1>
    <div v-if="!teamName">
      <button @click="joinTeam('Alpha')">Hold Alpha</button>
      <button @click="joinTeam('Beta')">Hold Beta</button>
      <button @click="joinTeam('Delta')">Hold Delta</button>
      <button @click="joinTeam('Sigma')">Hold Sigma</button>
      <button @click="joinTeam('Omega')">Hold Omega</button>
    </div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import io from "socket.io-client";

export default {
  data() {
    return {
      socket: null,
      teamName: null,
      sessionId: null,
      error: null,
    };
  },
  mounted() {
    this.socket = io("http://localhost:5500");

    this.socket.on("joined", (data) => {
      this.teamName = data.teamName;
      this.sessionId = data.sessionId;
      this.error = null;
    });

    this.socket.on("game_start", (data) => {
      console.log(data.message); 

      
      this.redirectToGame();
    });

   
    this.socket.on("error", (message) => {
      this.error = message;
      this.teamName = null; 
      this.sessionId = null; 
      sessionStorage.removeItem("sessionId"); 
    });
  },
  methods: {
    joinTeam(team) {
     
      if (this.teamName) {
        this.teamName = null;
        this.error = null;
      }

      this.sessionId = team;
      sessionStorage.setItem("team", team);

      
      this.socket.emit("join-team", {
        teamName: team,
        sessionId: team,
      });
    },
    
    redirectToGame() {
      sessionStorage.setItem("team", this.teamName);

      // Redirect to the /Game page
      window.location.href = "/Game"; 
    },
  },
  beforeDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  },
};
</script>

<style scoped>
button {
  margin: 5px;
}
.error {
  color: red;
}
</style>
