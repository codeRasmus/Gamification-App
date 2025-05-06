<script setup>
import { ref, onMounted } from "vue";

const task = ref(null);

onMounted(() => {
  const stored = localStorage.getItem("task");
  if (stored) {
    task.value = JSON.parse(stored);
  }
});
</script>

<template>
  <div v-if="task">
    <h1>{{ task.Spørgsmål || task.title }}</h1>
    <p>Kategori: {{ task.Kategori || task.category }}</p>
    <p>Tid: {{ task.Tid || task.timeLimit }} sekunder</p>
    <p>Type: {{ task.Opgavetype || task.type }}</p>
  </div>
</template>
