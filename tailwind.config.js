/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                // Neon palette
                neon: {
                    cyan: '#00e5ff',
                    violet: '#a855f7',
                    amber: '#f59e0b',
                    green: '#22c55e',
                    red: '#ef4444',
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
                xl: "calc(var(--radius) + 4px)",
                '2xl': "calc(var(--radius) + 8px)",
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-neon': 'linear-gradient(135deg, #00e5ff, #7c3aed)',
                'gradient-amber': 'linear-gradient(135deg, #f59e0b, #ef4444)',
                'gradient-dashboard': 'linear-gradient(135deg, rgba(0,229,255,0.1), rgba(139,92,246,0.1))',
            },
            boxShadow: {
                'neon-cyan': '0 0 20px rgba(0, 229, 255, 0.4)',
                'neon-cyan-lg': '0 0 40px rgba(0, 229, 255, 0.6)',
                'neon-violet': '0 0 20px rgba(168, 85, 247, 0.4)',
                'neon-amber': '0 0 20px rgba(245, 158, 11, 0.4)',
                'neon-green': '0 0 20px rgba(34, 197, 94, 0.4)',
                'glass': '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                "fade-in": {
                    from: { opacity: "0" },
                    to: { opacity: "1" },
                },
                "slide-up": {
                    from: { opacity: "0", transform: "translateY(24px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                "scale-in": {
                    from: { opacity: "0", transform: "scale(0.95)" },
                    to: { opacity: "1", transform: "scale(1)" },
                },
                "glow-pulse": {
                    "0%, 100%": { boxShadow: "0 0 12px rgba(0,229,255,0.3)" },
                    "50%": { boxShadow: "0 0 24px rgba(0,229,255,0.7), 0 0 48px rgba(0,229,255,0.2)" },
                },
                "float": {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                "spin-slow": {
                    from: { transform: "rotate(0deg)" },
                    to: { transform: "rotate(360deg)" },
                },
                "ping-once": {
                    "0%": { transform: "scale(1)", opacity: "1" },
                    "100%": { transform: "scale(2)", opacity: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-in": "fade-in 0.4s ease-out both",
                "slide-up": "slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
                "scale-in": "scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
                "glow-pulse": "glow-pulse 2s ease-in-out infinite",
                "float": "float 6s ease-in-out infinite",
                "spin-slow": "spin-slow 8s linear infinite",
                "ping-once": "ping-once 0.6s ease-out forwards",
            },
        },
    },
    plugins: [],
}
