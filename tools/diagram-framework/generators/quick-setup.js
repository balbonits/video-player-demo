#!/usr/bin/env node

/**
 * Quick Setup Generator - Complete Day 1 environment setup
 * Created by: Alex (Engineer)
 * Purpose: Generate all necessary diagrams and documentation for Day 2 readiness
 */

import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { createWireframe, createArchitecture, createUserFlow } from '../src/core/DiagramBase.js'

console.log('🚀 Quick Setup: Generating complete visual documentation suite...')

/**
 * Generate all wireframes for Riley
 */
async function generateAllWireframes() {
  console.log('🎨 Riley: Generating wireframes...')

  // Desktop Video Player
  const desktopWireframe = createWireframe({
    title: 'Desktop Video Player - FOX Demo',
    subtitle: 'Next.js Implementation with Redux & HLS',
    theme: 'fox'
  })

  const playerId = desktopWireframe.addVideoPlayer({ x: 200, y: 100 })
  desktopWireframe.addAnnotation(
    '🎯 Technical Specs:<br>• React 18 + TypeScript strict<br>• Redux Toolkit Action Creators<br>• HLS.js streaming<br>• 90% test coverage<br>• WCAG 2.1 AA compliance',
    { x: 550, y: 120 }
  )

  await mkdir('docs/wires', { recursive: true })
  await writeFile('docs/wires/desktop-complete.html', desktopWireframe.generateHTML())

  // Mobile Video Player
  const mobileWireframe = createWireframe({
    title: 'Mobile Video Player - Touch Optimized',
    subtitle: 'iOS SwiftUI + Android Compose',
    theme: 'fox'
  })

  mobileWireframe.addMobilePlayer({ x: 150, y: 100 })
  mobileWireframe.addAnnotation(
    '📱 Mobile Features:<br>• Touch gestures<br>• Picture-in-Picture<br>• Background playback<br>• Native performance',
    { x: 380, y: 120 }
  )

  await writeFile('docs/wires/mobile-complete.html', mobileWireframe.generateHTML())

  // Smart TV Player
  const tvWireframe = createWireframe({
    title: 'Smart TV Video Player - D-pad Navigation',
    subtitle: 'Roku (Priority), Samsung Tizen, Vizio',
    theme: 'fox'
  })

  tvWireframe.addSmartTVPlayer({ x: 200, y: 100 })
  tvWireframe.addAnnotation(
    '📺 TV Optimization:<br>• D-pad spatial navigation<br>• 64px button targets<br>• TV-safe margins<br>• <150MB memory usage',
    { x: 650, y: 120 }
  )

  await writeFile('docs/wires/smart-tv-complete.html', tvWireframe.generateHTML())

  console.log('✅ Riley: All wireframes generated')
}

/**
 * Generate architecture diagrams for Alex
 */
async function generateArchitectureDiagrams() {
  console.log('🏗️ Alex: Generating architecture diagrams...')

  // System Architecture
  const systemArch = createArchitecture({
    title: 'Video Player System Architecture',
    subtitle: 'Cross-Platform Implementation Strategy',
    theme: 'fox'
  })

  const web = systemArch.addComponent('Web App\n(Next.js)', 'frontend', { x: 100, y: 150 })
  const ios = systemArch.addComponent('iOS App\n(SwiftUI)', 'frontend', { x: 300, y: 50 })
  const android = systemArch.addComponent('Android\n(Compose)', 'frontend', { x: 300, y: 250 })
  const roku = systemArch.addComponent('Roku\n(BrightScript)', 'frontend', { x: 500, y: 50 })
  const tizen = systemArch.addComponent('Tizen\n(Web API)', 'frontend', { x: 500, y: 150 })
  const vizio = systemArch.addComponent('Vizio\n(SmartCast)', 'frontend', { x: 500, y: 250 })
  const core = systemArch.addComponent('Shared Core\n(TypeScript)', 'backend', { x: 750, y: 150 })
  const streaming = systemArch.addComponent('HLS Streaming\n(Adaptive)', 'streaming', { x: 950, y: 150 })

  // Connect all platforms to shared core
  systemArch.addConnection(web, core, { label: 'Shared Logic' })
  systemArch.addConnection(ios, core, { label: 'Core API' })
  systemArch.addConnection(android, core, { label: 'Core API' })
  systemArch.addConnection(roku, core, { label: 'Core Logic' })
  systemArch.addConnection(tizen, core, { label: 'Core API' })
  systemArch.addConnection(vizio, core, { label: 'Core API' })
  systemArch.addConnection(core, streaming, { label: 'HLS.js' })

  await mkdir('docs/diagrams', { recursive: true })
  await writeFile('docs/diagrams/system-architecture.html', systemArch.generateHTML())

  // Redux Architecture
  const reduxArch = createArchitecture({
    title: 'Redux State Management Architecture',
    subtitle: 'Action Creators Pattern with 90% Test Coverage',
    theme: 'fox'
  })

  const ui = reduxArch.addComponent('UI Components', 'frontend', { x: 100, y: 100 })
  const actions = reduxArch.addComponent('Action Creators', 'api', { x: 350, y: 100 })
  const store = reduxArch.addComponent('Redux Store', 'database', { x: 600, y: 100 })
  const persistence = reduxArch.addComponent('Persistence\n(User Prefs)', 'database', { x: 850, y: 100 })

  reduxArch.addConnection(ui, actions, { label: 'dispatch()' })
  reduxArch.addConnection(actions, store, { label: 'reducers' })
  reduxArch.addConnection(store, persistence, { label: 'persist' })

  await writeFile('docs/diagrams/redux-architecture.html', reduxArch.generateHTML())

  console.log('✅ Alex: Architecture diagrams generated')
}

