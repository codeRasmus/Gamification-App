<script setup>
import { ref, watch, computed } from "vue";
import { Clock } from "lucide-vue-next";

// Task prop som kommer fra Task.vue
// Nødvendigt for at kunne vise tasks
const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});

const taskData = ref({ ...props.task });
const selectedTeam = ref(localStorage.getItem("selectedTeam"));
const greekLetters = computed(() => ({
  Alpha: "Α",
  Beta: "Β",
  Delta: "Δ",
  Sigma: "Σ",
  Omega: "Ω",
}));

// Computed til ændring af baggrund af task baseret på sværhedsgrad
const backgroundStyle = computed(() => {
  const sværhedsgrad = taskData.value?.Sværhedsgrad?.toLowerCase() || "";

  if (sværhedsgrad.includes("let")) {
    return {
      backgroundImage: "url('/src/assets/let.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  } else if (sværhedsgrad.includes("middel")) {
    return {
      backgroundImage: "url('/src/assets/middel.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  } else {
    return {
      backgroundImage: "url('/src/assets/svaer.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
});

// Watcher der kigger på om task bliver opdateret
watch(
  () => props.task,
  (newVal) => {
    taskData.value = { ...newVal };
    console.log("🔄 TaskComponent opdateret med task ID:", newVal?._id);
  },
  { immediate: true }
);
</script>

<template>
  <div v-if="taskData" :style="backgroundStyle" class="task-container">
    <div class="team">
      <div class="icon">
        <h1>{{ greekLetters[selectedTeam] }}</h1>
      </div>
    </div>
    <div class="taskInfo">
      <p>Kategori: {{ taskData.Kategori || taskData.category || "Ingen kategori" }}</p>
      <div class="time">
        <Clock :stroke-width="3" />
        <p>{{ taskData.Tid || taskData.timeLimit || 0 }} minutter</p>
      </div>
      <p>Opgavetype: {{ taskData.Opgavetype || taskData.type || "Ukendt type" }}</p>
    </div>

    <div class="task">
      <h1>{{ taskData.Spørgsmål || taskData.title || "Default Titel" }}</h1>
    </div>
  </div>
</template>

<style scoped>
.task-container {
  width: 100%;
  min-height: 250px;
  max-height: 350px;
  text-align: left;
  padding: 1rem 0 2rem 0;
}

.taskInfo {
  padding: 0 1rem;
}

.task-container p {
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  margin: 0.5rem 0;
}

.task {
  background-color: #8d1b3d;
  margin: 2rem 1rem;
  padding: 20px 15px;
  line-height: 1.4;
}

.task h1 {
  color: white;
  font-size: 1rem;
}

.time {
  color: white;
  display: flex;
  align-items: center;
  gap: 5px;
}

.icon {
  color: white;
  background-color: #8d1b3d;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 100%;
  margin: 0 1rem;
  border: 2px solid white;
}

.icon h1 {
  font-weight: normal;
}
</style>
