/**
 * Playwright Global Setup
 * Sam (QA) - Test environment initialization
 */

import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up test environment...')

  // Create browser instance for setup tasks
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // Check if the development server is running
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000'

    console.log(`📡 Checking server at ${baseURL}...`)

    await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 })

    // Verify the page loads correctly
    const title = await page.title()
    console.log(`✅ Server is running. Page title: ${title}`)

    // Initialize any global test data or configurations
    await page.evaluate(() => {
      // Set up global test flags
      window.localStorage.setItem('test-mode', 'true')
      window.localStorage.setItem('performance-monitoring', 'enabled')

      // Mock external services for consistent testing
      window.localStorage.setItem('mock-hls-streams', 'true')
    })

    console.log('✅ Test environment configured')

  } catch (error) {
    console.error('❌ Failed to set up test environment:', error)
    throw error
  } finally {
    await browser.close()
  }

  console.log('🎯 Global setup complete\n')
}

export default globalSetup