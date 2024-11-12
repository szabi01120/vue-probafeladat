<script setup>
import { ref } from 'vue'
import axios from 'axios'

const username = ref('')
const password = ref('')
const emit = defineEmits(['login'])

defineProps(['isLoggedIn'])

async function loginUser() {
  try {
    const response = await axios.post('http://localhost:3000/api/login', {
      username: username.value,
      password: password.value
    }, {
      withCredentials: true
    });

    // Emitáljuk a bejelentkezési állapotot a szülő felé
    emit('login', response.data.isLoggedIn)

    const sessionId = response.headers['x-session-id'];
    if (sessionId) {      
      console.log('sessionId:', typeof(sessionId));
      document.cookie = `sessionId=${sessionId}; path=/;`;
    }

  } catch (error) {
    console.error('Bejelentkezési hiba:', error)
    alert('Sikertelen bejelentkezés. Kérjük, ellenőrizze a felhasználónevet és jelszót.')
  }
}
</script>

<template>
  <div class="login">
    <div v-if="isLoggedIn">
      <h1>BELÉPTÉL!</h1>
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
