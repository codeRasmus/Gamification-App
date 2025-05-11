<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
});

const taskData = ref({ ...props.task });

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
  <div v-if="taskData">
    <h1>{{ taskData.Spørgsmål || taskData.title || 'Default Titel' }}</h1>
    <p>Kategori: {{ taskData.Kategori || taskData.category || 'Ingen kategori' }}</p>
    <p>Tid: {{ taskData.Tid || taskData.timeLimit || 0 }} minutter</p>
    <p>Type: {{ taskData.Opgavetype || taskData.type || 'Ukendt type' }}</p>
  </div>
</template>
