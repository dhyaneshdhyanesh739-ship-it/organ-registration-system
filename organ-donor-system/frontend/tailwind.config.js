/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fef2f2',
                    100: '#fee2e2',
                    200: '#fecaca',
                    300: '#fca5a5',
                    400: '#f87171',
                    500: '#ef4444',
                    600: '#dc2626',
                    700: '#b91c1c',
                    800: '#991b1b',
                    900: '#7f1d1d',
                },
                secondary: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                },
                royal: {
                    gold: '#E5C158',
                    'gold-light': '#F5D77F',
                    'gold-dark': '#B8860B',
                    amber: '#F59E0B',
                    obsidian: '#090B14',
                    'obsidian-card': 'rgba(15, 18, 38, 0.75)',
                    ruby: '#E63946',
                    'ruby-dark': '#8B0000',
                    emerald: '#10B981',
                    sapphire: '#3B82F6',
                    velvet: '#2E1065',
                },
            },
            fontFamily: {
                sans: ['Outfit', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
                royal: ['Cinzel', 'serif'],
            },
            boxShadow: {
                'brutal-gold': '5px 5px 0px 0px #E5C158',
                'brutal-dark': '5px 5px 0px 0px #000000',
                'brutal-ruby': '5px 5px 0px 0px #E63946',
                'brutal-emerald': '5px 5px 0px 0px #10B981',
                'royal-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(229, 193, 88, 0.25)',
                'royal-glow': '0 0 30px rgba(229, 193, 88, 0.35)',
                'ruby-glow': '0 0 30px rgba(230, 57, 70, 0.4)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'slide-down': 'slideDown 0.5s ease-out',
                'scale-in': 'scaleIn 0.3s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'gold-shimmer': 'goldShimmer 4s ease infinite',
                'royal-float': 'royalFloat 6s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.9)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                goldShimmer: {
                    '0%, 100%': { 'background-position': '0% 50%' },
                    '50%': { 'background-position': '100% 50%' },
                },
                royalFloat: {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '50%': { transform: 'translateY(-12px) rotate(1deg)' },
                },
            },
            backdropBlur: {
                xs: '2px',
                xl: '20px',
                '2xl': '30px',
            },
        },
    },
    plugins: [],
}
