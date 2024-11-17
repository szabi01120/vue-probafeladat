<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import cookieUtils from '../utils/cookieUtils';
import startSessionCountdown from '../utils/countdownUtil';
import formatTimeout from '@/utils/timeUtils';

const API_URL = import.meta.env.VITE_API_URL;

const props = defineProps(['isLoggedIn', 'user', 'initialSessionTimeout']);
const emit = defineEmits(['loginSuccess', 'is2FaRequired', 'showToast']);

const sessionTimeout = ref(props.initialSessionTimeout);

let countdownInterval = null;
let countdownController = null;

function startCountdown(timeout) {
  clearInterval(countdownInterval);

  countdownController = startSessionCountdown(timeout, () => {
    emit('loginSuccess');
    emit('showToast', 'A munkamenet lejárt. Kérjük, jelentkezzen be újra.');
  });

  sessionTimeout.value = timeout;

  countdownInterval = setInterval(() => {
    sessionTimeout.value = countdownController.getRemainingTime();
    if (sessionTimeout.value <= 0) {
      clearInterval(countdownInterval);
    }
  }, 1000);
}

async function logoutUser() {
  try {
    await axios.post(`${API_URL}/api/logout`, {}, {
      withCredentials: true,
      headers: {
        'x-session-id': cookieUtils.getSessionCookie()
      }
    });

    cookieUtils.deleteSessionCookie();
    clearInterval(countdownInterval);
    emit('loginSuccess');
    emit('showToast', 'Sikeres kijelentkezés.');

  } catch (error) {
    console.error('Hiba a kijelentkezés során:', error);
    emit('showToast', 'Hiba a kijelentkezés során.');
  }
}

onMounted(() => {
  if (props.initialSessionTimeout) {
    startCountdown(props.initialSessionTimeout);
  }
});
</script>

<template>
  <div class="mainSection">
      <h1>BELÉPTÉL!</h1>
      <h3>Üdvözöllek, {{ user }}!</h3>
      <p>Ez a védett oldal.</p>
      <h4>A munkamenet lejár: {{ formatTimeout(sessionTimeout) }}</h4>
      <div onclick="">
        <button @click="emit('loginSuccess'), logoutUser()">Kijelentkezés</button>
      </div>
  </div>
</template>


<style scoped>
.mainSection {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  margin-top: 10px;
  padding: 10px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

p {
  margin-top: 10px;
  color: red;
}
</style>
