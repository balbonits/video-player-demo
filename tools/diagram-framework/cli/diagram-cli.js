#!/usr/bin/env node

/**
 * Diagram CLI - Command line interface for team diagram generation
 * Created by: Alex (Engineer)
 * Usage: node cli/diagram-cli.js [command] [options]
 */

import { Command } from 'commander'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { createWireframe, createArchitecture, createUserFlow } from '../src/core/DiagramBase.js'

const program = new Command()

program
  .name('diagram')
  .description('Professional diagram generation for video player demo team')
  .version('1.0.0')

// Wireframe generation command
program
  .command('wireframe')
  .description('Generate interactive wireframe')
  .option('-t, --type <type>', 'Wireframe type (video-player, mobile, tv)', 'video-player')
  .option('-p, --platform <platform>', 'Target platform (web, ios, android, roku)', 'web')
  .option('-o, --output <path>', 'Output directory', 'docs/wires/')
  .action(async (options) => {
    console.log(chalk.blue('🎨 Generating wireframe...'))

    const wireframe = createWireframe({
      title: `${options.type} Wireframe - ${options.platform}`,
      subtitle: `Interactive wireframe for video player demo`,
      theme: 'fox'
    })

    // Add appropriate components based on type and platform
    if (options.type === 'video-player') {
      if (options.platform === 'web') {
        wireframe.addVideoPlayer({ x: 100, y: 100 })
      } else if (options.platform === 'mobile') {
        wireframe.addMobilePlayer({ x: 100, y: 100 })
      } else if (options.platform === 'roku' || options.platform === 'tv') {
        wireframe.addSmartTVPlayer({ x: 100, y: 100 })
      }
    }

    const html = wireframe.generateHTML()
    const fileName = `${options.type}-${options.platform}-wireframe.html`
    const filePath = path.join(options.output, fileName)

    await mkdir(options.output, { recursive: true })
    await writeFile(filePath, html)

    console.log(chalk.green(`✅ Wireframe created: ${filePath}`))
    console.log(chalk.cyan(`🌐 Open in browser: file://${path.resolve(filePath)}`))
  })

// Architecture diagram command
program
  .command('architecture')
  .description('Generate system architecture diagram')
  .option('-t, --type <type>', 'Architecture type (system, redux, components)', 'system')
  .option('-o, --output <path>', 'Output directory', 'docs/diagrams/')
  .action(async (options) => {
    console.log(chalk.blue('🏗️ Generating architecture diagram...'))

    const arch = createArchitecture({
      title: `${options.type} Architecture`,
      subtitle: 'Video Player Demo System Design',
      theme: 'fox'
    })

    if (options.type === 'system') {
      const frontend = arch.addComponent('Next.js App', 'frontend', { x: 100, y: 100 })
      const api = arch.addComponent('API Routes', 'api', { x: 400, y: 100 })
      const streaming = arch.addComponent('HLS Streaming', 'streaming', { x: 700, y: 100 })
      const cdn = arch.addComponent('Video CDN', 'cdn', { x: 1000, y: 100 })

      arch.addConnection(frontend, api, { label: 'Redux Actions' })
      arch.addConnection(api, streaming, { label: 'Video Data' })
      arch.addConnection(streaming, cdn, { label: 'HLS Stream' })
    }

    const html = arch.generateHTML()
    const fileName = `${options.type}-architecture.html`
    const filePath = path.join(options.output, fileName)

    await mkdir(options.output, { recursive: true })
    await writeFile(filePath, html)

    console.log(chalk.green(`✅ Architecture diagram created: ${filePath}`))
  })

