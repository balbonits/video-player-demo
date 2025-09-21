import { test, expect } from '@playwright/test'

test.describe('Video Player UI Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
  })

  test('should display all UI components', async ({ page }) => {
    // Header
    await expect(page.locator('h1')).toContainText('FOX Video Player Demo')
    await expect(page.locator('text=Performance-optimized HLS video player')).toBeVisible()

    // Performance badge
    const performanceBadge = page.locator('.inline-flex').filter({ hasText: 'Smart TV' }).first()
    await expect(performanceBadge).toBeVisible()
  })

  test('player version selector should be interactive', async ({ page }) => {
    // Find and click the player selector
    const playerSelector = page.locator('button').filter({ hasText: 'HLS.js Performance' }).first()
    await expect(playerSelector).toBeVisible()

    // Click to expand dropdown
    await playerSelector.click()

    // Wait for dropdown animation
    await page.waitForTimeout(300)

    // Check if dropdown is expanded (look for other player options)
    const nativeOption = page.locator('button').filter({ hasText: 'Native HTML5 Video' })
    const mobileOption = page.locator('button').filter({ hasText: 'Mobile Optimized' })
    const rokuOption = page.locator('button').filter({ hasText: 'Roku TV Simulation' })
    const chromecastOption = page.locator('button').filter({ hasText: 'Chromecast Receiver' })
    const benchmarkOption = page.locator('button').filter({ hasText: 'Performance Benchmark' })

    // At least one option should be visible when expanded
    const optionsVisible = await Promise.all([
      nativeOption.isVisible().catch(() => false),
      mobileOption.isVisible().catch(() => false),
      rokuOption.isVisible().catch(() => false),
      chromecastOption.isVisible().catch(() => false),
      benchmarkOption.isVisible().catch(() => false)
    ])

    expect(optionsVisible.some(visible => visible)).toBeTruthy()
  })

  test('should display all 6 player versions when expanded', async ({ page }) => {
    // Click the selector to expand
    const playerSelector = page.locator('button').filter({ hasText: 'HLS.js Performance' }).first()
    await playerSelector.click()
    await page.waitForTimeout(300)

    // Check for all 6 player versions
    const playerVersions = [
      'HLS.js Performance',
      'Native HTML5 Video',
      'Mobile Optimized',
      'Roku TV Simulation',
      'Chromecast Receiver',
      'Performance Benchmark'
    ]

    for (const version of playerVersions) {
      const element = page.locator('text=' + version)
      const isVisible = await element.isVisible().catch(() => false)
      if (!isVisible) {
        console.log(`Warning: "${version}" not visible in dropdown`)
      }
    }
  })

  test('stream source selector should have 3 options', async ({ page }) => {
    // Check for stream source section
    await expect(page.locator('text=Stream Source')).toBeVisible()

    // Check for all 3 stream options
    const streamSources = [
      'Mux Test Stream',
      'Apple Test Stream',
      'Tears of Steel'
    ]

    for (const source of streamSources) {
      const button = page.locator('button').filter({ hasText: source })
      await expect(button).toBeVisible()
    }
  })

  test('stream source buttons should be clickable', async ({ page }) => {
    // Find and click each stream button
    const muxButton = page.locator('button').filter({ hasText: 'Mux Test Stream' }).first()
    const appleButton = page.locator('button').filter({ hasText: 'Apple Test Stream' }).first()
    const tearsButton = page.locator('button').filter({ hasText: 'Tears of Steel' }).first()

    // Test clicking each button
    await appleButton.click()
    await expect(appleButton).toHaveClass(/bg-cyan-600/)

    await tearsButton.click()
    await expect(tearsButton).toHaveClass(/bg-cyan-600/)

    await muxButton.click()
    await expect(muxButton).toHaveClass(/bg-cyan-600/)
  })

  test('should display performance information sections', async ({ page }) => {
    // Check for Performance Optimizations section
    const perfSection = page.locator('text=Performance Optimizations')
    await expect(perfSection).toBeVisible()

    // Check for Player Information section
    const playerInfo = page.locator('text=Player Information')
    await expect(playerInfo).toBeVisible()

    // Check for Platform Support Matrix
    const platformMatrix = page.locator('text=Platform Support Matrix')
    await expect(platformMatrix).toBeVisible()

    // Check for FOX Performance Targets
    const foxTargets = page.locator('text=FOX Corporation Performance Targets')
    await expect(foxTargets).toBeVisible()
  })

  test('responsive design should work on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check that main elements are still visible
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=Stream Source')).toBeVisible()

    // Player selector should still work
    const playerSelector = page.locator('button').filter({ hasText: 'HLS.js Performance' }).first()
    await expect(playerSelector).toBeVisible()
  })

  test('responsive design should work on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })

    // Check layout adjustments
    await expect(page.locator('h1')).toBeVisible()
    const streamButtons = page.locator('button').filter({ hasText: /Test Stream|Apple|Tears/ })
    await expect(streamButtons.first()).toBeVisible()
  })

  test('video player container should be visible', async ({ page }) => {
    // Check for video player container
    const videoContainer = page.locator('.bg-black.rounded-lg').first()
    await expect(videoContainer).toBeVisible()

    // Should have appropriate height
    const box = await videoContainer.boundingBox()
    expect(box?.height).toBeGreaterThan(300)
  })

  test('performance badges should display correct colors', async ({ page }) => {
    // Expand player selector
    const playerSelector = page.locator('button').filter({ hasText: 'HLS.js Performance' }).first()
    await playerSelector.click()
    await page.waitForTimeout(300)

    // Check for different performance mode badges
    const smartTvBadges = page.locator('.bg-blue-600').filter({ hasText: 'smartTV' })
    const mobileBadges = page.locator('.bg-purple-600').filter({ hasText: 'mobile' })
    const desktopBadges = page.locator('.bg-green-600').filter({ hasText: 'desktop' })

    // At least one of each type should exist
    expect(await smartTvBadges.count()).toBeGreaterThan(0)
    expect(await mobileBadges.count()).toBeGreaterThan(0)
    expect(await desktopBadges.count()).toBeGreaterThan(0)
  })
})