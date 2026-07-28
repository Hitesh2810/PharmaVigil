/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#050816',
        surface: '#0B1120',
        'surface-2': '#0E1628',
        primary: '#3B82F6',
        secondary: '#06B6D4',
        accent: '#8B5CF6',
        muted: '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'hero-radial':
          'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(59,130,246,0.22), transparent 60%)',
        'brand-gradient':
          'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)',
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(59,130,246,0.45)',
        'glow-cyan': '0 0 40px -10px rgba(6,182,212,0.45)',
        'glow-accent': '0 0 40px -10px rgba(139,92,246,0.45)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-28px) translateX(14px)' },
        },
      },
      animation: {
        float: 'float 9s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
