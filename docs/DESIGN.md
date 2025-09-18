# 🎨 Design Documentation

## Design Philosophy & Principles

### **Core Design Values**
1. **Accessibility First:** Every design decision prioritizes inclusive user experience
2. **Performance Conscious:** Visual design optimized for Smart TV and mobile constraints
3. **Platform Native:** Respectful adaptation to each platform's design language
4. **Professional Polish:** Enterprise-quality visual presentation for portfolio demonstration

### **Design System Foundation**

#### **Brand Identity**
- **Project Name:** Video Player Demo
- **Visual Theme:** Modern, professional, technology-focused
- **Color Inspiration:** FOX-adjacent without infringement (charcoal, electric blue, white)
- **Typography:** Clean, readable, accessible fonts

#### **Accessibility-First Approach**
```css
/* WCAG 2.1 AA Compliance Standards */
:root {
  --contrast-ratio-normal: 4.5;      /* AA standard */
  --contrast-ratio-large: 3.0;       /* AA large text */
  --focus-outline-width: 3px;        /* Visible focus */
  --touch-target-size: 44px;         /* Mobile accessibility */
  --tv-focus-size: 48px;            /* Smart TV targets */
}
```

## **Color System**

### **Primary Color Palette**
```css
:root {
  /* Primary Colors - FOX-inspired without trademark issues */
  --primary-900: #1a1a1a;           /* Deep charcoal */
  --primary-800: #2d2d2d;           /* Charcoal */
  --primary-700: #404040;           /* Medium gray */
  --primary-600: #666666;           /* Text gray */
  --primary-500: #808080;           /* Border gray */
  --primary-400: #a0a0a0;           /* Light gray */
  --primary-300: #c0c0c0;           /* Very light gray */
  --primary-200: #e0e0e0;           /* Near white */
  --primary-100: #f5f5f5;           /* Off white */
  --primary-50: #ffffff;            /* Pure white */

  /* Accent Colors */
  --accent-600: #0066cc;            /* Electric blue */
  --accent-500: #0080ff;            /* Bright blue */
  --accent-400: #3399ff;            /* Medium blue */
  --accent-300: #66b3ff;            /* Light blue */
  --accent-200: #99ccff;            /* Very light blue */

  /* Semantic Colors */
  --success: #22c55e;               /* Green for success states */
  --warning: #f59e0b;               /* Orange for warnings */
  --error: #ef4444;                 /* Red for errors */
  --info: var(--accent-500);        /* Blue for information */
}
```

### **Dark Theme (Default)**
```css
.theme-dark {
  --bg-primary: var(--primary-900);
  --bg-secondary: var(--primary-800);
  --bg-tertiary: var(--primary-700);

  --text-primary: var(--primary-50);
  --text-secondary: var(--primary-300);
  --text-tertiary: var(--primary-400);

  --border-primary: var(--primary-600);
  --border-secondary: var(--primary-700);

  --accent-primary: var(--accent-500);
  --accent-hover: var(--accent-400);
}
```

### **Light Theme (Alternative)**
```css
.theme-light {
  --bg-primary: var(--primary-50);
  --bg-secondary: var(--primary-100);
  --bg-tertiary: var(--primary-200);

  --text-primary: var(--primary-900);
  --text-secondary: var(--primary-700);
  --text-tertiary: var(--primary-600);

  --border-primary: var(--primary-400);
  --border-secondary: var(--primary-300);

  --accent-primary: var(--accent-600);
  --accent-hover: var(--accent-500);
}
```

### **High Contrast Theme (Accessibility)**
```css
.theme-high-contrast {
  --bg-primary: #000000;
  --bg-secondary: #1a1a1a;
  --text-primary: #ffffff;
  --text-secondary: #ffff00;
  --accent-primary: #00ff00;
  --border-primary: #ffffff;
  --focus-color: #ffff00;
}
```

## **Typography System**

### **Font Family Hierarchy**
```css
:root {
  /* Primary: Modern, clean, highly legible */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont,
                  'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
                  'Open Sans', 'Helvetica Neue', sans-serif;

  /* Monospace: Code and data display */
  --font-mono: 'JetBrains Mono', 'Fira Code', Consolas,
               'Liberation Mono', Menlo, Courier, monospace;

  /* Captions: Optimized for video subtitle display */
  --font-captions: 'Roboto', Arial, sans-serif;
}
```

