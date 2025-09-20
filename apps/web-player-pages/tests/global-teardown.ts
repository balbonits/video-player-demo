/**
 * Global teardown for Playwright tests
 * Cleans up after all test suites have completed
 */

async function globalTeardown() {
  console.log('Global teardown: Cleaning up test artifacts')

  // Clean up any test servers or processes if needed
  // This runs after all tests are complete

  // You can add cleanup logic here such as:
  // - Stopping test servers
  // - Clearing test databases
  // - Removing temporary files
  // - Closing connections
}

export default globalTeardown;