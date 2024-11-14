<template>
    <div v-if="message" class="toast">
        {{ message }}
    </div>
</template>

<script setup>
import { ref } from 'vue';

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
}
</style>