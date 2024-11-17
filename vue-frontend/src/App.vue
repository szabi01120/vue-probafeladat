<script setup>
import { ref, onMounted } from 'vue';
import cookieUtils from './utils/cookieUtils';
import HelloWorld from './components/HelloWorld.vue';
import MainSite from './components/MainSite.vue';
import LoginForm from './components/auth/LoginForm.vue';
import TwoFactorForm from './components/auth/TwoFactorForm.vue';
import Toast from './components/common/Toast.vue';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const toastMessage = ref('');
const isLoggedIn = ref(false);
const initialSessionTimeout = ref(null);
const user = ref(null);
const is2FaRequired = ref(false);

function showToast(message) {
  toastMessage.value = message;
  setTimeout(() => toastMessage.value = '', 4000);
}

function handle2FaRequired() {
  is2FaRequired.value = !is2FaRequired.value;
};

async function checkAuth() {
  try {
    const response = await axios.get(`${API_URL}/api/check-auth`, {
      headers: {
        'x-session-id': cookieUtils.getSessionCookie()
      },
      withCredentials: true
    });

    if (response.data.isLoggedIn) {
      user.value = response.data.username;
      isLoggedIn.value = true;
      initialSessionTimeout.value = response.headers['x-session-timeout'];
    } else {
      isLoggedIn.value = false;
    }

  } catch (error) {
    console.error('Hiba az autentikáció ellenőrzésekor:', error);
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
    <LoginForm 
      v-if="!isLoggedIn && !is2FaRequired" 
      @loginSuccess="checkAuth"
      @is2FaRequired="handle2FaRequired"
      @showToast="showToast" />

    <TwoFactorForm 
      v-if="is2FaRequired" 
      @verifyTwoFactorCode="checkAuth" 
      @is2FaRequired="handle2FaRequired"
      @loginSuccess="checkAuth"
      @showToast="showToast" />

    <MainSite 
      v-if="isLoggedIn" 
      :user="user" 
      :initialSessionTimeout="initialSessionTimeout" 
      :isLoggedIn="isLoggedIn"
      @loginSuccess="checkAuth"
      @showToast="showToast" />

    <Toast v-if="toastMessage" :message="toastMessage" />
  </main>
</template>
