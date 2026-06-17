export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          950: '#0f172a',
          900: '#111827',
          800: '#1e293b',
          700: '#334155',
          600: '#475569'
        },
        accent: {
          500: '#22d3ee',
          400: '#38bdf8'
        }
      },
      boxShadow: {
        glow: '0 20px 60px rgba(14, 165, 233, 0.18)'
      }
    }
  },
  plugins: []
}
