/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                cream: {
                    DEFAULT: '#FDFBF7',
                    dark: '#F5F0E6',
                },
                pink: {
                    DEFAULT: '#F4C2C2',
                },
                green: {
                    DEFAULT: '#C1D8C3',
                },
                milktea: {
                    DEFAULT: '#DBC1AC',
                },
                text: {
                    DEFAULT: '#5A5A5A',
                },
            },
            fontFamily: {
                main: ['"Kiwi Maru"', 'serif'],
                hand: ['"Zeyada"', 'cursive'],
            },
        },
    },
    plugins: [],
}
