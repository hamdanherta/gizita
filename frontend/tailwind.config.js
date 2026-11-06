/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warna kedua dari lampiran: #00AD9A (Teal / Turquoise)
        teal: {
          50: '#e6f9f7',
          100: '#cdede9',
          200: '#9fe0d8',
          300: '#6ed1c4',
          400: '#3bc1b0',
          500: '#00AD9A',
          600: '#009685',
          700: '#007c6e',
          800: '#006358',
          900: '#055148',
          950: '#002f2a',
        },
        brand: {
          50: '#e6f9f7',
          100: '#cdede9',
          200: '#9fe0d8',
          300: '#6ed1c4',
          400: '#3bc1b0',
          500: '#00AD9A',
          600: '#009685',
          700: '#007c6e',
          800: '#006358',
          900: '#055148',
          950: '#002f2a',
        },
        // Warna ketiga dari lampiran: #C3D400 (Lime / Citron)
        lime: {
          50: '#f8fae5',
          100: '#f0f6be',
          200: '#e4ee84',
          300: '#d5e449',
          400: '#cbdb1d',
          500: '#C3D400',
          600: '#9fab00',
          700: '#788204',
          800: '#5f660a',
          900: '#50550d',
          950: '#2b2f02',
        },
        citron: {
          50: '#f8fae5',
          100: '#f0f6be',
          200: '#e4ee84',
          300: '#d5e449',
          400: '#cbdb1d',
          500: '#C3D400',
          600: '#9fab00',
          700: '#788204',
          800: '#5f660a',
          900: '#50550d',
          950: '#2b2f02',
        },
        surface: {
          light: '#F8FAFC', // Latar belakang utama tetap dominan putih / abu terang
          card: '#FFFFFF',  // Kartu dominan putih
          dark: '#0F172A',  // Teks gelap
        }
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px -2px rgba(15, 23, 42, 0.05), 0 1px 3px -1px rgba(15, 23, 42, 0.05)',
        'soft-md': '0 4px 16px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'soft-lg': '0 10px 25px -4px rgba(15, 23, 42, 0.08), 0 6px 12px -2px rgba(15, 23, 42, 0.03)',
      }
    },
  },
  plugins: [],
}
