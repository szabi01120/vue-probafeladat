import axios from 'axios';
import cookieUtils from '@/utils/cookieUtils';

const API_URL = import.meta.env.VITE_API_URL;

export async function userLoggedIn() {
    try {
        const response = await axios.get(`${API_URL}/api/check-auth`, {
            headers: {
                'x-session-id': cookieUtils.getSessionCookie()
            },
            withCredentials: true
        });
        return {
            isLoggedIn: response.data.isLoggedIn,
            user: response.data.username || null,
            sessionTimeout: response.headers['x-session-timeout'] || null
        };
    } catch (error) {
        console.error('Nincs bejelentkezve!', error);
        throw new Error('Nincs bejelentkezve!');
    }
}

export async function loginUser(username, password) {
    try {
        const response = await axios.post(`${API_URL}/api/login`, {
            username: username,
            password: password
        }, {
            withCredentials: true
        });

        const sessionId = response.headers['x-session-id'];
        if (sessionId) {
            cookieUtils.setSessionCookie(sessionId);
        }

        return {
            isLoggedIn: response.data.isLoggedIn,
            requiresTwoFactor: !response.data.isLoggedIn,
            sessionId,
            message: response.data.message || null
        };
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Szerverhiba történt.');
    }
}

export async function verifyTwoFactorCode(twoFactorCode) {
    const sessionId = cookieUtils.getSessionCookie();

    const response = await axios.post(
        `${API_URL}/api/verify-2fa`,
        { twoFactorCode },
        {
            withCredentials: true,
            headers: {
                'x-session-id': sessionId
            }
        }
    );

    return response;
}

export async function logoutUser() {
    const sessionId = cookieUtils.getSessionCookie();
    try {
        const response = await axios.post(`${API_URL}/api/logout`, {}, {
            withCredentials: true,
            headers: {
                'x-session-id': sessionId
            }
        }
        );

        cookieUtils.deleteSessionCookie();
        return response;
    } catch (error) {
        console.error('Hiba történt a kijelentkezés során!', error);
        throw error;
    }
}