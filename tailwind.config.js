/** @type {import('tailwindcss').Config} */
module.exports = {
  //presets: [require("./src/tailwind-preset")], 
  
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  
  darkMode: ["class"],
  
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB", 
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "#FCD34D", 
          foreground: "hsl(var(--secondary-foreground))",
        },
        success: "#10B981", 
        danger: "#EF4444",
        warning: "#F59E0B",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  
  plugins: [require("tailwindcss-animate")], 
}