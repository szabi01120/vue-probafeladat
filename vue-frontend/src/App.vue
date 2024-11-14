<script setup>
import { ref, onMounted } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import Login from './components/Login.vue'
import axios from 'axios'

axios.defaults.withCredentials = true;

const isLoggedIn = ref(false)
const initialSessionTimeout = ref(null)
const user = ref(null)

// Bejelentkezés ellenőrzése
async function checkAuth() {
  try {
    const response = await axios.get('http://localhost:3000/api/check-auth', {
      headers: {
        'x-session-id': document.cookie.replace(/(?:(?:^|.*;\s*)sessionId\s*=\s*([^;]*).*$)|^.*$/, "$1")
      },
      withCredentials: true
    });

    console.log('checkAuth response:', response.data);
    console.log('session timeout: ', response.headers['x-session-timeout']);
    if(response.data.isLoggedIn) {
      user.value = response.data.username;
      isLoggedIn.value = true;
      initialSessionTimeout.value = response.headers['x-session-timeout'];
    } else {
      isLoggedIn.value = false;
    }

  } catch (error) {
    isLoggedIn.value = false;
    console.error('Nincs bejelentkezve!', error);
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
    <Login :isLoggedIn="isLoggedIn" :user="user" :initialSessionTimeout="initialSessionTimeout" @loginSuccess="checkAuth" />
  </main>
</template>
