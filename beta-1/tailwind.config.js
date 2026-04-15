/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './app.jsx',
    './**/*.{js,jsx,ts,tsx}',
    '!./node_modules/**',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        // Base (reference CSS variables — dark mode handled by [data-theme="dark"])
        bg: 'var(--color-bg)',
        'bg-subtle': 'var(--color-bg-subtle)',
        fg: 'var(--color-fg)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          fg: 'var(--color-primary-fg)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          fg: 'var(--color-secondary-fg)',
        },
        muted: 'var(--color-muted)',
        border: 'var(--color-border)',
        input: 'var(--color-input)',

        // Brand
        accent: {
          DEFAULT: 'var(--color-accent)',
          fg: 'var(--color-accent-fg)',
          dark: 'var(--color-accent-dark)',
          bg: 'var(--color-accent-bg)',
          hover: 'var(--color-accent-hover)',
        },

        // Semantic
        warn: {
          DEFAULT: 'var(--color-warn)',
          bg: 'var(--color-warn-bg)',
          border: 'var(--color-warn-border)',
        },
        green: {
          DEFAULT: 'var(--color-green)',
          bg: 'var(--color-green-bg)',
          border: 'var(--color-green-border)',
        },
        red: {
          DEFAULT: 'var(--color-red)',
          bg: 'var(--color-red-bg)',
          border: 'var(--color-red-border)',
        },
        lime: {
          DEFAULT: 'var(--color-lime)',
          fg: 'var(--color-lime-fg)',
        },
      },
      borderRadius: {
        sm: '4px',   // override Tailwind default 2px — matches --radius-sm
        md: '6px',   // matches default
        lg: '8px',   // matches default
        xl: '12px',  // matches default
        full: '9999px',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      spacing: {
        // Default Tailwind 4px base matches our tokens (1=4px, 2=8px, 4=16px, 6=24px, etc.)
        // Add custom layout tokens:
        sidebar: 'var(--sidebar-w)', // 240px
        topbar: 'var(--topbar-h)',   // 56px
      },
      backgroundColor: {
        overlay: 'var(--color-overlay)',
      },
    },
  },
  plugins: [],
  // Don't purge — we still have lots of legacy CSS classes during migration
  corePlugins: {
    preflight: false, // don't reset CSS — our styles.css has its own base
  },
};
