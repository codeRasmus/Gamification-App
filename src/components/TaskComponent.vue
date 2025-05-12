<script setup>
import { ref, watch, computed } from "vue";

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});

const taskData = ref({ ...props.task });

const backgroundStyle = computed(() => {
  const sværhedsgrad = taskData.value?.Sværhedsgrad?.toLowerCase() || "";
  console.log("Sværhedsgrad:" + sværhedsgrad);

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
    <div class="taskInfo">
      <p>Kategori: {{ taskData.Kategori || taskData.category || "Ingen kategori" }}</p>
      <p>Tid: {{ taskData.Tid || taskData.timeLimit || 0 }} minutter</p>
      <p>Type: {{ taskData.Opgavetype || taskData.type || "Ukendt type" }}</p>
    </div>

    <div class="task">
      <h1>{{ taskData.Spørgsmål || taskData.title || "Default Titel" }}</h1>
    </div>
  </div>
</template>

<style scoped>
.task-container {
  width: 100%;
  min-height: 350px;
  text-align: left;
  padding: 2rem 0;
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
  margin: 5rem 1rem;
  padding: 10px;
}

.task h1 {
  color: white;
  font-size: 1rem;
}
</style>