### **Typography Scale**
```css
:root {
  /* Font Sizes - Accessible and responsive */
  --text-xs: 0.75rem;     /* 12px - Captions, fine print */
  --text-sm: 0.875rem;    /* 14px - Secondary text */
  --text-base: 1rem;      /* 16px - Body text */
  --text-lg: 1.125rem;    /* 18px - Emphasized text */
  --text-xl: 1.25rem;     /* 20px - Small headings */
  --text-2xl: 1.5rem;     /* 24px - Medium headings */
  --text-3xl: 1.875rem;   /* 30px - Large headings */
  --text-4xl: 2.25rem;    /* 36px - Hero text */

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### **Smart TV Typography Adjustments**
```css
@media (min-width: 1920px) and (min-height: 1080px) {
  :root {
    /* Larger text for TV viewing distance */
    --text-base: 1.125rem;    /* 18px instead of 16px */
    --text-lg: 1.375rem;      /* 22px instead of 18px */
    --text-xl: 1.625rem;      /* 26px instead of 20px */

    /* Increased line height for readability */
    --leading-normal: 1.6;
    --leading-relaxed: 1.8;
  }
}
```

## **Component Design System**

### **Video Player Interface**

#### **Player Container**
```css
.video-player {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--primary-900);
  border-radius: 8px;
  overflow: hidden;

  /* Focus management for accessibility */
  &:focus-within {
    outline: 3px solid var(--accent-primary);
    outline-offset: 2px;
  }
}
```

#### **Control Bar Design**
```css
.player-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    transparent 0%,
    rgba(0, 0, 0, 0.3) 30%,
    rgba(0, 0, 0, 0.8) 100%
  );
  padding: 16px;

  /* Smart TV optimization */
  @media (tv) {
    padding: 24px;
    background: rgba(0, 0, 0, 0.9);
  }
}
```

#### **Progress Bar Design**
```css
.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  position: relative;
  margin-bottom: 12px;

  /* Progress indicator */
  &__fill {
    height: 100%;
    background: var(--accent-primary);
    border-radius: inherit;
    transition: width 0.1s ease;
  }

  /* Buffer indicator */
  &__buffer {
    position: absolute;
    height: 100%;
    background: rgba(255, 255, 255, 0.5);
    border-radius: inherit;
  }

  /* Scrub handle */
  &__handle {
    position: absolute;
    width: 16px;
    height: 16px;
    background: var(--accent-primary);
    border: 2px solid white;
    border-radius: 50%;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0;
    transition: opacity 0.2s ease;

    /* Show on hover/focus */
    .progress-bar:hover &,
    .progress-bar:focus-within & {
      opacity: 1;
    }
  }

  /* Smart TV larger targets */
  @media (tv) {
    height: 8px;

    &__handle {
      width: 20px;
      height: 20px;
    }
  }
}
```

### **Button System**

#### **Primary Buttons**
```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all 0.2s ease;

  /* Accessibility */
  min-height: 44px;
  min-width: 44px;

  &:hover {
    background: var(--accent-hover);
    transform: translateY(-1px);
  }

  &:focus {
    outline: 3px solid var(--accent-300);
    outline-offset: 2px;
  }

  &:active {
    transform: translateY(0);
  }

  /* Smart TV adjustments */
  @media (tv) {
    min-height: 48px;
    min-width: 48px;
    padding: 16px 32px;
    font-size: var(--text-lg);
  }
}
```

#### **Icon Buttons**
```css
.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.1);
  }

  &:focus {
    outline: 3px solid var(--accent-primary);
    outline-offset: 2px;
    background: rgba(255, 255, 255, 0.1);
  }

  /* Smart TV larger targets */
  @media (tv) {
    width: 56px;
    height: 56px;
  }
}
```

### **Navigation & Focus Management**

#### **Focus Ring System**
```css
/* Global focus management */
*:focus {
  outline: none;
}

.focusable {
  position: relative;

  &:focus::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    border: 3px solid var(--accent-primary);
    border-radius: inherit;
    pointer-events: none;
    z-index: 1000;
  }

  /* High contrast mode enhancement */
  @media (prefers-contrast: high) {
    &:focus::before {
      border-color: var(--focus-color);
      border-width: 4px;
    }
  }
}
```

#### **Smart TV Navigation States**
```css
.tv-navigation {
  /* Focused element styling */
  &__focused {
    background: var(--accent-primary);
    color: white;
    transform: scale(1.1);
    box-shadow: 0 8px 24px rgba(0, 102, 204, 0.4);
    z-index: 10;
  }

  /* Navigation hints */
  &__hint {
    position: absolute;
    bottom: -30px;
    left: 50%;
    transform: translateX(-50%);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    white-space: nowrap;
  }
}
```

## **Responsive Design System**

### **Breakpoint Strategy**
```css
:root {
  /* Mobile-first breakpoints */
  --breakpoint-sm: 640px;    /* Large phones */
  --breakpoint-md: 768px;    /* Tablets */
  --breakpoint-lg: 1024px;   /* Small laptops */
  --breakpoint-xl: 1280px;   /* Desktop */
  --breakpoint-2xl: 1536px;  /* Large desktop */
  --breakpoint-tv: 1920px;   /* Smart TV */
}
```

### **Component Responsive Behavior**

#### **Video Player Responsive Design**
```css
.video-player {
  /* Mobile (default) */
  width: 100%;
  max-width: 100vw;
  aspect-ratio: 16 / 9;

  /* Tablet */
  @media (min-width: 768px) {
    max-width: 90vw;
    margin: 0 auto;
  }

  /* Desktop */
  @media (min-width: 1024px) {
    max-width: 1024px;
  }

  /* Large desktop */
  @media (min-width: 1280px) {
    max-width: 1200px;
  }

  /* Smart TV */
  @media (min-width: 1920px) {
    max-width: 1600px;
    border-radius: 12px;
  }
}
```

#### **Control Layout Responsive**
```css
.player-controls {
  /* Mobile: Simplified controls */
  display: grid;
  grid-template-areas:
    "progress progress progress"
    "play time settings";
  grid-template-columns: auto 1fr auto;
  gap: 12px;

  /* Tablet: More controls visible */
  @media (min-width: 768px) {
    grid-template-areas:
      "progress progress progress progress"
      "play volume time settings";
    grid-template-columns: auto auto 1fr auto;
  }

  /* Desktop: Full control bar */
  @media (min-width: 1024px) {
    grid-template-areas:
      "progress progress progress progress progress"
      "play volume time quality fullscreen";
    grid-template-columns: auto auto 1fr auto auto;
  }

  /* Smart TV: Larger spacing */
  @media (tv) {
    gap: 20px;
    padding: 24px;
  }
}
```

## **Animation & Motion Design**

### **Motion Principles**
1. **Purposeful:** Every animation serves a functional purpose
2. **Respectful:** Honors user preferences (prefers-reduced-motion)
3. **Performant:** Uses CSS transforms and opacity for 60fps animations
4. **Accessible:** Provides alternatives for motion-sensitive users

### **Animation Library**
```css
/* Reduced motion respect */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Standard animations */
.fade-in {
  animation: fadeIn 0.3s ease-out;
}

