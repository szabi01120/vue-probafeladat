<script setup>
import { ref } from 'vue'
import axios from 'axios'

// Bemeneti értékek
const username = ref('')
const password = ref('')

// Props és események
const props = defineProps(['isLoggedIn', 'user'])
const emit = defineEmits(['loginSuccess'])

const toastMessage = ref('')

function setSessionCookie(sessionId) {
  document.cookie = `sessionId=${sessionId}; path=/;`;
}

function showToast(message) {
  toastMessage.value = message;
  setTimeout(() => toastMessage.value = '', 3000); // 3 másodperc
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
    if (sessionId) {      
      console.log('Session ID sikeresen beállítva:', sessionId);
      setSessionCookie(sessionId);
      emit('loginSuccess');
    }

  } catch (error) {
    console.error('Bejelentkezési hiba:', error);
    showToast('Sikertelen bejelentkezés. Kérjük, ellenőrizze a felhasználónevet és jelszót.');
  }
}
</script>

<template>
  <div class="login">
    <div v-if="isLoggedIn">
      <h1>BELÉPTÉL!</h1>
      <h3>Üdvözöllek, {{ user }}!</h3>
      <p>Ez a védett oldal.</p>
    </div>

    <!-- Bejelentkezési űrlap csak akkor jelenik meg, ha nincs bejelentkezve -->
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
