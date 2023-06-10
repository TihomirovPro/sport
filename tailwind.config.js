const plugin = require('tailwindcss/plugin')

module.exports = {
  darkMode: 'class',
  separator: '_',

  content: [
    './components/**/*.{js,ts,vue}',
    './layouts/**/*.{js,ts,vue}',
    './pages/**/*.{js,ts,vue}',
    './view/**/*.{js,ts,vue}',
  ],


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
