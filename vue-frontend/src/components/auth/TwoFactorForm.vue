<script setup>
import { ref, defineEmits } from 'vue';
import Toast from '../common/Toast.vue';
import cookieUtils from '@/utils/cookieUtils';
import startCountdown from '@/utils/countdownUtil';
import axios from 'axios';

const twoFactorCode = ref('');
const toastMessage = ref('');

const emit = defineEmits(['is2FaRequired', 'loginSuccess']);

async function verifyTwoFactorCode() {
  try {
    const sessionId = cookieUtils.getSessionCookie();
    const response = await axios.post('http://localhost:3000/api/verify-2fa', {
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
      toastMessage.value = 'Sikeres bejelentkezés.';
    }
  } catch (error) {
    console.error('Hiba a kétfaktoros kód ellenőrzésekor:', error);
    toastMessage.value = 'Hibás kétfaktoros kód.';
  }
}
</script>

<template>
    <div class="login">
        <div>
            <h2>Adja meg a kétfaktoros kódot</h2>
            <div>
            <label for="2fa">Kétfaktoros kód</label>
            <input v-model="twoFactorCode" type="text" id="2fa" required />
            </div>
            <button @click="verifyTwoFactorCode">Küldés</button>
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