<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import cookieUtils from '../../utils/cookieUtils';
import Toast from '../common/Toast.vue';
import axios from 'axios';

const props = defineProps(['isLoggedIn']);
const emit = defineEmits(['is2FaRequired']);

const username = ref('');
const password = ref('');
const toastMessage = ref('');

async function loginUser() {
  try {
    const response = await axios.post('http://localhost:3000/api/login', {
      username: username.value,
      password: password.value
    }, {
      withCredentials: true
    });

    const sessionId = response.headers['x-session-id'];

    if (sessionId && response.status === 200 && !response.data.isLoggedIn) {
      console.log('Session ID sikeresen beállítva:', sessionId);
      emit('is2FaRequired');
      cookieUtils.setSessionCookie(sessionId);
      toastMessage.value = '2FA kód elküldve emailben.';
    }

  } catch (error) {
    console.error('Hiba a bejelentkezés során:', error);
    toastMessage.value = 'Hibás felhasználónév vagy jelszó.';
  }
}
</script>

<template>
    <div class="login">
        <div v-if="!isLoggedIn">
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
        <Toast v-if="toastMessage" :message="toastMessage" />
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