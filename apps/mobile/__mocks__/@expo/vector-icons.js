const React = require('react')

const Ionicons = React.forwardRef(
	({ name, size = 24, color = '#000', testID, style, ...props }, ref) => {
		return React.createElement(
			'span',
			{
				'data-testid': testID || `icon-${name}`,
				style: { fontSize: size, color, ...style },
				ref,
				...props,
			},
			name,
		)
	},
)
Ionicons.displayName = 'Ionicons'

module.exports = {
	Ionicons,
	MaterialIcons: Ionicons,
	FontAwesome: Ionicons,
	Feather: Ionicons,
	MaterialCommunityIcons: Ionicons,
	AntDesign: Ionicons,
	Entypo: Ionicons,
	EvilIcons: Ionicons,
	Foundation: Ionicons,
	Octicons: Ionicons,
	SimpleLineIcons: Ionicons,
	Zocial: Ionicons,
}
