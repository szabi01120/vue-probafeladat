<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import cookieUtils from '../utils/cookieUtils';
import startSessionCountdown from '../utils/countdownUtil';
import formatTimeout from '@/utils/timeUtils';

// Props és események
const props = defineProps(['isLoggedIn', 'user', 'initialSessionTimeout']);
const emit = defineEmits(['loginSuccess', 'is2FaRequired']);

const sessionTimeout = ref(props.initialSessionTimeout);
const toastMessage = ref('');

let countdownInterval = null;
let countdownController = null;

function showToast(message) {
  toastMessage.value = message;
  setTimeout(() => toastMessage.value = '', 3000); // 3 másodperc
}

function startCountdown(timeout) {
  console.log('Munkamenet kezdete:', timeout);
  countdownController = startSessionCountdown(timeout, () => {
    emit('loginSuccess');
    showToast('A munkamenet lejárt. Kérjük, jelentkezzen be újra.');
  });

  sessionTimeout.value = timeout;

  const interval = setInterval(() => {
    sessionTimeout.value = countdownController.getRemainingTime();
    if (sessionTimeout.value <= 0) {
      clearInterval(interval);
    }
  }, 1000);
}

async function logoutUser() {
  try {
    await axios.post('http://localhost:3000/api/logout', {}, {
      withCredentials: true,
      headers: {
        'x-session-id': cookieUtils.getSessionCookie()
      }
    });

    cookieUtils.deleteSessionCookie();
    clearInterval(countdownInterval);
    emit('loginSuccess');
    showToast('Sikeres kijelentkezés.');

  } catch (error) {
    showToast('Sikertelen kijelentkezés. Kérjük, próbálja újra.');
  }
}

watch(() => props.isLoggedIn, (newValue) => {
  console.log('isLoggedIn változás:', newValue);
  if (newValue) {
    startCountdown(props.initialSessionTimeout);
  } else {
    clearInterval(countdownInterval);
  }
});

</script>

<template>
  <div class="login">
      <h1>BELÉPTÉL!</h1>
      <h3>Üdvözöllek, {{ user }}!</h3>
      <p>Ez a védett oldal.</p>
      <h4>A munkamenet lejár: {{ formatTimeout(sessionTimeout) }}</h4>
      <div onclick="">
        <button @click="emit('loginSuccess'), logoutUser()">Kijelentkezés</button>
      </div>
    <div v-if="toastMessage" class="toast">{{ toastMessage }}</div>
  </div>
</template>


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
  animation: fadeInOut 3s ease-in-out;
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

.login {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
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
