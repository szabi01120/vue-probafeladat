<script setup>
import { defineProps, ref, watch, onMounted } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import Login from './components/Login.vue'
import axios from 'axios'

axios.defaults.withCredentials = true; // Globális beállítás

const isLoggedIn = ref(false)
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
    if(response.data.isLoggedIn) {
      user.value = response.data.username;
      return isLoggedIn.value = true;
    } else {
      console.log('isLoggedIn value:', isLoggedIn.value);
      return isLoggedIn.value = false;
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
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>
  </header>

  <main>
    <Login :isLoggedIn="isLoggedIn" />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
