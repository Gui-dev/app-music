const React = require('react')

const createMockComponent = (name) => {
	const Component = React.forwardRef((props, ref) => {
		const {
			children,
			testID,
			style,
			accessibilityLabel,
			onPress,
			onClick,
			...otherProps
		} = props
		return React.createElement(
			'div',
			{
				'data-testid': testID,
				'aria-label': accessibilityLabel,
				role: onPress ? 'button' : undefined,
				style,
				ref,
				onClick: onPress || onClick,
				...otherProps,
			},
			children,
		)
	})
	Component.displayName = name
	return Component
}

const FlatList = React.forwardRef(
	({ data, renderItem, keyExtractor, testID, ...props }, ref) => {
		return React.createElement(
			'div',
			{ 'data-testid': testID, ref, ...props },
			data?.map((item, index) => renderItem({ item, index })),
		)
	},
)
FlatList.displayName = 'FlatList'

const StyleSheet = {
	create: (styles) => styles,
	flatten: (style) => {
		if (Array.isArray(style)) {
			return Object.assign({}, ...style.filter(Boolean))
		}
		return style || {}
	},
	compose: (...styles) => styles.flat().filter(Boolean),
}

module.exports = {
	ActivityIndicator: createMockComponent('ActivityIndicator'),
	Button: createMockComponent('Button'),
	FlatList,
	Image: createMockComponent('Image'),
	Pressable: createMockComponent('Pressable'),
	ScrollView: createMockComponent('ScrollView'),
	Switch: createMockComponent('Switch'),
	Text: createMockComponent('Text'),
	TextInput: createMockComponent('TextInput'),
	TouchableHighlight: createMockComponent('TouchableHighlight'),
	TouchableOpacity: createMockComponent('TouchableOpacity'),
	TouchableWithoutFeedback: createMockComponent('TouchableWithoutFeedback'),
	View: createMockComponent('View'),
	VirtualizedList: createMockComponent('VirtualizedList'),
	Modal: createMockComponent('Modal'),
	SafeAreaView: createMockComponent('SafeAreaView'),
	StatusBar: { currentHeight: 0 },
	Platform: {
		OS: 'web',
		select: (obj) => obj.web || obj.default,
		Version: 0,
	},
	StyleSheet,
	useWindowDimensions: () => ({
		width: 375,
		height: 812,
		scale: 2,
		fontScale: 1,
	}),
	Dimensions: {
		get: () => ({ width: 375, height: 812, scale: 2, fontScale: 1 }),
		addEventListener: () => {},
		removeEventListener: () => {},
	},
	Linking: {
		canOpenURL: () => Promise.resolve(false),
		openURL: () => Promise.resolve(),
		openSettings: () => Promise.resolve(),
		getInitialURL: () => Promise.resolve(''),
		addEventListener: () => ({ remove: () => {} }),
	},
	Keyboard: {
		addListener: () => ({ remove: () => {} }),
		dismiss: () => {},
		scheduleDismiss: () => {},
	},
	PixelRatio: {
		get: () => 2,
		getPixelSizeForLayoutSize: (size) => size * 2,
		roundToNearestPixel: (size) => Math.round(size * 2) / 2,
	},
	findNodeHandle: () => 0,
	processColor: (color) => color,
	PanResponder: {
		create: (config) => ({
			panHandlers: {
				onStartShouldSetResponder: config.onStartShouldSetPanResponder,
				onResponderGrant: config.onPanResponderGrant,
				onResponderMove: config.onPanResponderMove,
				onResponderRelease: config.onPanResponderRelease,
			},
		}),
	},
	NativeModules: {},
	NativeEventEmitter: class NativeEventEmitter {
		addListener() {
			return { remove: () => {} }
		}
		removeAllListeners() {}
		removeSubscription() {}
	},
}
