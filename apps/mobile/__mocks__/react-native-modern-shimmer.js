const React = require('react')

function Shimmer(props) {
	return React.createElement('div', {
		'data-testid': props.testID,
		'aria-label': props.accessibilityLabel,
		style: { width: props.width, height: props.height },
	})
}

module.exports = { default: Shimmer }
