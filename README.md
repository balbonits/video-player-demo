# 🎬 Video Player Demo Project

**A comprehensive cross-platform video streaming player demonstrating Next.js mastery and enterprise development practices for FOX Corporation Senior Web/JavaScript Engineer application.**

## 🎯 Project Overview

This project showcases modern web development expertise through a feature-rich video player that spans multiple platforms, emphasizing Smart TV navigation, accessibility compliance, and performance optimization for streaming media applications.

### **Strategic Context**
- **Purpose:** Demonstrate ongoing FOX streaming technology engagement
- **Timeline:** 5-7 days rapid development
- **Target:** FOX Corporation Senior Web/JavaScript Engineer role
- **Developer:** John Dilig (16+ years experience, former FOX Digital Media contractor)

## 🏗️ Architecture

### **Dual Implementation Strategy**
- **Primary:** Next.js Pages Router (fast development, proven performance)
- **Secondary:** Next.js App Router (cutting-edge patterns, mastery demonstration)

### **Platform Coverage**
- **Web Players** (Pages + App Router versions)
- **iOS Native** (SwiftUI + AVFoundation)
- **Android Native** (Jetpack Compose + ExoPlayer)
- **Smart TV Platforms** (Roku priority, Samsung Tizen, Vizio)

### **Core Technologies**
- **Next.js 14** with TypeScript strict mode
- **Redux Toolkit** with Action Creators pattern
- **HLS.js** for adaptive streaming
- **Tailwind CSS** for responsive design
- **Comprehensive testing** (Jest, Testing Library, Playwright, Axe)

## 🚀 Key Features

### **Streaming & Performance**
- ✅ HLS adaptive streaming with quality selection
- ✅ Smart TV-optimized performance (< 3s load time)
- ✅ Cross-platform state synchronization
- ✅ Analytics integration with performance monitoring

### **Accessibility & Navigation**
- ✅ WCAG 2.1 AA compliance
- ✅ Smart TV remote navigation (D-pad + keyboard)
- ✅ Screen reader compatibility
- ✅ Customizable caption settings

### **Enterprise Development**
- ✅ TypeScript strict mode throughout
- ✅ Test-driven development (TDD)
- ✅ Comprehensive documentation
- ✅ Professional CI/CD pipeline

## 📁 Project Structure

```
video-player-demo/
├── README.md                   # This file
├── PROJECT_QA.md              # Strategic Q&A and decisions
├── CLAUDE.md                  # AI development context
│
├── apps/                      # Application implementations
│   ├── web-player-pages/      # Primary: Next.js Pages Router
│   ├── web-player-app/        # Secondary: Next.js App Router
│   ├── ios-player/            # Native iOS (SwiftUI)
│   ├── android-player/        # Native Android (Compose)
│   ├── roku-player/           # Roku BrightScript
│   ├── tizen-player/          # Samsung Tizen
│   └── vizio-player/          # Vizio SmartCast
│
├── packages/                  # Shared libraries
│   ├── player-core/           # Core video player logic
│   ├── ui-components/         # Reusable UI components
│   ├── shared-utils/          # Common utilities
│   └── mobile-shared/         # Mobile-specific shared code
│
├── docs/                      # Project documentation
│   ├── TECHNICAL.md           # Technical implementation details
│   ├── PRODUCT.md             # Product specifications and requirements
│   ├── DESIGN.md              # UX/UI design documentation
│   └── QA.md                  # Testing strategy and quality assurance
│
├── personas/                  # Team persona documentation
│   ├── alex-engineer/         # Engineering perspective and journal
│   ├── sam-qa/                # QA perspective and process
│   ├── jordan-product/        # Product management documentation
│   ├── casey-release/         # Release and deployment processes
│   ├── riley-ux/              # UX design and accessibility
│   └── morgan-teamlead/       # Project coordination and decisions
│
└── tools/                     # Development tooling
    ├── build-scripts/         # Build automation
    ├── testing/               # Test utilities
    └── deployment/            # Deployment configuration
```

## 🎯 FOX Corporation Alignment

### **Job Requirements Match**
- **JavaScript/React expertise** → Demonstrated across all platforms
- **Smart TV platform experience** → Roku, Tizen, Vizio implementations
- **Performance optimization** → Optimized for low-end devices
- **Media playback (HLS/DASH)** → Advanced streaming implementation
- **Enterprise development** → TDD, TypeScript, comprehensive testing

### **"Nice to Have" Differentiators**
- ✅ Smart TV development experience (explicitly mentioned)
- ✅ Streaming concepts expertise (core competency)
- ✅ Performance optimization for constrained devices
- ✅ Cross-platform development patterns

## 🚀 Quick Start

### **Development Setup**
```bash
# Install dependencies
npm install

# Start development server (Pages Router)
cd apps/web-player-pages
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### **Demo URLs**
- **Pages Router Demo:** [localhost:3000](http://localhost:3000)
- **App Router Demo:** [localhost:3001](http://localhost:3001)
- **Production Deploy:** [video-player-demo.vercel.app](https://video-player-demo.vercel.app)

## 📊 Performance Targets

- **Load Time:** < 3 seconds on Smart TV hardware
- **Video Start:** < 1 second to first frame
- **Accessibility:** WCAG 2.1 AA compliance (100%)
- **Lighthouse Score:** 95+ performance score
- **Cross-browser:** Chrome, Safari, Firefox, Edge support

## 🤝 Learning & Development

This project serves as both a portfolio demonstration and a Next.js mastery learning experience, combining 16+ years of web development experience with cutting-edge React patterns and enterprise development practices.

### **Educational Value**
- **Modern React patterns** (Server Components, hooks, streaming)
- **Enterprise state management** (Redux Toolkit, Action Creators)
- **Cross-platform architecture** (web, mobile, Smart TV)
- **Performance optimization** (streaming, caching, bundle analysis)
- **Professional development** (TDD, TypeScript, documentation)

## 📞 Contact

**John Dilig**
- **Portfolio:** [jdilig.me](https://jdilig.me)
- **GitHub:** [github.com/balbonits](https://github.com/balbonits)
- **Email:** rjdofficemail@gmail.com
- **Project Context:** FOX Corporation Senior Web/JavaScript Engineer application
- **Experience:** 16+ years frontend development, former FOX Digital Media contractor (2012-2019, 2020-2022)

---

**Built with ❤️ for FOX Corporation • Demonstrating modern streaming technology expertise**