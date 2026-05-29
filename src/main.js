import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import '@/assets/styles.scss';
import { useAuthStore } from './stores/useAuthStore';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);

// Inisialisasi store dan mount app
(async () => {
    const authStore = useAuthStore();
    if (typeof authStore.init === 'function') {
        await authStore.init();
    } else {
        console.error('authStore.init is not a function! Periksa file store Anda.');
    }
    app.mount('#app');
})();