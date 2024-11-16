import axios from 'axios';

const API_BASE_URL = process.env.VUE_APP_API_URL;

export async function login(username, password) {
  return axios.post(`${API_BASE_URL}/login`, { username, password }, { withCredentials: true });
}

export async function verifyTwoFactor(twoFactorCode, sessionId) {
  return axios.post(`${API_BASE_URL}/verify-2fa`, { twoFactorCode }, {
    withCredentials: true,
    headers: { 'x-session-id': sessionId }
  });
}

export async function logout(sessionId) {
  return axios.post(`${API_BASE_URL}/logout`, {}, {
    withCredentials: true,
    headers: { 'x-session-id': sessionId }
  });
}
