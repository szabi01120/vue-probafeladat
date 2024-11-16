<script setup>
import { ref, onMounted } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import MainSite from './components/MainSite.vue'
import LoginForm from './components/auth/LoginForm.vue'
import TwoFactorForm from './components/auth/TwoFactorForm.vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL;

axios.defaults.withCredentials = true;

const isLoggedIn = ref(false)
const initialSessionTimeout = ref(null)
const user = ref(null)
const is2FaRequired = ref(false);

function handleTwoFactorRequired() {;
  is2FaRequired.value = !is2FaRequired.value;
}

// Bejelentkezés ellenőrzése
async function checkAuth() {
  try {
    const response = await axios.get(`${API_URL}/api/check-auth`, {
      headers: {
        'x-session-id': document.cookie.replace(/(?:(?:^|.*;\s*)sessionId\s*=\s*([^;]*).*$)|^.*$/, "$1")
      },
      withCredentials: true
    });

    console.log('checkAuth response:', response.data);
    if(response.data.isLoggedIn) {
      user.value = response.data.username;
      isLoggedIn.value = true;
      initialSessionTimeout.value = response.headers['x-session-timeout'];
    } else {
      isLoggedIn.value = false;
    }

  } catch (error) {
    isLoggedIn.value = false;
  }
}

onMounted(() => {
  checkAuth();
});
</script>

<template>
  <header>
    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>
  </header>

  <main>
    <LoginForm v-if="!isLoggedIn && !is2FaRequired" @loginSuccess="checkAuth" @is2FaRequired="handleTwoFactorRequired" />
    <TwoFactorForm v-if="is2FaRequired" @verifyTwoFactorCode="checkAuth" @is2FaRequired="handleTwoFactorRequired" @loginSuccess="checkAuth"/>
    <MainSite v-if="isLoggedIn" :user="user" :initialSessionTimeout="initialSessionTimeout" @loginSuccess="checkAuth" />
  </main>
</template>
