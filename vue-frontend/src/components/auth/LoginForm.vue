<script setup>
import { ref, defineEmits } from 'vue';
import { loginUser } from '@/services/authService';

const emit = defineEmits(['is2FaRequired', 'showToast']);

const username = ref('');
const password = ref('');
const isLoading = ref(false);

async function handleLogin() {
    isLoading.value = true;
    try {
        const result = await loginUser(username.value, password.value);

        if (result.requiresTwoFactor) {
            emit('is2FaRequired');
            emit('showToast', '2FA kód elküldve emailben.');
        } else {
            emit('showToast', 'Sikeres bejelentkezés.');
        }
    } catch (error) {
        console.error('Hiba a bejelentkezés során:', error);
        emit('showToast', 'Hibás felhasználónév vagy jelszó.');
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <div class="login">
        <div>
            <h1>Bejelentkezés</h1>
            <form @submit.prevent="handleLogin">
                <div>
                    <label for="username">Felhasználónév</label>
                    <input v-model="username" type="text" id="username" required />
                </div>
                <div>
                    <label for="password">Jelszó</label>
                    <input v-model="password" type="password" id="password" required />
                </div>
                <button type="submit" :disabled="isLoading">
                    <span v-if="isLoading">Betöltés...</span>
                    <span v-else>Bejelentkezés</span>
                </button>
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