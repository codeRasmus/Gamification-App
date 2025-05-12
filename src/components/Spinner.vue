<template>
  <div class="spinner-container">
    <svg class="circle-svg" :height="size" :width="size">
      <circle :cx="center" :cy="center" :r="radius" />
    </svg>
  </div>
</template>

<script setup>
const radius = 50;
const center = 100;
const size = 200;
const PI = 3.14159265358979;
const circumference = PI * radius * 2;
</script>

<style scoped>
.spinner-container {
  display: flex;
  flex-flow: column;
  align-items: center;
  font-family: sans-serif;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

h1 {
  color: #444;
}
.circle-svg circle {
  stroke: #8d1b3d;
  stroke-width: 8;
  fill: transparent;
  transform-origin: center;
  stroke-dasharray: 314.159; /* π * 50 * 2 */
  animation: spinner 2s ease-out infinite;
}

@keyframes spinner {
  from {
    stroke-dashoffset: 314.159;
    stroke: #8d1b3d;
    transform: rotateZ(0deg);
  }
  to {
    stroke-dashoffset: -314.159;
    stroke: #551025;
    transform: rotateZ(720deg);
  }
}
</style>
