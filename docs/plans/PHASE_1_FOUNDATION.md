# 📋 Phase 1: Foundation & Setup Plan

**Phase Lead:** Morgan (Team Lead)
**Duration:** Day 1-2 (16 hours)
**Status:** Planning Complete, Ready for Implementation
**Contributors:** All personas

---

## **Phase Overview & Objectives**

### **Primary Goals**
1. **Project Setup:** Initialize dual Next.js implementations (Pages + App Router)
2. **Development Environment:** Configure TypeScript strict mode, testing frameworks
3. **Architecture Foundation:** Establish Redux store, component structure, monorepo
4. **Quality Infrastructure:** Set up testing, linting, CI/CD pipeline
5. **Learning Framework:** Ensure each step teaches Next.js patterns to John

### **Success Criteria**
- [x] Documentation structure complete and comprehensive
- [ ] Both Next.js projects initialized with proper configuration
- [ ] TypeScript strict mode configured and working
- [ ] Redux Toolkit store configured with Action Creators pattern
- [ ] Basic testing framework operational (Jest + Testing Library)
- [ ] Development environment fully functional
- [ ] All team personas aligned and ready for implementation

---

## **Detailed Implementation Steps**

### **Step 1: Monorepo Architecture Setup**
**Owner:** Alex (Engineer) + Casey (Release)
**Duration:** 2 hours
**Learning Focus:** Modern monorepo patterns with Turborepo

#### **Technical Implementation Plan:**
```bash
# Initialize Turborepo structure
npx create-turbo@latest video-player-demo --example with-tailwind

# Configure workspace structure
mkdir -p apps/{web-player-pages,web-player-app,ios-player,android-player,roku-player,tizen-player,vizio-player}
mkdir -p packages/{player-core,ui-components,shared-utils,mobile-shared}
mkdir -p tools/{build-scripts,testing,deployment}
```

#### **Key Configuration Files:**
```json
// turbo.json - Turborepo configuration
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts"]
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

#### **Learning Objectives for John:**
- **Why monorepo?** Code sharing across platforms, consistent tooling, atomic commits
- **Turborepo benefits:** Intelligent caching, parallel execution, dependency management
- **Workspace organization:** Logical separation of apps vs packages vs tools

### **Step 2: Next.js Pages Router Setup (Primary)**
**Owner:** Alex (Engineer)
**Duration:** 3 hours
**Learning Focus:** Next.js fundamentals, TypeScript integration, project structure

#### **Technical Implementation Plan:**
```bash
# Initialize Next.js with TypeScript
cd apps/web-player-pages
npx create-next-app@latest . --typescript --tailwind --eslint --app false

# Configure TypeScript strict mode
# Update tsconfig.json with strict configuration
# Set up ESLint with strict TypeScript rules
# Configure Prettier for consistent formatting
```

#### **TypeScript Strict Configuration:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

#### **Learning Discussion Points:**
- **Pages Router fundamentals:** File-based routing, API routes, built-in optimizations
- **TypeScript strict benefits:** Early error detection, better IntelliSense, enterprise quality
- **Next.js conventions:** Page components, API structure, public assets

### **Step 3: Redux Toolkit Configuration**
**Owner:** Alex (Engineer)
**Duration:** 3 hours
**Learning Focus:** Modern Redux patterns, Action Creators, TypeScript integration

#### **Store Architecture Implementation:**
```typescript
// lib/store/index.ts - Main store configuration
import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import playerSlice from './slices/playerSlice'
import videoSlice from './slices/videoSlice'
import uiSlice from './slices/uiSlice'
import accessibilitySlice from './slices/accessibilitySlice'
import analyticsSlice from './slices/analyticsSlice'

const persistConfig = {
  key: 'video-player-demo',
  storage,
  whitelist: ['accessibility', 'ui'] // Only persist user preferences
}

const rootReducer = combineReducers({
  player: playerSlice,
  video: videoSlice,
  ui: uiSlice,
  accessibility: accessibilitySlice,
  analytics: analyticsSlice
})

