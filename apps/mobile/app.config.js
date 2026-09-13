const appConfig = require('./app.json')

module.exports = () => ({
	...appConfig,
	expo: {
		...appConfig.expo,
		extra: {
			...appConfig.expo.extra,
			apiBase: process.env.EXPO_PUBLIC_API_BASE,
		},
	},
})
