const store = {}

const AsyncStorage = {
	getItem: vi.fn(async (key) => store[key] ?? null),
	setItem: vi.fn(async (key, value) => {
		store[key] = value
	}),
	removeItem: vi.fn(async (key) => {
		delete store[key]
	}),
	clear: vi.fn(async () => {
		for (const key of Object.keys(store)) {
			delete store[key]
		}
	}),
}

export default AsyncStorage
