<template>
  <div v-if="message" class="toast">
      {{ message }}
  </div>
</template>

<script setup>
const props = defineProps({ message: String });
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #f44336;
  color: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: fadeInOut 4s ease-in-out;
}

@keyframes fadeInOut {
0%,
100% {
  opacity: 0;
}
10%,
90% {
  opacity: 1;
}
}
</style>
