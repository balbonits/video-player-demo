/**
 * Simple Test to verify setup
 */

import { test, expect } from '@playwright/test'

test.describe('Simple Player Test', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // Wait for the main title
    const title = await page.locator('h1').first()
    await expect(title).toContainText('FOX Video Player Demo')

    // Check if player selector is visible
    const selector = await page.locator('button:has-text("HLS.js Performance")')
    await expect(selector).toBeVisible()

    console.log('✅ Application loaded successfully')
  })

  test('should have video player container', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // Look for video container
    const container = await page.locator('.bg-black.rounded-lg').first()
    await expect(container).toBeVisible()

    console.log('✅ Video player container found')
  })
})