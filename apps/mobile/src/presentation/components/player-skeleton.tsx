import { View } from 'react-native'
import Shimmer from 'react-native-modern-shimmer'

export function PlayerSkeleton() {
	return (
		<View className="flex-1 items-center justify-center p-6">
			<View className="w-full max-w-md items-center">
				<Shimmer
					width={256}
					height={256}
					borderRadius={16}
					speed={1200}
					className="mb-6"
				/>

				<Shimmer
					width={200}
					height={20}
					borderRadius={5}
					speed={1100}
					className="mb-2"
				/>

				<Shimmer
					width={140}
					height={16}
					borderRadius={4}
					speed={1000}
					className="mb-1"
				/>

				<Shimmer
					width={100}
					height={14}
					borderRadius={4}
					speed={900}
					className="mb-6"
				/>

				<Shimmer
					width={'100%'}
					height={4}
					borderRadius={2}
					speed={1000}
					className="mb-4"
				/>

				<View className="flex-row items-center justify-center gap-6">
					<Shimmer width={32} height={32} borderRadius={16} speed={1100} />
					<Shimmer width={64} height={64} borderRadius={32} speed={1200} />
					<Shimmer width={32} height={32} borderRadius={16} speed={1000} />
				</View>
			</View>
		</View>
	)
}
