/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
const config = {
	darkMode: ["class"],
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	safelist: ["dark"],
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px"
			}
		},
		extend: {
			fontFamily: {
				sans: ["Inter Variable", "Inter", ...defaultTheme.fontFamily.sans],
        		serif: ["Newsreader", ...defaultTheme.fontFamily.serif],
			},
			colors: {
				'regal-blue': '#243c5a',
				'accent-color': '#c4b5fd',
				'light-accent': '#EDE9FE',
				'dark-accent': '#A78BFA',
			}
		}
	},
};

export default config;
