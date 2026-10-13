// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/icon',
    'nuxt-auth-sanctum',
    'nuxt-toast',
    '@pinia/nuxt',
    'nuxt-tiptap-editor'
  ],
  vite: {
    plugins: [tailwindcss() as any],
  },
  css: ['~/assets/css/main.css'],
  pinia:{
    storesDirs: ['./stores'],
   },
  sanctum: {
    baseUrl: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000',
    mode: 'token',
    endpoints: {
      login: '/api/auth/login',
      logout: '/api/auth/logout',
      user: '/api/auth/me',
    },
    redirect: {
      onLogin: '/dashboard',
      onLogout: '/login',
      onAuthOnly: '/login',
      onGuestOnly: '/dashboard',
    },
    globalMiddleware: {
      enabled: true,
    },
  }
})