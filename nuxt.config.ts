// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  typescript: {
    strict: true,
    shim: false,
    tsConfig: {
      compilerOptions: {
        moduleResolution: 'bundler',
      },
    },
  },
  
  css: ['@/assets/stylus/main.styl'],

  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in'
    }
  },

  modules: [
    '@kevinmarrec/nuxt-pwa',
    '@nuxtjs/tailwindcss',
  ],

  tailwindcss: {
    viewer: false,
  },

  ssr: false,
  modern: 'client',
  target: 'static',

  pwa: {
    manifest: {
      name: 'Power Progress',
      short_name: 'Power Progress',
      lang: 'ru',
      useWebmanifestExtension: false,
      background_color: '#ffffff',
      theme_color: '#5182dc',
    },
    icon: {
      fileName: "icon.png",
      purpose: "maskable"
    },
    meta: {
      lang: 'ru',
      title: 'Power Progress',
      theme_color: '#5182dc',
      ogTitle: 'Power Progress',
      ogSiteName: 'Power Progress',
      nativeUI: true
    },
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
