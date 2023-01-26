// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
    css: ['@/assets/stylus/main.styl'],

    modules: [
        '@kevinmarrec/nuxt-pwa'
    ],

    pwa: {
        workbox: {
            enabled: true
        }
    },

    runtimeConfig: {
        FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
        AUTH_DOMAIN: process.env.AUTH_DOMAIN,
        DATABASE_URL: process.env.DATABASE_URL,
        PROJECT_ID: process.env.PROJECT_ID,
        STORAGE_BUCKET: process.env.STORAGE_BUCKET,
        MESSAGING_SENDER_ID: process.env.MESSAGING_SENDER_ID,
        API_ID: process.env.API_ID,

        public: {
            FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
            AUTH_DOMAIN: process.env.AUTH_DOMAIN,
            DATABASE_URL: process.env.DATABASE_URL,
            PROJECT_ID: process.env.PROJECT_ID,
            STORAGE_BUCKET: process.env.STORAGE_BUCKET,
            MESSAGING_SENDER_ID: process.env.MESSAGING_SENDER_ID,
            API_ID: process.env.API_ID
        }
    },
})