/**
 * Generate user flow diagrams for Jordan
 */
async function generateUserFlowDiagrams() {
  console.log('👤 Jordan: Generating user flow diagrams...')

  const userFlow = createUserFlow({
    title: 'Complete Video Playback User Journey',
    subtitle: 'Cross-Platform User Experience Flow',
    theme: 'fox'
  })

  const landing = userFlow.addFlowStep('User Arrives', 'Demo page loads with video player', { x: 100, y: 150 }, 1)
  const videoLoad = userFlow.addFlowStep('Video Loads', 'HLS stream initializes with quality', { x: 350, y: 150 }, 2)
  const interaction = userFlow.addFlowStep('User Controls', 'Play, volume, seek, settings', { x: 600, y: 150 }, 3)
  const platform = userFlow.addFlowStep('Cross-Platform', 'Consistent experience everywhere', { x: 850, y: 150 }, 4)

  userFlow.addConnection(landing, videoLoad, { animated: true })
  userFlow.addConnection(videoLoad, interaction, { animated: true })
  userFlow.addConnection(interaction, platform, { animated: true })

  await mkdir('docs/flows', { recursive: true })
  await writeFile('docs/flows/user-journey-complete.html', userFlow.generateHTML())

  console.log('✅ Jordan: User flow diagrams generated')
}

/**
 * Generate CI/CD pipeline diagram for Casey
 */
async function generatePipelineDiagrams() {
  console.log('🚀 Casey: Generating CI/CD pipeline diagrams...')

  const pipeline = createArchitecture({
    title: 'CI/CD Pipeline - Automated Quality & Deployment',
    subtitle: 'GitHub Actions → Vercel → Production Monitoring',
    theme: 'fox'
  })

  const commit = pipeline.addComponent('Git Commit', 'frontend', { x: 100, y: 200 })
  const ci = pipeline.addComponent('GitHub Actions\nCI Pipeline', 'api', { x: 300, y: 200 })
  const tests = pipeline.addComponent('Quality Gates\n90% Coverage', 'backend', { x: 500, y: 100 })
  const build = pipeline.addComponent('Build & Bundle\nOptimization', 'backend', { x: 500, y: 300 })
  const staging = pipeline.addComponent('Staging Deploy\nVercel', 'cdn', { x: 700, y: 150 })
  const prod = pipeline.addComponent('Production\nDemo Site', 'cdn', { x: 900, y: 200 })
  const monitor = pipeline.addComponent('Monitoring\n& Analytics', 'database', { x: 1100, y: 200 })

  pipeline.addConnection(commit, ci, { label: 'Push' })
  pipeline.addConnection(ci, tests, { label: 'Test' })
  pipeline.addConnection(ci, build, { label: 'Build' })
  pipeline.addConnection(tests, staging, { label: 'Pass' })
  pipeline.addConnection(build, staging, { label: 'Assets' })
  pipeline.addConnection(staging, prod, { label: 'Deploy' })
  pipeline.addConnection(prod, monitor, { label: 'Metrics' })

  await mkdir('docs/pipelines', { recursive: true })
  await writeFile('docs/pipelines/ci-cd-complete.html', pipeline.generateHTML())

  console.log('✅ Casey: CI/CD pipeline diagram generated')
}

/**
 * Generate testing dashboard for Sam
 */
async function generateTestingDashboards() {
  console.log('🧪 Sam: Generating testing dashboards...')

  const testingDashboard = createArchitecture({
    title: 'Testing Strategy Dashboard - 90% Coverage',
    subtitle: 'Comprehensive Quality Assurance Framework',
    theme: 'fox'
  })

  const unit = testingDashboard.addComponent('Unit Tests\n90% Coverage', 'backend', { x: 150, y: 100 })
  const integration = testingDashboard.addComponent('Integration\nTests', 'backend', { x: 400, y: 100 })
  const e2e = testingDashboard.addComponent('E2E Tests\nPlaywright', 'backend', { x: 650, y: 100 })
  const a11y = testingDashboard.addComponent('Accessibility\nWCAG 2.1 AA', 'backend', { x: 150, y: 300 })
  const perf = testingDashboard.addComponent('Performance\nLighthouse', 'backend', { x: 400, y: 300 })
  const cross = testingDashboard.addComponent('Cross-Platform\nCompatibility', 'backend', { x: 650, y: 300 })

  await mkdir('docs/testing', { recursive: true })
  await writeFile('docs/testing/strategy-dashboard.html', testingDashboard.generateHTML())

  console.log('✅ Sam: Testing dashboard generated')
}

/**
 * Main setup function - generates everything for Day 2 readiness
 */
async function quickSetup() {
  console.log('🎯 Starting complete diagram generation for Day 2 readiness...\n')

  try {
    await generateAllWireframes()
    await generateArchitectureDiagrams()
    await generateUserFlowDiagrams()
    await generatePipelineDiagrams()
    await generateTestingDashboards()

    console.log('\n🎉 SETUP COMPLETE!')
    console.log('📋 Generated files:')
    console.log('   📁 docs/wires/ - Riley\'s wireframes (3 files)')
    console.log('   📁 docs/diagrams/ - Alex\'s architecture (2 files)')
    console.log('   📁 docs/flows/ - Jordan\'s user flows (1 file)')
    console.log('   📁 docs/pipelines/ - Casey\'s CI/CD (1 file)')
    console.log('   📁 docs/testing/ - Sam\'s dashboards (1 file)')

    console.log('\n✅ Day 2 Implementation Readiness: 100%')
    console.log('🚀 Tomorrow: Video player implementation in 1-2 hours!')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

// Run quick setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  quickSetup()
}

export { quickSetup }