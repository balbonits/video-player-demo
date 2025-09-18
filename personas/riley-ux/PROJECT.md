# 🎨 Riley (UX) - Superdesign Wireframing Project Specification

**Role:** UX Designer & Superdesign Specialist
**Responsibility:** All wireframing, design specifications, and AI-assisted design generation
**Tools:** Superdesign MCP Server (primary), accessibility validation tools
**Focus:** Zero manual wireframe drawing - 100% AI-generated professional designs

---

## **Superdesign-Powered UX Strategy**

### **AI-First Design Philosophy**
- **Leverage AI:** Use Superdesign for all wireframe generation and component specifications
- **Human Expertise:** Apply UX knowledge to guide AI prompts and validate outputs
- **Rapid Iteration:** Generate multiple design variations quickly
- **Quality Control:** Ensure all AI-generated designs meet enterprise standards

### **Superdesign Mastery Roadmap**

#### **Core Competencies to Develop:**
1. **Prompt Engineering:** Craft precise prompts for optimal Superdesign output
2. **Design Iteration:** Use Superdesign's feedback system for refinement
3. **System Extraction:** Extract design systems from generated components
4. **Cross-Platform Generation:** Create platform-specific design variations

---

## **Video Player Wireframing Strategy**

### **Primary Design Deliverables Using Superdesign**

#### **1. Desktop Video Player Interface**
**Superdesign Prompt Strategy:**
```
"Generate desktop video player wireframe with:
- 16:9 aspect ratio video container (1280x720 recommended)
- Centered play button overlay (80px) with accessibility focus ring
- Bottom control bar (60px height) with gradient background
- Controls: play/pause, volume slider, progress bar, quality selector, settings, fullscreen
- WCAG 2.1 AA compliance: 4.5:1 contrast, keyboard navigation, ARIA labels
- Smart TV optimization: 64px buttons, clear focus indicators, D-pad navigation
- Redux integration points for state management
- TypeScript interface specifications"
```

**Expected Superdesign Output:**
- Complete wireframe with measurements
- Component specifications with TypeScript interfaces
- Accessibility implementation details
- CSS/Tailwind styling specifications
- Testing requirements for 90% coverage

#### **2. Mobile Video Player Interface**
**Superdesign Prompt Strategy:**
```
"Create mobile video player wireframe for 375x812 viewport:
- Portrait-optimized video container with letterboxing
- Large touch targets (56px minimum) for mobile accessibility
- Touch gesture support: tap play/pause, swipe seek, pinch zoom
- Bottom control overlay with essential controls only
- Settings as bottom sheet modal
- iOS and Android platform considerations
- Touch-friendly progress bar (12px height)
- Picture-in-Picture button positioning"
```

#### **3. Smart TV Interface**
**Superdesign Prompt Strategy:**
```
"Design Smart TV video player for 1920x1080 with TV-safe margins:
- 48px horizontal margins, 27px vertical margins for TV safe area
- Large buttons (80px) optimized for D-pad navigation
- Spatial navigation logic: left/right between controls, up/down for video/settings
- Enhanced focus indicators: 4px outline + scale transform
- TV viewing distance typography (24px minimum)
- Remote control button mapping visualization
- Performance optimized for TV hardware constraints"
```

#### **4. Settings Panel Comprehensive Design**
**Superdesign Prompt Strategy:**
```
"Generate video player settings panel with:
- Caption customization: font size, color, background, position
- Quality selection: auto, 1080p, 720p, 480p with bandwidth indicators
- Accessibility options: high contrast, reduced motion, screen reader mode
- Audio settings: track selection, volume boost
- Performance settings: power save mode, quality priority
- Platform-specific adaptations for desktop/mobile/TV
- Modal overlay with backdrop blur and focus trap"
```

---

## **Cross-Platform Design Variations**

### **Platform-Specific Superdesign Strategies**

