/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./App.tsx',
		'./src/**/*.{ts,tsx}',
	],
	presets: [require('nativewind/preset')],
	theme: {
		extend: {
			colors: {
				bg: '#0D0D0D',
				surface: '#262330',
				'surface-hover': '#302D3B',
				primary: '#FACC16',
				'text-primary': '#FFFFFF',
				'text-secondary': '#404047',
				border: '#262330',
			},
		},
	},
	plugins: [],
}
