/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand
        'brand-blue': '#1456f0',
        'brand-sky': '#3daeff',
        'brand-pink': '#ea5ec1',
        // Blue scale
        'primary-200': '#bfdbfe',
        'primary-light': '#60a5fa',
        'primary-500': '#3b82f6',
        'primary-600': '#2563eb',
        'primary-700': '#1d4ed8',
        'brand-deep': '#17437d',
        // Text
        'text-primary': '#222222',
        'text-dark': '#18181b',
        'text-charcoal': '#181e25',
        'text-secondary': '#45515e',
        'text-muted': '#8e8e93',
        // Surface
        'surface-white': '#ffffff',
        'surface-light': '#f0f0f0',
        'border-light': '#f2f3f5',
        'border-gray': '#e5e7eb',
        // Dark
        'footer-bg': '#181e25',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['Outfit', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        roboto: ['Roboto', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'tag': '4px',
        'btn': '8px',
        'card-sm': '11px',
        'card-md': '13px',
        'card': '16px',
        'card-lg': '20px',
        'card-hero': '24px',
        'pill': '9999px',
      },
      boxShadow: {
        'card': 'rgba(0, 0, 0, 0.08) 0px 4px 6px',
        'card-ambient': 'rgba(0, 0, 0, 0.08) 0px 0px 22.576px',
        'card-brand': 'rgba(44, 30, 116, 0.16) 0px 0px 15px',
        'card-brand-dir': 'rgba(44, 30, 116, 0.11) 6.5px 2px 17.5px',
        'card-elevated': 'rgba(36, 36, 36, 0.08) 0px 12px 16px -4px',
      },
      lineHeight: {
        'tight': '1.10',
        'body': '1.50',
        'caption': '1.70',
      },
      fontSize: {
        'hero': ['80px', { lineHeight: '1.10', fontWeight: '500' }],
        'section': ['31px', { lineHeight: '1.50', fontWeight: '600' }],
        'card-title': ['28px', { lineHeight: '1.71', fontWeight: '500' }],
        'sub': ['24px', { lineHeight: '1.50', fontWeight: '500' }],
        'feature': ['18px', { lineHeight: '1.50', fontWeight: '500' }],
        'body-lg': ['20px', { lineHeight: '1.50', fontWeight: '500' }],
        'nav': ['14px', { lineHeight: '1.50', fontWeight: '500' }],
        'btn-sm': ['13px', { lineHeight: '1.50', fontWeight: '600' }],
        'label': ['12px', { lineHeight: '1.50', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
};
