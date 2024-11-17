<script setup>
import { ref, defineEmits } from 'vue';
import startCountdown from '@/utils/countdownUtil';
import { verifyTwoFactorCode } from '@/services/authService';

const emit = defineEmits(['is2FaRequired', 'loginSuccess', 'showToast']);

const twoFactorCode = ref('');
const isLoading = ref(false);

function validateTwoFactorCode() {
    const isValid = /^[0-9]{6}$/.test(twoFactorCode.value);
    if (!isValid) {
        emit('showToast', 'A kétfaktoros kódnak 6 számjegyűnek kell lennie.');
        return false;
    }
    return true;
}

async function handleVerifyTwoFactorCode() {
  if (!validateTwoFactorCode()) return;

  isLoading.value = true;
  try {
    const response = await verifyTwoFactorCode(twoFactorCode.value);

    if (response.status === 200 && response.data.isLoggedIn) {
      startCountdown(response.headers['x-session-timeout']);
      emit('is2FaRequired');
      emit('loginSuccess');
      emit('showToast', 'Sikeres bejelentkezés.');
    }
  } catch (error) {
    console.error('Hiba a kétfaktoros kód ellenőrzésekor:', error);
    emit('showToast', 'Hiba a kétfaktoros kód ellenőrzésekor.');
  } finally {
    isLoading.value = false;
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
            <button @click="handleVerifyTwoFactorCode" :disabled="isLoading">
              <span v-if="isLoading">Betöltés...</span>
              <span v-else>Küldés</span>
            </button>
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