.slide-up {
  animation: slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.scale-in {
  animation: scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

## **Platform-Specific Design Adaptations**

### **iOS Design Language**
```css
.platform-ios {
  /* iOS-specific styling */
  --border-radius: 12px;
  --button-height: 50px;
  --backdrop-blur: blur(20px);

  .video-player {
    border-radius: var(--border-radius);
    backdrop-filter: var(--backdrop-blur);
  }

  .btn-primary {
    height: var(--button-height);
    border-radius: 25px;
    font-weight: 600;
  }
}
```

### **Android Material Design**
```css
.platform-android {
  /* Material Design 3 principles */
  --elevation-1: 0 1px 3px rgba(0,0,0,0.12);
  --elevation-2: 0 4px 8px rgba(0,0,0,0.12);
  --ripple-color: rgba(0, 102, 204, 0.2);

  .btn-primary {
    position: relative;
    overflow: hidden;
    box-shadow: var(--elevation-1);

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: var(--ripple-color);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: width 0.3s, height 0.3s;
    }

    &:active::before {
      width: 300px;
      height: 300px;
    }
  }
}
```

### **Smart TV Design Optimizations**
```css
.platform-tv {
  /* TV-specific design adjustments */
  --safe-area-horizontal: 48px;
  --safe-area-vertical: 27px;
  --focus-scale: 1.1;

  .video-player {
    margin: var(--safe-area-vertical) var(--safe-area-horizontal);
  }

  .focusable:focus {
    transform: scale(var(--focus-scale));
    transition: transform 0.2s ease;
  }

  /* Larger touch targets for remote control */
  .btn-icon {
    min-width: 64px;
    min-height: 64px;
  }
}
```

## **Caption & Subtitle Design**

### **Caption Styling System**
```css
.video-captions {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 90%;
  text-align: center;
  z-index: 100;

  /* Default styling */
  font-family: var(--font-captions);
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);

  /* Customizable properties */
  &[data-size="small"] { font-size: var(--text-base); }
  &[data-size="medium"] { font-size: var(--text-lg); }
  &[data-size="large"] { font-size: var(--text-xl); }
  &[data-size="extra-large"] { font-size: var(--text-2xl); }

  &[data-position="top"] {
    top: 40px;
    bottom: auto;
  }

  &[data-position="center"] {
    top: 50%;
    bottom: auto;
    transform: translate(-50%, -50%);
  }

  /* Background options */
  &[data-background="black"] {
    background: rgba(0, 0, 0, 0.8);
    padding: 8px 16px;
    border-radius: 4px;
  }

  &[data-background="semi"] {
    background: rgba(0, 0, 0, 0.4);
    padding: 8px 16px;
    border-radius: 4px;
  }
}
```

## **Loading & Error States**

### **Loading State Design**
```css
.loading-skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.1) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.video-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-900);
  color: var(--text-secondary);

  &__spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-left-color: var(--accent-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### **Error State Design**
```css
.video-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  background: var(--primary-900);
  color: var(--text-primary);

  &__icon {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
    color: var(--error);
  }

  &__title {
    font-size: var(--text-xl);
    font-weight: var(--font-semibold);
    margin-bottom: 8px;
  }

  &__message {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin-bottom: 24px;
    max-width: 400px;
  }

  &__retry {
    @extend .btn-primary;
  }
}
```

---

**Design Philosophy:** This design system prioritizes accessibility, performance, and cross-platform consistency while maintaining a professional, modern aesthetic that demonstrates enterprise-level design thinking and implementation capabilities.