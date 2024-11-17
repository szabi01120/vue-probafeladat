<script setup>
import { ref, defineEmits } from 'vue';
import cookieUtils from '@/utils/cookieUtils';
import startCountdown from '@/utils/countdownUtil';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const emit = defineEmits(['is2FaRequired', 'loginSuccess', 'showToast']);

const twoFactorCode = ref('');

async function verifyTwoFactorCode() {
  try {
    const sessionId = cookieUtils.getSessionCookie();
    const response = await axios.post(`${API_URL}/api/verify-2fa`, {
      twoFactorCode: twoFactorCode.value
    }, {
      withCredentials: true,
      headers: {
        'x-session-id': sessionId
      }
    });

    if (response.status === 200 && response.data.isLoggedIn) {
      console.log(response.data);
      startCountdown(response.headers['x-session-timeout']);
      emit('is2FaRequired');
      emit('loginSuccess');
      emit('showToast', 'Sikeres bejelentkezés.');
    }
  } catch (error) {
    console.error('Hiba a kétfaktoros kód ellenőrzésekor:', error);
    emit('showToast', 'Hiba a kétfaktoros kód ellenőrzésekor.');
  }
}
</script>

<template>
    <div class="mainSection">
        <div>
            <h2>Adja meg a kétfaktoros kódot</h2>
            <div>
            <label for="2fa">Kétfaktoros kód</label>
            <input v-model="twoFactorCode" type="text" id="2fa" required />
            </div>
            <button @click="verifyTwoFactorCode">Küldés</button>
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