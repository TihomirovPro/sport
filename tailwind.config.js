const plugin = require('tailwindcss/plugin')

module.exports = {
  darkMode: 'dark',
  separator: '_',

  content: [
    './components/**/*.{js,ts,vue}',
    './layouts/**/*.{js,ts,vue}',
    './pages/**/*.{js,ts,vue}'
  ],

  theme: {
    colors: {
      accent: 'rgb(var(--colorAccent) / <alpha-value>)',
      faint: 'rgb(var(--colorFaint) / <alpha-value>)',
      white: 'rgb(255 255 255 / <alpha-value>)',
      black: 'rgb(0 0 0 / <alpha-value>)',
      error: 'rgb(248 113 113 / <alpha-value>)',
      green: 'rgb(0 188 125 / <alpha-value>)',
      transparent: 'transparent',
    }
  },

  plugins: [
    plugin(({ matchUtilities, theme }) => {
      matchUtilities({
        size: value => ({
          width: value,
          height: value,
        }),
      }, {
        values: theme('width'),
      })
    }),
  ],
}
