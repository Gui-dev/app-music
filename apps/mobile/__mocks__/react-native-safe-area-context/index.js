const React = require('react')

const SafeAreaView = React.forwardRef(
	({ children, style, testID, ...props }, ref) => {
		return React.createElement(
			'div',
			{ 'data-testid': testID, style, ref, ...props },
			children,
		)
	},
)
SafeAreaView.displayName = 'SafeAreaView'

const useSafeAreaInsets = () => ({ top: 0, bottom: 0, left: 0, right: 0 })

const SafeAreaProvider = ({ children }) =>
	React.createElement(React.Fragment, null, children)

module.exports = {
	SafeAreaView,
	SafeAreaProvider,
	useSafeAreaInsets,
	useSafeAreaFrame: () => ({ x: 0, y: 0, width: 375, height: 812 }),
	SafeAreaInsetsContext: {
		Consumer: ({ children }) =>
			children({ top: 0, bottom: 0, left: 0, right: 0 }),
		Provider: ({ children }) =>
			React.createElement(React.Fragment, null, children),
	},
}
