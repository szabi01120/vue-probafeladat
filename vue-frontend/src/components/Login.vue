<template>
    <div class="login">
      <h1>Login</h1>
      <form @submit.prevent="loginUser">
        <div>
          <label for="username">Username</label>
          <input v-model="username" type="text" id="username" required />
        </div>
        <div>
          <label for="password">Password</label>
          <input v-model="password" type="password" id="password" required />
        </div>
        <button type="submit">Login</button>
      </form>
      <p v-if="message">{{ message }}</p>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        username: '',
        password: '',
        message: ''
      };
    },
    methods: {
      async loginUser() {
        try {
          const response = await axios.post('http://localhost:3000/api/login', {
            username: this.username,
            password: this.password
          });
          this.message = 'Login successful!'; // Sikeres bejelentkezés
          // Itt elmentheted a kapott token-t vagy felhasználói információt, ha szükséges
        } catch (error) {
          console.error(error);
          this.message = 'Login failed. Please check your credentials.'; // Hibás bejelentkezés
        }
      }
    }
  };
  </script>
  
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
  