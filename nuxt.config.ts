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

  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in'
    }
  },

  modules: [
    '@kevinmarrec/nuxt-pwa',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode'
  ],

  colorMode: {
    preference: 'system', // default value of $colorMode.preference
    fallback: 'light', // fallback value if not system preference found
    hid: 'nuxt-color-mode-script',
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: '',
    classSuffix: '',
    storageKey: 'nuxt-color-mode'
  },

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
      theme_color: '#000000',
    },
    icon: {
      fileName: "icon.png",
      purpose: "maskable"
    },
    meta: {
      lang: 'ru',
      title: 'Power Progress',
      theme_color: '#000000',
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