// Interactive mode
program
  .command('interactive')
  .description('Interactive diagram creation wizard')
  .action(async () => {
    console.log(chalk.magenta('🧙‍♂️ Welcome to Interactive Diagram Creator!'))

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'diagramType',
        message: 'What type of diagram do you want to create?',
        choices: [
          { name: '🎨 Wireframe (for Riley - UX designs)', value: 'wireframe' },
          { name: '🏗️ Architecture (for Alex - technical diagrams)', value: 'architecture' },
          { name: '👤 User Flow (for Jordan - user journeys)', value: 'userflow' },
          { name: '🚀 CI/CD Pipeline (for Casey - deployment flows)', value: 'pipeline' },
          { name: '🧪 Test Coverage (for Sam - QA dashboards)', value: 'coverage' }
        ]
      },
      {
        type: 'input',
        name: 'title',
        message: 'Diagram title:',
        default: 'Video Player Demo Diagram'
      },
      {
        type: 'list',
        name: 'theme',
        message: 'Choose theme:',
        choices: ['modern', 'dark', 'fox'],
        default: 'fox'
      },
      {
        type: 'confirm',
        name: 'interactive',
        message: 'Enable interactive features?',
        default: true
      }
    ])

    console.log(chalk.blue(`\n🎨 Creating ${answers.diagramType} diagram...`))

    let diagram
    switch (answers.diagramType) {
      case 'wireframe':
        diagram = createWireframe(answers)
        diagram.addVideoPlayer({ x: 200, y: 150 })
        break
      case 'architecture':
        diagram = createArchitecture(answers)
        break
      case 'userflow':
        diagram = createUserFlow(answers)
        break
      default:
        console.log(chalk.red('❌ Diagram type not implemented yet'))
        return
    }

    const html = diagram.generateHTML()
    const fileName = `${answers.diagramType}-${Date.now()}.html`
    const outputDir = `docs/${answers.diagramType}s/`
    const filePath = path.join(outputDir, fileName)

    await mkdir(outputDir, { recursive: true })
    await writeFile(filePath, html)

    console.log(chalk.green(`\n✅ Diagram created successfully!`))
    console.log(chalk.cyan(`📁 File: ${filePath}`))
    console.log(chalk.cyan(`🌐 Open: file://${path.resolve(filePath)}`))
  })

// Batch generation for team
program
  .command('generate-all')
  .description('Generate all standard diagrams for the project')
  .action(async () => {
    console.log(chalk.magenta('🚀 Generating complete diagram suite...'))

    const diagrams = [
      {
        type: 'wireframe',
        creator: 'riley',
        title: 'Desktop Video Player Wireframe',
        generator: () => {
          const w = createWireframe({ title: 'Desktop Video Player', theme: 'fox' })
          w.addVideoPlayer({ x: 200, y: 100 })
          return w
        }
      },
      {
        type: 'wireframe',
        creator: 'riley',
        title: 'Mobile Video Player Wireframe',
        generator: () => {
          const w = createWireframe({ title: 'Mobile Video Player', theme: 'fox' })
          w.addMobilePlayer({ x: 150, y: 100 })
          return w
        }
      },
      {
        type: 'wireframe',
        creator: 'riley',
        title: 'Smart TV Video Player Wireframe',
        generator: () => {
          const w = createWireframe({ title: 'Smart TV Video Player', theme: 'fox' })
          w.addSmartTVPlayer({ x: 100, y: 100 })
          return w
        }
      },
      {
        type: 'architecture',
        creator: 'alex',
        title: 'System Architecture Overview',
        generator: () => {
          const a = createArchitecture({ title: 'System Architecture', theme: 'fox' })
          const fe = a.addComponent('Next.js', 'frontend', { x: 100, y: 100 })
          const api = a.addComponent('API Routes', 'api', { x: 400, y: 100 })
          const stream = a.addComponent('HLS Stream', 'streaming', { x: 700, y: 100 })
          a.addConnection(fe, api, { label: 'Redux' })
          a.addConnection(api, stream, { label: 'Video' })
          return a
        }
      }
    ]

    for (const diagramConfig of diagrams) {
      const diagram = diagramConfig.generator()
      const html = diagram.generateHTML()
      const fileName = `${diagramConfig.title.toLowerCase().replace(/\s+/g, '-')}.html`
      const outputDir = `docs/${diagramConfig.type}s/`
      const filePath = path.join(outputDir, fileName)

      await mkdir(outputDir, { recursive: true })
      await writeFile(filePath, html)

      console.log(chalk.green(`✅ Created: ${fileName} (for ${diagramConfig.creator})`))
    }

    console.log(chalk.magenta('\n🎉 All diagrams generated successfully!'))
    console.log(chalk.cyan('📁 Check docs/wireframes/ and docs/architectures/'))
  })

program.parse()