#### **Web Platform Variations**
```typescript
interface WebPlatformDesigns {
  desktop: {
    superdesignPrompt: 'Desktop video player with mouse + keyboard optimization',
    focus: 'Hover states, precise controls, multi-monitor support',
    viewport: '1440x900 typical, scalable to 4K',
    controls: 'Full control set with tooltips and shortcuts'
  },

  tablet: {
    superdesignPrompt: 'Tablet video player with touch + landscape optimization',
    focus: 'Touch targets, orientation handling, hybrid input',
    viewport: '1024x768 landscape, 768x1024 portrait',
    controls: 'Touch-optimized with keyboard fallback'
  },

  mobile: {
    superdesignPrompt: 'Mobile video player with thumb-zone optimization',
    focus: 'One-handed use, swipe gestures, battery efficiency',
    viewport: '375x812 (iPhone), 393x851 (Android)',
    controls: 'Minimal essential controls with gesture support'
  }
}
```

#### **Native Platform Specifications**
```typescript
interface NativePlatformDesigns {
  iOS: {
    superdesignPrompt: 'iOS native video player following Human Interface Guidelines',
    designLanguage: 'iOS design patterns, SF Symbols, native animations',
    accessibility: 'VoiceOver optimization, Dynamic Type support',
    integration: 'AVPlayerViewController, SwiftUI patterns'
  },

  android: {
    superdesignPrompt: 'Android video player following Material Design 3',
    designLanguage: 'Material You, dynamic color, responsive layouts',
    accessibility: 'TalkBack optimization, accessibility services',
    integration: 'ExoPlayer, Jetpack Compose patterns'
  }
}
```

#### **Smart TV Platform Designs**
```typescript
interface SmartTVPlatformDesigns {
  roku: {
    superdesignPrompt: 'Roku video player following Roku Design Guidelines',
    constraints: 'BrightScript limitations, SceneGraph XML',
    navigation: 'Remote control D-pad, voice search integration',
    performance: 'Memory < 100MB, 30fps UI maximum'
  },

  tizen: {
    superdesignPrompt: 'Samsung Tizen video player with Smart Hub integration',
    constraints: 'Tizen Web API, TV browser limitations',
    navigation: 'Samsung remote, voice control, gesture support',
    performance: 'TV hardware optimization, network adaptation'
  },

  vizio: {
    superdesignPrompt: 'Vizio SmartCast video player with casting integration',
    constraints: 'SmartCast SDK, Chromecast built-in',
    navigation: 'Vizio remote, mobile app integration',
    performance: 'SmartCast platform optimization'
  }
}
```

---

## **Superdesign Workflow Implementation**

### **Daily Superdesign Tasks**

#### **Morning Routine: Design Generation**
1. **Review Requirements:** Collaborate with Jordan on user stories
2. **Craft Prompts:** Create precise Superdesign prompts for needed designs
3. **Generate Designs:** Use Superdesign to create wireframes and specifications
4. **Quality Review:** Validate AI output against UX principles

#### **Afternoon Routine: Iteration & Refinement**
1. **Team Feedback:** Collect input from Alex (technical), Sam (testing), Jordan (product)
2. **Iterate Designs:** Use Superdesign iteration tools for improvements
3. **Accessibility Validation:** Ensure WCAG compliance in all designs
4. **Documentation:** Update wireframe documentation and specifications

#### **Evening Routine: Implementation Support**
1. **Developer Handoff:** Provide Alex with implementation-ready specifications
2. **Design Gallery:** Maintain visual overview of all created designs
3. **Progress Tracking:** Document completed designs and next day priorities
4. **Learning Notes:** Record Superdesign insights and improved techniques

### **Superdesign Prompt Engineering Mastery**

