/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          bg: '#f5f6f3',
          card: '#ffffff',
          border: '#e5e7e3',
          navy: '#1e293b',
          header: '#0f172a',
          slate: '#64748b',
          green: '#15803d',
          'green-dark': '#166534',
          'green-light': '#f0fdf4',
          saffron: '#d97706',
          'saffron-light': '#fffbeb',
          accent: '#2563eb',
          success: '#16a34a',
          warning: '#d97706',
          danger: '#dc2626',
        }
      },
      borderRadius: {
        'gov': '6px',
        'gov-lg': '8px',
      },
      boxShadow: {
        'gov': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'gov-md': '0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
