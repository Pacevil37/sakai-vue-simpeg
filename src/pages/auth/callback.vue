<template>
    <div class="flex justify-center items-center min-h-screen">
        <div class="text-center">
            <ProgressSpinner />
            <p class="mt-4">Memproses login Google...</p>
            <p class="mt-2 text-sm text-gray-500">Harap tunggu sebentar</p>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { supabase } from '@/lib/supabase';
import ProgressSpinner from 'primevue/progressspinner';

const router = useRouter();
const route = useRoute();

onMounted(async () => {
    console.log('Processing Google login callback...');
    console.log('Current URL:', window.location.href);
    console.log('Query params:', route.query);
    
    try {
        // Method 1: Cek session dari URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        console.log('Access token from hash:', accessToken ? 'ADA' : 'TIDAK ADA');
        
        if (accessToken) {
            // Set session dari token yang ada di URL
            const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
            });
            
            if (!error && data.session) {
                console.log('✅ Session berhasil diset!');
                router.push('/');
                return;
            }
        }
        
        // Method 2: Cek session biasa
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Session error:', error);
            router.push('/auth/login?error=session_error');
            return;
        }
        
        if (session) {
            console.log('✅ Login successful! User:', session.user.email);
            router.push('/');
        } else {
            console.log('❌ No session found');
            
            // Method 3: Cek apakah ada code di URL (PKCE flow)
            const code = route.query.code;
            if (code) {
                console.log('Found authorization code, exchanging for session...');
                const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                
                if (!exchangeError && data.session) {
                    console.log('✅ Session from code exchange successful!');
                    router.push('/');
                    return;
                }
            }
            
            router.push('/auth/login?error=no_session');
        }
    } catch (err) {
        console.error('Callback error:', err);
        router.push('/auth/login?error=callback_failed');
    }
});
</script>

<style scoped>
.flex {
    display: flex;
}

.justify-content-center {
    justify-content: center;
}

.align-items-center {
    align-items: center;
}

.min-h-screen {
    min-height: 100vh;
}

.text-center {
    text-align: center;
}

.mt-3 {
    margin-top: 1rem;
}

.mt-2 {
    margin-top: 0.5rem;
}

.text-sm {
    font-size: 0.875rem;
}

.text-gray-500 {
    color: #6b7280;
}
</style>
