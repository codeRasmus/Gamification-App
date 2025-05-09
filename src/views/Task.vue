<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import TaskComponent from "../components/TaskComponent.vue";
import Countdown from "../components/Countdown.vue";
import { io } from "socket.io-client";

const socket = io("http://localhost:5500");

const selectedTeam = ref(localStorage.getItem("selectedTeam"));
const sessionId = localStorage.getItem("sessionId");

const seconds = ref(null);
const taskAnswer = ref('');
const currentTask = ref({});
let intervalId = null;

watch(currentTask, (newTask, oldTask) => {
  console.log("currentTask changed:", newTask);
});

const storedTask = localStorage.getItem("task");
if (storedTask) {
  currentTask.value = JSON.parse(storedTask);
}

onMounted(() => {
  if (!selectedTeam.value || !sessionId) return;

  const fetchStatus = () => {
    socket.emit("get-session-status", { sessionId });
  };

  socket.on("session-status", (scoreboard) => {
    const serverTime = scoreboard[selectedTeam.value]?.time;
    if (typeof serverTime === "number") {
      seconds.value = serverTime;
    }
  });

  socket.on("next-task", (nextTask) => {
    taskAnswer.value = "";
    seconds.value = nextTask.Tid * 60;
    currentTask.value = nextTask;
    localStorage.setItem("task", JSON.stringify(nextTask));
    console.log("Next task received:", nextTask);
  });

  fetchStatus();
  intervalId = setInterval(fetchStatus, 1000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

const saveAnswer = (answer) => {
  if (answer && currentTask.value && currentTask.value._id) {
    const allAnswers = JSON.parse(localStorage.getItem("allAnswers")) || [];

    allAnswers.push({
      taskId: currentTask.value._id,
      answer: answer,
    });

    localStorage.setItem("allAnswers", JSON.stringify(allAnswers));
    console.log("Svar gemt i localStorage");

    socket.emit("next-task", { sessionId, teamName: selectedTeam.value });
    taskAnswer.value = "";
  }
};

const submitAllAnswers = () => {
  const allAnswers = JSON.parse(localStorage.getItem("allAnswers")) || [];

  if (allAnswers.length > 0) {
    const submission = {
      sessionId: sessionId,
      teamName: selectedTeam.value,
      answers: allAnswers,
      submittedAt: Date.now(),
    };

    fetch("http://localhost:5500/api/submission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Besvarelser indsendt:", data);
        localStorage.removeItem("allAnswers");
      })
      .catch((err) => {
        console.error("Fejl ved indsendelse af svar:", err);
      });
  }
};

socket.on("receive-task", (task) => {
  console.log(task);
  if (!task || !task.Tid) {
    console.log("Invalid task object:", task);
    return;
  }

  taskAnswer.value = ""; 
  seconds.value = task.Tid * 60;
  currentTask.value = task;
  localStorage.setItem("task", JSON.stringify(task));  
});
</script>

<template>
  <div>
    <div class="header">
      <img src="../assets/hjv_logo_hvid.png" />
      <h1>Militeam</h1>
      <div class="countdown-wrapper">
        <Countdown v-if="seconds > 0 && seconds !== null" :seconds="seconds" />
        <div v-else class="placeholder"></div>
      </div>
    </div>

    <div v-if="seconds > 0">
    
<TaskComponent
  v-if="currentTask && (currentTask.Spørgsmål || currentTask.title)"
  :task="currentTask"
  :key="currentTask._id"
/>
      <div v-else>
        <p>Ingen opgave fundet.</p> 
      </div>
     
      <div>
        <input 
          v-model="taskAnswer" 
          type="text" 
          placeholder="Skriv din besvarelse her" 
          style="margin-top: 20px; padding: 5px; width: 100%;" 
        />
      </div>
    </div>

    <div v-else-if="seconds === 0">
      <p style="text-align: center; font-weight: bold; color: #8d1b3d">Tiden er udløbet!</p>
    </div>

    <div v-if="seconds > 0">
      <button @click="saveAnswer(taskAnswer)" style="margin-top: 10px;">Aflever besvarelse</button>
    </div>

    <div>
      <!-- Skal først være synlig ved sidste besvarelse -->
      <button @click="submitAllAnswers" style="margin-top: 20px;">Aflever alle besvarelser</button>
    </div>
  </div>
</template>



<style scoped>
.header {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #3f5b58;
  color: white;
}

.header img {
  height: 70%;
  width: 50px;
}

.header h1 {
  font-size: 1.5rem;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  text-decoration: none;
  font-weight: bold;
  text-align: center;
  flex: 1;
  text-transform: uppercase;
}

.countdown-wrapper {
  width: 50px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.placeholder {
  width: 100px;
  height: 80px;
}
</style>
