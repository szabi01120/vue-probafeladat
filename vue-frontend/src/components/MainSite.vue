<script setup>
import { ref, computed, watch } from 'vue';
import axios from 'axios';

const username = ref('');
const password = ref('');

// Props és események
const props = defineProps(['isLoggedIn', 'user', 'initialSessionTimeout']);
const emit = defineEmits(['loginSuccess']);

const sessionTimeout = ref(props.initialSessionTimeout);
const toastMessage = ref('');

let countdownInterval = null;
let lastTimestamp = Date.now(); 

function setSessionCookie(sessionId) {
  document.cookie = `sessionId=${sessionId}; path=/;`;
}

function showToast(message) {
  toastMessage.value = message;
  setTimeout(() => toastMessage.value = '', 3000); // 3 másodperc
}

const formattedTimeout = computed(() => {
  const totalSeconds = Math.floor(sessionTimeout.value / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
});

function startSessionCountdown(timeout) {
  if (countdownInterval) clearInterval(countdownInterval);

  sessionTimeout.value = timeout;
  lastTimestamp = Date.now();

  countdownInterval = setInterval(() => {
    const now = Date.now();
    const elapsed = lastTimestamp ? now - lastTimestamp : 1000;
    lastTimestamp = now;

    sessionTimeout.value -= elapsed;

    if (sessionTimeout.value <= 0) {
      clearInterval(countdownInterval);
      showToast('A munkamenet lejárt. Kérjük, jelentkezzen be újra.');
      emit('loginSuccess');
    }
  }, 1000);
}

async function loginUser() {
  try {
    const response = await axios.post('http://localhost:3000/api/login', {
      username: username.value,
      password: password.value
    }, {
      withCredentials: true
    });

    const sessionId = response.headers['x-session-id'];
    const newSessionTimeout = response.headers['x-session-timeout'];

    if (sessionId) {      
      console.log('Session ID sikeresen beállítva:', sessionId);
      setSessionCookie(sessionId);
      emit('loginSuccess');

      if (newSessionTimeout) {
        startSessionCountdown(newSessionTimeout);
      }
    }

  } catch (error) {
    console.error('Bejelentkezési hiba:', error);
    showToast('Sikertelen bejelentkezés. Kérjük, ellenőrizze a felhasználónevet és jelszót.');
  }
}

async function logoutUser() {
  try {
    await axios.post('http://localhost:3000/api/logout', {}, {
      withCredentials: true,
      headers: {
        'x-session-id': document.cookie.replace(/(?:(?:^|.*;\s*)sessionId\s*=\s*([^;]*).*$)|^.*$/, "$1")
      }
    });

    document.cookie = 'sessionId=; max-age=0; path=/;';
    emit('loginSuccess');
    showToast('Sikeres kijelentkezés.');

  } catch (error) {
    console.error('Kijelentkezési hiba:', error);
    showToast('Sikertelen kijelentkezés. Kérjük, próbálja újra.');
  }
}

watch(() => props.initialSessionTimeout, (newTimeout) => {
  if (newTimeout) {
    startSessionCountdown(newTimeout);
  }
});
</script>

<template>
  <div class="login">
    <div v-if="isLoggedIn">
      <h1>BELÉPTÉL!</h1>
      <h3>Üdvözöllek, {{ user }}!</h3>
      <p>Ez a védett oldal.</p>
      <h4>A munkamenet lejár: {{ formattedTimeout }}</h4>
      <div onclick="">
        <button @click="emit('loginSuccess'), logoutUser()">Kijelentkezés</button>
      </div>
    </div>

    <div v-else>
      <h1>Bejelentkezés</h1>
      <form @submit.prevent="loginUser">
        <div>
          <label for="username">Felhasználónév</label>
          <input v-model="username" type="text" id="username" required />
        </div>
        <div>
          <label for="password">Jelszó</label>
          <input v-model="password" type="password" id="password" required />
        </div>
        <button type="submit">Bejelentkezés</button>
      </form>
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
  0%, 100% { opacity: 0; }
  10%, 90% { opacity: 1; }
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
