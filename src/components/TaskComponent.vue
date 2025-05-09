<script setup>
const props = defineProps({ task: Object });
console.log("TaskComponent modtog:", props.task);
</script>

<template>
  <div v-if="task">
    <h1>{{ task.Spørgsmål || task.title || 'Default Titel' }}</h1>
    <p>Kategori: {{ task.Kategori || task.category || 'Ingen kategori' }}</p>
    <p>Tid: {{ task.Tid || task.timeLimit || 0 }} minutter</p>
    <p>Type: {{ task.Opgavetype || task.type || 'Ukendt type' }}</p>
  </div>
</template>