#### **Effective Prompt Structure:**
```typescript
interface SuperdesignPromptTemplate {
  context: 'Video player for FOX Corporation demo application'
  platform: 'Desktop/Mobile/Smart TV specific requirements'
  functionality: 'Specific features and interactions needed'
  accessibility: 'WCAG 2.1 AA requirements and assistive technology support'
  technical: 'React TypeScript, Redux integration, testing requirements'
  styling: 'Tailwind CSS, responsive design, animation specifications'
  performance: 'Platform-specific performance constraints'
}

// Example optimized prompt:
const examplePrompt = `
Context: Professional video player for streaming media demonstration
Platform: Smart TV interface for 1920x1080 with remote control
Functionality: HLS streaming, quality selection, caption customization
Accessibility: WCAG 2.1 AA, D-pad navigation, screen reader support
Technical: React TypeScript, Redux actions, 90% test coverage
Styling: Tailwind CSS, dark theme, 4px focus rings, scale animations
Performance: <150MB memory, <200ms input response, 30fps UI
`
```

#### **Prompt Optimization Techniques:**
- **Be Specific:** Include exact measurements, color codes, interaction patterns
- **Include Context:** Always mention FOX Corporation and enterprise quality
- **Accessibility First:** Lead with WCAG requirements in every prompt
- **Technical Integration:** Specify React, TypeScript, Redux requirements
- **Cross-Platform:** Mention platform-specific constraints and optimizations

---

## **Design System Strategy with Superdesign**

### **AI-Generated Design System Components**

#### **Design Token Generation:**
```typescript
// Superdesign will generate comprehensive design tokens
interface DesignTokens {
  colors: {
    primary: 'FOX-inspired color palette',
    semantic: 'Success, warning, error, info colors',
    accessibility: 'High contrast mode colors',
    platform: 'Platform-specific color adaptations'
  },

  typography: {
    scale: 'Responsive type scale for all platforms',
    families: 'Web fonts with platform fallbacks',
    weights: 'Optimized font weights for readability',
    lineHeights: 'Platform-specific line height optimization'
  },

  spacing: {
    scale: 'Consistent spacing system',
    touchTargets: 'Platform-specific minimum sizes',
    safeAreas: 'TV and mobile safe area specifications',
    grid: 'Layout grid system for consistency'
  },

  animations: {
    durations: 'Performance-optimized animation timing',
    easings: 'Smooth, accessible animation curves',
    reducedMotion: 'Respectful motion reduction alternatives'
  }
}
```

---

## **Quality Assurance for AI-Generated Designs**

### **Design Validation Checklist**
```typescript
interface DesignQualityChecklist {
  userExperience: [
    'Design supports all user stories and acceptance criteria',
    'User flows are logical and intuitive',
    'Error states and edge cases are designed',
    'Loading states provide clear feedback'
  ],

  accessibility: [
    'WCAG 2.1 AA compliance verified',
    'Color contrast ratios meet 4.5:1 minimum',
    'Touch targets meet 44px minimum (56px mobile, 64px TV)',
    'Focus indicators are clearly visible (3px minimum)',
    'Screen reader compatibility built-in'
  ],

  technical: [
    'Designs are technically feasible with chosen stack',
    'Performance implications considered',
    'Responsive behavior clearly specified',
    'Component interfaces match React patterns'
  ],

  platform: [
    'Consistent experience across all platforms',
    'Platform-specific optimizations included',
    'Input method differences addressed',
    'Hardware constraints respected'
  ]
}
```

### **Superdesign Output Validation Process**
1. **AI Generation:** Use Superdesign to create initial design specifications
2. **UX Review:** Apply UX expertise to validate user experience quality
3. **Accessibility Check:** Ensure WCAG compliance and inclusive design
4. **Technical Review:** Collaborate with Alex on implementation feasibility
5. **Iteration:** Use Superdesign to refine based on feedback
6. **Final Approval:** Team sign-off before implementation begins

---

**Riley's Superdesign Mission:** Master AI-assisted design generation to create professional, accessible, implementation-ready wireframes and specifications that enable rapid development while maintaining enterprise UX standards. Every design should demonstrate both cutting-edge AI workflow capabilities and deep UX expertise.

This AI-powered approach allows me to focus on UX strategy, accessibility excellence, and cross-platform consistency while Superdesign handles the detailed wireframe generation and component specification creation.