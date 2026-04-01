// https://nuxt.com/docs/api/configuration/nuxt-config
import { readFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'

const isDev = process.env.NODE_ENV !== 'production'
const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as { version?: string }
const appVersion = packageJson.version ?? '0.0.0'

const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' https: blob:",
  "font-src 'self' data:",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://apis.google.com https://www.gstatic.com https://*.firebasedatabase.app https://*.firebaseio.com`,
  "script-src-elem 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com https://*.firebasedatabase.app https://*.firebaseio.com",
  "style-src 'self' 'unsafe-inline'",
  `connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebasedatabase.app wss://*.firebasedatabase.app wss://*.firebaseio.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com${isDev ? ' http://localhost:* ws://localhost:* wss://localhost:*' : ''}`,
  "frame-src 'self' https://accounts.google.com https://*.google.com https://*.firebasedatabase.app https://*.firebaseio.com https://*.firebaseapp.com https://*.web.app",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "form-action 'self'"
].join('; ')

export default defineNuxtConfig({
  compatibilityDate: '2026-02-20',

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
    head: {
      link: [
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' }
      ],
      meta: [
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }
      ]
    },
    pageTransition: {
      name: 'page',
      mode: 'out-in'
    }
  },

  modules: [
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    '@nuxtjs/color-mode'
  ],

  css: ['~/assets/css/tailwind.css'],

  vite: {
    plugins: [tailwindcss() as any]
  },

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

  ssr: false,
  // modern: 'client',
  // target: 'static',

  pwa: {
    registerType: 'autoUpdate',
    client: {
      installPrompt: true
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    manifest: {
      id: '/',
      display: "fullscreen",
      display_override: ['standalone', 'minimal-ui'],
      name: 'Power Progress',
      short_name: 'Power Progress',
      description: 'Дневник для записи тренировок и отслеживания прогресса',
      lang: 'ru',
      background_color: '#ffffff',
      theme_color: '#000000',
      start_url: '/',
      icons: [
        {
          src: '/icon.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/icon.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable any'
        }
      ]
    },
    workbox: {
      cleanupOutdatedCaches: true,
      cacheId: 'power-progress',
      clientsClaim: true,
      skipWaiting: true,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      globIgnores: ['**/200*', '**/404*'],
      globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,json,woff2}'],
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      type: 'module'
    }
  },

  runtimeConfig: {
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    AUTH_DOMAIN: process.env.AUTH_DOMAIN,
    DATABASE_URL: process.env.DATABASE_URL,
    PROJECT_ID: process.env.PROJECT_ID,
    STORAGE_BUCKET: process.env.STORAGE_BUCKET,
    MESSAGING_SENDER_ID: process.env.MESSAGING_SENDER_ID,
    APP_ID: process.env.APP_ID,

    public: {
      APP_VERSION: appVersion,
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      AUTH_DOMAIN: process.env.AUTH_DOMAIN,
      DATABASE_URL: process.env.DATABASE_URL,
      PROJECT_ID: process.env.PROJECT_ID,
      STORAGE_BUCKET: process.env.STORAGE_BUCKET,
      MESSAGING_SENDER_ID: process.env.MESSAGING_SENDER_ID,
      APP_ID: process.env.APP_ID
    }
  },

  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'Content-Security-Policy': cspDirectives,
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'SAMEORIGIN',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
        }
      }
    }
  }
})
