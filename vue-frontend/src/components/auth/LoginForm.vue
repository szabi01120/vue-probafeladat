<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import cookieUtils from '../../utils/cookieUtils';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const props = defineProps(['isLoggedIn']);
const emit = defineEmits(['is2FaRequired', 'showToast']);

const username = ref('');
const password = ref('');

async function loginUser() {
  try {
    const response = await axios.post(`${API_URL}/api/login`, {
      username: username.value,
      password: password.value
    }, {
      withCredentials: true
    });

    const sessionId = response.headers['x-session-id'];

    if (sessionId && response.status === 200 && !response.data.isLoggedIn) {
      cookieUtils.setSessionCookie(sessionId);
      emit('is2FaRequired');
      emit('showToast', '2FA kód elküldve emailben.');
    }

  } catch (error) {
    console.error('Hiba a bejelentkezés során:', error);
    emit('showToast', 'Hibás felhasználónév vagy jelszó.');
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
    </div>
</template>

<style scoped>
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
</style>