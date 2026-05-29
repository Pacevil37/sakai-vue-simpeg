import { useToast } from 'primevue/usetoast';

// Global toast utility
export const toast = {
    success: (message, title = 'Berhasil') => {
        const toast = useToast();
        toast.add({
            severity: 'success',
            summary: title,
            detail: message,
            life: 3000
        });
    },

    error: (message, title = 'Error') => {
        const toast = useToast();
        toast.add({
            severity: 'error',
            summary: title,
            detail: message,
            life: 3000
        });
    },

    warning: (message, title = 'Peringatan') => {
        const toast = useToast();
        toast.add({
            severity: 'warn',
            summary: title,
            detail: message,
            life: 3000
        });
    },

    info: (message, title = 'Informasi') => {
        const toast = useToast();
        toast.add({
            severity: 'info',
            summary: title,
            detail: message,
            life: 3000
        });
    }
};

export default toast;
