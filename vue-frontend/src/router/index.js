import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import Protected from '../components/Protected.vue';

const routes = [
    {
        path: '/',
        name: 'Login',
        component: Login
    },
    {
        path: '/protected',
        name: 'Protected',
        component: Protected,
        meta: { requiresAuth: true }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Middleware guard beállítása a védett route-okra
router.beforeEach(async (to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
        try {
            const response = await axios.get('http://localhost:3000/api/protected', {
                withCredentials: true
            });
            if (response.status === 200) {
                next(); // Tovább megy, ha a felhasználó be van jelentkezve
            }
        } catch (error) {
            console.error('Unauthorized access, redirecting to login');
            next('/'); // Átirányít a login oldalra, ha nem bejelentkezett
        }
    } else {
        next(); // Folytatja, ha az útvonal nem igényel hitelesítést
    }
});

export default router;
