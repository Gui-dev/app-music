import { by, device, element, expect } from 'detox'

beforeAll(async () => {
	await device.launchApp()
})

afterEach(async () => {
	await device.terminateApp()
})
