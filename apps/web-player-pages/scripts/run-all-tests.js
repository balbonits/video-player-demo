#!/usr/bin/env node
/**
 * Comprehensive Test Execution Script
 * Sam (QA) - Execute all tests with proper sequencing and reporting
 */

const { execSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

class TestRunner {
  constructor() {
    this.results = {
      unit: { passed: false, error: null },
      integration: { passed: false, error: null },
      e2e: { passed: false, error: null },
      accessibility: { passed: false, error: null },
      performance: { passed: false, error: null },
      coverage: { passed: false, error: null }
    }

    this.startTime = Date.now()
  }

  /**
   * Execute all test suites in proper sequence
   */
  async runAllTests() {
    console.log('🚀 Starting comprehensive test execution...')
    console.log('=' .repeat(60))

    try {
      // 1. Unit Tests (fastest, run first)
      await this.runUnitTests()

      // 2. Integration Tests
      await this.runIntegrationTests()

      // 3. Coverage Verification
      await this.verifyCoverage()

      // 4. E2E Tests (slower, run after unit tests pass)
      await this.runE2ETests()

      // 5. Accessibility Tests
      await this.runAccessibilityTests()

      // 6. Performance Tests (slowest, run last)
      await this.runPerformanceTests()

      // Generate final report
      this.generateFinalReport()

    } catch (error) {
      console.error('❌ Test execution failed:', error.message)
      this.generateFailureReport(error)
      process.exit(1)
    }
  }

  /**
   * Run unit tests with coverage
   */
  async runUnitTests() {
    console.log('\n📋 Running Unit Tests...')

    try {
      execSync('npm run test:ci', {
        stdio: 'inherit',
        timeout: 120000 // 2 minutes
      })

      this.results.unit.passed = true
      console.log('✅ Unit tests passed')

    } catch (error) {
      this.results.unit.error = error.message
      throw new Error('Unit tests failed')
    }
  }

  /**
   * Run integration tests
   */
  async runIntegrationTests() {
    console.log('\n🔗 Running Integration Tests...')

    try {
      execSync('npm run test:integration', {
        stdio: 'inherit',
        timeout: 90000 // 1.5 minutes
      })

      this.results.integration.passed = true
      console.log('✅ Integration tests passed')

    } catch (error) {
      this.results.integration.error = error.message
      console.log('⚠️ Integration tests failed, but continuing...')
    }
  }

  /**
   * Verify coverage thresholds
   */
  async verifyCoverage() {
    console.log('\n📊 Verifying Coverage Thresholds...')

    try {
      execSync('node scripts/coverage-report.js', {
        stdio: 'inherit'
      })

      this.results.coverage.passed = true
      console.log('✅ Coverage thresholds met')

    } catch (error) {
      this.results.coverage.error = error.message
      throw new Error('Coverage thresholds not met')
    }
  }

  /**
   * Run E2E tests
   */
  async runE2ETests() {
    console.log('\n🌐 Running E2E Tests...')

    try {
      // Start the application first
      const serverProcess = this.startTestServer()

      // Wait for server to be ready
      await this.waitForServer()

      // Run Playwright tests
      execSync('npx playwright test --project=chrome-desktop', {
        stdio: 'inherit',
        timeout: 300000 // 5 minutes
      })

      // Cleanup
      serverProcess.kill()

      this.results.e2e.passed = true
      console.log('✅ E2E tests passed')

    } catch (error) {
      this.results.e2e.error = error.message
      console.log('⚠️ E2E tests failed, but continuing...')
    }
  }

  /**
   * Run accessibility tests
   */
  async runAccessibilityTests() {
    console.log('\n♿ Running Accessibility Tests...')

    try {
      execSync('npm run test:accessibility', {
        stdio: 'inherit',
        timeout: 180000 // 3 minutes
      })

      this.results.accessibility.passed = true
      console.log('✅ Accessibility tests passed')

    } catch (error) {
      this.results.accessibility.error = error.message
      console.log('⚠️ Accessibility tests failed, but continuing...')
    }
  }

  /**
   * Run performance tests
   */
  async runPerformanceTests() {
    console.log('\n⚡ Running Performance Tests...')

    try {
      execSync('npm run test:performance', {
        stdio: 'inherit',
        timeout: 240000 // 4 minutes
      })

      this.results.performance.passed = true
      console.log('✅ Performance tests passed')

    } catch (error) {
      this.results.performance.error = error.message
      console.log('⚠️ Performance tests failed, but continuing...')
    }
  }

  /**
   * Start test server
   */
  startTestServer() {
    console.log('Starting test server...')

    const serverProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'test' }
    })

    return serverProcess
  }

  /**
   * Wait for server to be ready
   */
  async waitForServer(timeout = 30000) {
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      try {
        execSync('curl -f http://localhost:3000 > /dev/null 2>&1')
        console.log('✅ Test server ready')
        return
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    throw new Error('Test server failed to start within timeout')
  }

  /**
   * Generate final test report
   */
  generateFinalReport() {
    const totalTime = Date.now() - this.startTime
    const passed = Object.values(this.results).filter(r => r.passed).length
    const total = Object.keys(this.results).length

    console.log('\n' + '='.repeat(60))
    console.log('🎬 VIDEO PLAYER DEMO - TEST EXECUTION SUMMARY')
    console.log('='.repeat(60))

    console.log(`\n📊 RESULTS: ${passed}/${total} test suites passed`)
    console.log(`⏱️  DURATION: ${Math.round(totalTime / 1000)}s`)

    Object.entries(this.results).forEach(([suite, result]) => {
      const status = result.passed ? '✅' : '❌'
      console.log(`${status} ${suite.toUpperCase().padEnd(15)} ${result.passed ? 'PASSED' : 'FAILED'}`)
      if (result.error) {
        console.log(`   Error: ${result.error.slice(0, 100)}...`)
      }
    })

    // Quality assessment
    console.log('\n🎯 QUALITY ASSESSMENT:')

    if (this.results.unit.passed && this.results.coverage.passed) {
      console.log('✅ CORE QUALITY: Enterprise-ready')
    } else {
      console.log('❌ CORE QUALITY: Needs attention')
    }

    if (this.results.accessibility.passed) {
      console.log('✅ ACCESSIBILITY: WCAG 2.1 AA compliant')
    } else {
      console.log('⚠️ ACCESSIBILITY: Needs review')
    }

    if (this.results.performance.passed) {
      console.log('✅ PERFORMANCE: Smart TV optimized')
    } else {
      console.log('⚠️ PERFORMANCE: Needs optimization')
    }

    // Generate JSON report for CI/CD
    this.generateJSONReport(totalTime)

    if (passed === total) {
      console.log('\n🎉 ALL TESTS PASSED! Ready for production deployment.')
    } else {
      console.log('\n⚠️ Some tests failed. Review and fix before deployment.')
    }
  }

  /**
   * Generate failure report
   */
  generateFailureReport(error) {
    console.log('\n❌ TEST EXECUTION FAILED')
    console.log('='.repeat(40))
    console.log('Error:', error.message)

    const failedSuites = Object.entries(this.results)
      .filter(([_, result]) => !result.passed)
      .map(([suite]) => suite)

    if (failedSuites.length > 0) {
      console.log('\nFailed test suites:', failedSuites.join(', '))
    }

    console.log('\n🔧 Recommended actions:')
    console.log('1. Fix failing unit tests first')
    console.log('2. Ensure 90% coverage threshold is met')
    console.log('3. Review test output for specific failures')
    console.log('4. Run individual test suites for detailed debugging')
  }

  /**
   * Generate JSON report for CI/CD systems
   */
  generateJSONReport(totalTime) {
    const report = {
      timestamp: new Date().toISOString(),
      duration: totalTime,
      summary: {
        total: Object.keys(this.results).length,
        passed: Object.values(this.results).filter(r => r.passed).length,
        failed: Object.values(this.results).filter(r => !r.passed).length
      },
      results: this.results,
      quality_gates: {
        enterprise_ready: this.results.unit.passed && this.results.coverage.passed,
        accessibility_compliant: this.results.accessibility.passed,
        performance_optimized: this.results.performance.passed,
        deployment_ready: Object.values(this.results).every(r => r.passed)
      }
    }

    const reportPath = path.join(process.cwd(), 'test-results', 'execution-summary.json')

    // Ensure directory exists
    const dir = path.dirname(reportPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n📄 Detailed report saved to: ${reportPath}`)
  }
}

// Execute if run directly
if (require.main === module) {
  const runner = new TestRunner()
  runner.runAllTests().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

module.exports = TestRunner