/** @type {import('tailwindcss').Config} */
export default {
	content: [
	    "./index.html",
	    "./src/**/*.{js,ts,jsx,tsx}", // Scan everything in src
	    "./*.{js,ts,jsx,tsx}",       // Scan files in the current directory (like main.tsx)
	  ],
  theme: {
    extend: {
      colors: {
        nexus: {
          dark: '#0f172a',
          accent: '#38bdf8',
        }
      }
    },
  },
  plugins: [],
}
