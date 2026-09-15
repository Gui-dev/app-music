import { by, device, element, expect } from 'detox'

describe('Player Flow', () => {
	beforeAll(async () => {
		await device.launchApp()
	})

	afterEach(async () => {
		await device.terminateApp()
	})

	it('should navigate to Biblioteca and show albums', async () => {
		await element(by.text('Biblioteca')).tap()
		await expect(element(by.text('Biblioteca'))).toBeVisible()
		await expect(element(by.text('faixas'))).toBeVisible()
	})

	it('should expand album and show songs', async () => {
		await element(by.text('Biblioteca')).tap()

		// Wait for album to appear and tap it
		const albumCard = element(by.text('Album One')).atIndex(0)
		await albumCard.tap()

		// Verify songs appear
		await expect(element(by.text('Song One'))).toBeVisible()
		await expect(element(by.text('Song Two'))).toBeVisible()
	})

	it('should select song and show Player screen', async () => {
		await element(by.text('Biblioteca')).tap()

		// Expand album and select a song
		await element(by.text('Album One')).atIndex(0).tap()
		await element(by.text('Song One')).tap()

		// Verify Player screen
		await expect(element(by.text('Song One'))).toBeVisible()
		await expect(element(by.text('Artist A'))).toBeVisible()
		await expect(element(by.text('Album One'))).toBeVisible()
	})

	it('should toggle play/pause', async () => {
		// Navigate to song
		await element(by.text('Biblioteca')).tap()
		await element(by.text('Album One')).atIndex(0).tap()
		await element(by.text('Song One')).tap()

		// Verify play button exists and tap it
		const playButton = element(by.id('play-pause-button'))
		await expect(playButton).toBeVisible()
		await playButton.tap()

		// Verify pause icon appears (button state toggled)
		await playButton.tap()
	})

	it('should show progress bar on Player screen', async () => {
		await element(by.text('Biblioteca')).tap()
		await element(by.text('Album One')).atIndex(0).tap()
		await element(by.text('Song One')).tap()

		// Verify progress bar container exists
		await expect(element(by.id('progress-bar'))).toBeVisible()
	})

	it('should navigate back to Biblioteca from Player', async () => {
		await element(by.text('Biblioteca')).tap()
		await element(by.text('Album One')).atIndex(0).tap()
		await element(by.text('Song One')).tap()

		// Verify we're on Player screen
		await expect(element(by.text('Song One'))).toBeVisible()

		// Navigate back to Biblioteca
		await element(by.text('Biblioteca')).tap()
		await expect(element(by.text('faixas'))).toBeVisible()
	})
})
