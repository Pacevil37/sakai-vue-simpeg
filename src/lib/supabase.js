import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rljaacdsmgahxqtuyoju.supabase.co'
const supabaseAnonKey = 'sb_publishable_KKoxNw6zRSwr9JlWTTRSqA_cfruZk9C'

console.log('🚀 Initializing Supabase client...')
console.log('📍 URL:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: localStorage
    }
})

// Cek session saat startup
supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
        console.log('✅ Existing session found for:', session.user.email)
    } else {
        console.log('ℹ️ No existing session')
    }
})

// Listener untuk debug
supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔐 Auth state changed:', event, session?.user?.email)
})

export default supabase
