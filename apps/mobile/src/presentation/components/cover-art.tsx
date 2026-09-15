import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { Image, View } from 'react-native'

interface CoverArtProps {
	coverUrl: string | null
	size?: number
	className?: string
}

export function CoverArt({ coverUrl, size = 48, className }: CoverArtProps) {
	const [hasError, setHasError] = useState(false)

	if (!coverUrl || hasError) {
		return (
			<View
				className={`items-center justify-center rounded-lg bg-surface-hover ${className ?? ''}`}
				style={{ width: size, height: size }}
			>
				<Ionicons name="musical-notes" size={size * 0.5} color="#FACC16" />
			</View>
		)
	}

	return (
		<Image
			source={{ uri: coverUrl }}
			className={`rounded-lg ${className ?? ''}`}
			style={{ width: size, height: size }}
			onError={() => setHasError(true)}
			accessibilityLabel="Album cover"
		/>
	)
}
