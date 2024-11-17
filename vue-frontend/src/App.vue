<script setup>
import { ref, onMounted } from 'vue';
import { userLoggedIn } from './services/authService';
import { useToast } from './services/toastService';
import HelloWorld from './components/HelloWorld.vue';
import MainSite from './components/MainSite.vue';
import LoginForm from './components/auth/LoginForm.vue';
import TwoFactorForm from './components/auth/TwoFactorForm.vue';
import Toast from './components/common/Toast.vue';

const { toastMessage, showToast } = useToast();

const isLoggedIn = ref(false);
const user = ref(null);
const initialSessionTimeout = ref(null);
const is2FaRequired = ref(false);

async function checkAuth() {
  try {
    const authData = await userLoggedIn();
    
    isLoggedIn.value = authData.isLoggedIn;
    user.value = authData.user;
    initialSessionTimeout.value = authData.sessionTimeout;
  } catch {
    isLoggedIn.value = false;
  }
}

function handle2FaRequired() {
  is2FaRequired.value = !is2FaRequired.value;
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