export const makeStore = () => {
  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
    devTools: process.env.NODE_ENV !== 'production',
  })
}
```

#### **Learning Discussion Points:**
- **Why Redux Toolkit?** Reduces boilerplate, built-in best practices, excellent TypeScript support
- **Action Creators pattern:** Predictable state updates, easier testing, clear API
- **Persistence strategy:** What to persist vs. what to keep ephemeral
- **DevTools integration:** Time-travel debugging, action replay, state inspection

### **Step 4: Testing Framework Setup**
**Owner:** Sam (QA)
**Duration:** 4 hours
**Learning Focus:** TDD methodology, enterprise testing practices

#### **Jest + Testing Library Configuration:**
```typescript
// jest.config.js
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],

  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // 90% coverage requirement
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/components/VideoPlayer/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
}
```

#### **Test Utilities Setup:**
```typescript
// src/test/utils.tsx
import { render, RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { makeStore } from '@/lib/store'

// Custom render function with Redux Provider
export const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = makeStore(),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) => {
  function Wrapper({ children }: PropsWithChildren<{}>) {
    return <Provider store={store}>{children}</Provider>
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}
```

#### **Learning Discussion Points:**
- **TDD Benefits:** Design through testing, better architecture, fewer bugs
- **Testing Library philosophy:** Test behavior, not implementation details
- **Coverage goals:** Why 90% vs 100%, what shouldn't be tested
- **Mock strategies:** When to mock, when to use real implementations

### **Step 5: Basic Component Architecture**
**Owner:** Alex (Engineer) + Riley (UX)
**Duration:** 3 hours
**Learning Focus:** Component composition, accessibility integration, design system

#### **Component Structure Planning:**
```typescript
// Component hierarchy design
interface ComponentArchitecture {
  VideoPlayer: {
    responsibility: 'Main container, coordinate all sub-components',
    children: ['VideoContainer', 'PlayerControls', 'SettingsPanel'],
    state: 'Connected to Redux store',
    accessibility: 'Root ARIA application role'
  }

  VideoContainer: {
    responsibility: 'Video element wrapper, overlays, loading states',
    children: ['VideoElement', 'LoadingOverlay', 'ErrorOverlay', 'CaptionDisplay'],
    state: 'Video playback state from Redux',
    accessibility: 'Video region labeling'
  }

  PlayerControls: {
    responsibility: 'Control bar with playback controls',
    children: ['PlayButton', 'ProgressBar', 'VolumeControl', 'SettingsButton'],
    state: 'Player controls state',
    accessibility: 'Control group labeling, keyboard navigation'
  }
}
```

#### **Learning Discussion Points:**
- **Component composition:** How to break down complex UI into manageable pieces
- **Props vs state:** What belongs in component state vs Redux
- **Accessibility integration:** Building accessibility in from the start
- **Performance considerations:** Re-render optimization, memo usage

### **Step 6: Development Workflow Setup**
**Owner:** Casey (Release)
**Duration:** 1 hour
**Learning Focus:** Professional development tooling, CI/CD basics

#### **Git Workflow Configuration:**
```bash
# Branch strategy setup
git config --global init.defaultBranch main

# Conventional commits setup
npm install --save-dev @commitlint/config-conventional @commitlint/cli
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js

# Husky setup for git hooks
npx husky-init
echo "npx --no-install commitlint --edit \$1" > .husky/commit-msg
echo "npm run lint && npm run typecheck" > .husky/pre-commit
echo "npm run test:unit" > .husky/pre-push
```

#### **Learning Discussion Points:**
- **Git workflow strategy:** Feature branches, conventional commits, automated validation
- **Code quality gates:** Pre-commit hooks, automated testing, continuous integration
- **Professional practices:** Why these standards matter for enterprise development

---

## **Phase 1 Success Validation**

### **Technical Validation Checklist**
- [ ] **Project Structure:** Monorepo properly configured with Turborepo
- [ ] **Next.js Setup:** Pages Router project initialized with TypeScript
- [ ] **Build System:** Successfully builds with zero TypeScript errors
- [ ] **Testing Framework:** Jest runs with 90% coverage target configured
- [ ] **Code Quality:** ESLint + Prettier configured and passing
- [ ] **Redux Store:** Basic store configuration with persistence
- [ ] **Development Server:** Runs successfully on localhost:3000

### **Learning Validation Checklist**
- [ ] **John understands** monorepo benefits and structure
- [ ] **John understands** Next.js Pages Router fundamentals
- [ ] **John understands** TypeScript strict mode implications
- [ ] **John understands** Redux Toolkit patterns and benefits
- [ ] **John understands** testing strategy and TDD approach
- [ ] **John understands** development workflow and quality gates

### **Documentation Validation**
- [ ] **All decisions documented** with rationale in plans/
- [ ] **Learning insights captured** in persona journals
- [ ] **Next phase preparation** documented and ready
- [ ] **Quality standards established** and agreed upon

---

## **Risks & Mitigation for Phase 1**

### **Technical Risks**
- **Risk:** TypeScript strict mode configuration complexity
- **Mitigation:** Start with basic strict config, incrementally add rules
- **Owner:** Alex, escalation to Morgan

- **Risk:** Redux setup complexity affecting timeline
- **Mitigation:** Use Redux Toolkit templates, focus on essential slices first
- **Owner:** Alex, validation by Sam

### **Learning Risks**
- **Risk:** Too much new information affecting implementation speed
- **Mitigation:** Focus on core concepts first, detailed patterns during implementation
- **Owner:** Morgan, coordination with all personas

### **Timeline Risks**
- **Risk:** Phase 1 taking longer than planned due to setup complexity
- **Mitigation:** Prioritize working setup over perfect configuration
- **Owner:** Morgan, with team input

---

## **Next Phase Preparation**

### **Phase 2 Readiness Requirements**
- ✅ **Development environment functional** and tested
- ✅ **Team understanding** of architecture and patterns
- ✅ **Quality gates operational** (linting, testing, TypeScript)
- ✅ **Documentation current** and accessible
- ✅ **John's approval** of foundation approach and setup

### **Handoff to Phase 2**
**Morgan:** *"Once Phase 1 is complete and validated, we'll hand off to Phase 2 with a solid foundation for rapid feature development. All subsequent implementation will build on these carefully established patterns and quality standards."*

**No implementation begins until these plans are approved and documented!**