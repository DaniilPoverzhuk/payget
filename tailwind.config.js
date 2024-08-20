/** @type {import('tailwindcss').Config} */

import plg from 'tailwindcss/plugin'

// const plugin = require('tailwindcss/plugin')
const plugin = plg


module.exports = {
  mode: 'jit',
  purge: [
    './public/**/*.html',
    './src/**/*.{js,vue}',
  ],
  darkMode: 'class',
  theme: {
    screens: {
      lg: { min: '1200px' },
      xs: { max: '1199px' },
    },
    extend: {
      spacing: {
        120: '120px'
      },
      inset: {
        80: '80px',
        250: '-250px',
      },
      minHeight: {
        60: '60px',
        177: '177px',
      },
      maxHeight: {
        80: '80px',
        85: '85%',
        304: '304px',
        353: '353px',
      },
      maxWidth: {
        40: '40px',
        80: '80px',
        100: '100px',
        177: '177px',
        300: '300px',
        384: '384px',
        155: '155px',
        118: '118px',
        353: '353px',
        800: '800px',
        'list-name': 'calc(100% - 40px)',
        content: 'calc(100% - 40px)',
        message: 'calc(100% - 48px)',
      },
      minWidth: {
        240: '240px',
        178: '178px',
      },
      width: {
        80: '80px',
        195: '195px',
        326: '326px',
        384: '384px',
        'width-calc-110': 'calc(100% - 110px)',
        'width-calc-captcha': 'calc(100% - 42px)',
      },
      height: {
        80: '80px',
        'calc-support': 'calc(100vh - 172px)',
        'calc-support-mobile': 'calc(100vh - 217px)',
        'calc-ticket': 'calc(100vh - 140px)',
        'calc-search': 'calc(100vh - 360px)',
        'calc-ticket-mobile': 'calc(100vh - 130px)',
        106: '106px',
        560: '560px',
      },
      zIndex: {
        '-99': '-99',
        '-1': '-1',
        1: 1,
        100: '100',
        200: '200',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      transitionDuration: {
        t: '0.2s',
      },
      transitionProperty: {
        transform: 'transform',
        height: 'height',
      },
      boxShadow: {
        base: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
        'box-shadow-table': '0 -2px 0 #f4f5f7 inset',
        'box-shadow-top': '0 2px 0 #9a4fd5 inset',
      },
    },
    colors: {
      transparent: 'transparent',
      mine: '#9a4fd5',
      white: '#ffffff',
      success: '#3abf8f',
      popup: '#13031E',
      primary: '#9a4fd5',
      'primary-light': '#f7f8ff',
      'primary-medium': '#EBDCF7',
      'primary-dark': '#8745ba',

      secondary: {
        100: '#FFFBE7',
        400: '#fdea87',
        600: '#f7df63',
        800: '#C4B04C',
      },
      // variable from tailwind
      gray: {
        15: '#e6e6ea',
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
      },
      red: {
        100: '#FEE2E2',
        300: '#FCA5A5',
        400: '#d44f77',
        500: '#EF4444',
        600: '#DC2626',
        700: '#B91C1C',
        900: '#7F1D1D',
        light: '#FCA5A5',
      },
      yellow: {
        400: '#FBBF24',
        500: '#F59E0B',
      },
      indigo: {
        50: '#EEF2FF',
        300: '#2AABEE',
        400: '#229ED9',
        500: '#6366F1',
        800: '#3730A3',
      },
      green: {
        100: '#D1FAE5',
        500: '#10B981',
        600: '#059669',
        700: '#047857',
      },
      dark: {
        'c-white': '#131127',
        'c-gray-20': '#5a5972',
        'c-gray-70': '#b6b4c1',
        'c-gray-80': '#e2dfec',
        'primary-light': '#191830',
      },
      sharing: {
        facebook: '#4e6297',
        vk: '#7294c7',
        telegram: '#2f89ce',
        twitter: '#55ace3',
        viber: '#7c509a',
        whatsapp: '#48c95f',
      },
    },
  },
  plugins: [
    // require('@tailwindcss/line-clamp'),
    require('@tailwindcss/forms'),
    require('tailwind-scrollbar'),
    plugin(({ addVariant, e }) => {
      addVariant('nth-child', ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => `.${e(`nth-child${separator}${className}`)}:nth-child(n+2)`)
      })
    }),
    plugin(({ addVariant, e }) => {
      addVariant('not-disabled', ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => `.${e(`not-disabled${separator}${className}`)}:not(:disabled)`)
      })
    }),
  ],
  variants: {
    scrollbar: ['rounded'],
    extend: {
      margin: ['even', 'nth-child'],
      a: ['not-disabled'],
    },
  },
}


