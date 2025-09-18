# 🎨 AI Wireframing Demo - Frame0 + Superdesign

**Designer:** Riley (UX)
**Tools:** Frame0 Diagramming + Superdesign MCP Servers
**Demo Date:** 2024-09-18

---

## **AI Wireframing Workflow Demonstration**

### **Tool Integration Status**
- ✅ **Frame0 MCP Server:** Connected via `claude mcp add-json`
- ✅ **Superdesign MCP Server:** Connected via custom installation
- 🔄 **Workflow Ready:** Both tools available for AI-assisted design

---

## **Demo 1: Frame0 - Basic Video Player Wireframe**

### **Natural Language Prompt for Frame0:**
*"Create a desktop video player wireframe with these specifications:*
- *16:9 aspect ratio video container*
- *Centered play button overlay on video*
- *Bottom control bar with: play/pause, progress bar, volume control, settings, fullscreen*
- *WCAG 2.1 AA accessibility focus indicators*
- *Tab order numbers for keyboard navigation*
- *Smart TV D-pad navigation flow indicators"*

### **Expected Frame0 Output:**
```
Frame0 Wireframe Generated:

┌─────────────────────────────────────────────────────────────┐
│ Video Player Demo - Desktop Interface                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │                 VIDEO AREA                          │   │ ← 16:9 Container
│  │               (1280 x 720)                          │   │
│  │                                                     │   │
│  │              [▶️ PLAY BUTTON]                       │   │ ← Centered Overlay
│  │                (Tab: 1)                             │   │
│  │                                                     │   │
│  │  Loading: [████████░░░] 80%    [CC] [HD] 1080p     │   │ ← Status Overlays
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ Control Bar ──────────────────────────────────────┐    │
│  │                                                    │    │
│  │ [▶️] [🔊] [▮▮▮▮▮▮▮▮░░░] [⚙️] [📺] [⛶]          │    │ ← Controls
│  │ (2)  (3)        (4)       (5)   (6)   (7)         │    │   Tab Order
│  │                                                    │    │
│  │ Time: 12:34 / 25:46          Quality: Auto (1080p) │    │ ← Status Info
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  Focus Indicators: 3px blue outline on focused elements    │ ← A11y Notes
│  D-pad: ←→ between controls, ↑↓ video/controls/settings    │
└─────────────────────────────────────────────────────────────┘

Accessibility Features:
- ARIA labels on all interactive elements
- Logical tab order (1-7)
- Focus indicators clearly visible
- Keyboard shortcuts documented
```

---

## **Demo 2: Superdesign - Component Specifications**

### **Natural Language Prompt for Superdesign:**
*"Generate detailed React TypeScript component specifications for a video player control bar with these requirements:*
- *Play/pause button with accessibility*
- *Progress bar with seek functionality*
- *Volume control with slider and mute*
- *Settings dropdown with Smart TV navigation*
- *Fullscreen toggle with keyboard shortcuts*
- *All components must support 90% test coverage*
- *WCAG 2.1 AA compliance built-in"*

### **Expected Superdesign Output:**
```typescript
// Superdesign Generated Component Specifications

interface VideoPlayerControlsProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  quality: string
  isFullscreen: boolean
  onPlay: () => void
  onPause: () => void
  onSeek: (time: number) => void
  onVolumeChange: (volume: number) => void
  onMuteToggle: () => void
  onQualityChange: (quality: string) => void
  onFullscreenToggle: () => void
  className?: string
}

// Component Architecture Specification
const componentSpecs = {
  PlayPauseButton: {
    purpose: 'Toggle video playback state',
    accessibility: {
      ariaLabel: 'isPlaying ? "Pause video" : "Play video"',
      keyboardShortcut: 'Spacebar',
      focusIndicator: '3px blue outline',
      screenReader: 'Announces state changes'
    },
    styling: {
      size: '48px desktop, 56px mobile, 64px TV',
      colors: 'Primary accent on dark background',
      hover: 'Scale 1.1 transform, background highlight',
      disabled: 'Opacity 0.5, no pointer events'
    },
    testing: {
      unit: 'Click handlers, state changes, accessibility',
      integration: 'Redux integration, keyboard shortcuts',
      coverage: '95% requirement'
    }
  },

  ProgressBar: {
    purpose: 'Display video progress and enable seeking',
    accessibility: {
      ariaLabel: '"Video progress: {currentTime} of {duration}"',
      role: 'slider',
      ariaValueNow: 'currentTime',
      ariaValueMin: '0',
      ariaValueMax: 'duration'
    },
    interaction: {
      click: 'Seek to clicked position',
      drag: 'Scrub through video',
      keyboard: 'Arrow keys for fine seek control',
      touch: 'Large touch target for mobile'
    },
    visual: {
      height: '6px desktop, 8px mobile, 10px TV',
      colors: 'Progress: accent, Buffer: semi-transparent, Background: dark',
      handle: 'Visible on hover/focus, 16px circle'
    }
  },

  VolumeControl: {
    purpose: 'Control audio volume and mute state',
    accessibility: {
      ariaLabel: '"Volume control: {volume}%"',
      muteButton: '"Mute" or "Unmute" based on state',
      keyboardControl: 'Up/Down arrows when focused'
    },
    layout: {
      desktop: 'Icon + horizontal slider',
      mobile: 'Icon only, tap for volume popup',
      TV: 'Icon + large slider for D-pad control'
    }
  }
}
```

---

## **Demo 3: Combined Workflow - Smart TV Interface**

### **Frame0 + Superdesign Collaboration:**

**Step 1: Frame0 generates the wireframe structure**
```
Prompt: "Create Smart TV video player wireframe with TV-safe margins, large D-pad navigation indicators, focused element highlighting, and 1920x1080 layout optimized for couch viewing distance."

Generated Structure:
┌─────────────────────────────────────────────────────────────┐
│ ◄─ 48px TV Safe Area ─► VIDEO PLAYER ◄─ 48px TV Safe ─►    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    ┌─────────────────────────────────────────────────┐     │
│    │                                                 │     │
│    │              VIDEO CONTENT                      │     │ ← Large Video
│    │              (1824 x 1026)                      │     │   (Safe Area)
│    │                                                 │     │
│    │          [🔵 LARGE PLAY BUTTON]                 │     │ ← 80px Button
│    │            (Currently Focused)                  │     │
│    │                                                 │     │
│    └─────────────────────────────────────────────────┘     │
│                                                             │
│    ┌─ TV Controls (D-pad Optimized) ─────────────────┐     │
│    │                                                 │     │
│    │  [▶️]    [🔊]    [▮▮▮▮▮░░░]    [⚙️]    [📺]    │     │ ← 80px Buttons
│    │  (1)     (2)         (3)        (4)     (5)     │     │   Tab/D-pad
│    │   🔵      ○          ○          ○       ○       │     │   Order
│    │                                                 │     │
│    │     ↑ Focused    ← D-pad Navigation →           │     │
│    └─────────────────────────────────────────────────┘     │
│                                                             │
│    Instructions: Use ↑↓←→ to navigate • Enter to select    │ ← Help Text
│    Progress: ████████████░░░░ 67% • Time: 12:34 / 18:22    │   (Large Font)
└─────────────────────────────────────────────────────────────┘
```

**Step 2: Superdesign generates detailed component specs**
```typescript
// Superdesign TV Component Specifications
const smartTVComponents = {
  TVPlayButton: {
    design: {
      size: '80px x 80px (large for TV viewing)',
      focusState: 'Blue ring + scale(1.15) + drop shadow',
      colors: 'High contrast white on dark background',
      typography: 'Not applicable (icon only)'
    },
    accessibility: {
      ariaLabel: 'Play video / Pause video',
      focusManagement: 'Receives focus on Tab or D-pad navigation',
      screenReader: 'State changes announced immediately',
      keyboardShortcuts: 'Spacebar, Enter key'
    },
    interactions: {
      dpad: 'Enter key activates, arrows move focus',
      visual_feedback: 'Immediate visual response to input',
      hover_state: 'Not applicable for TV (no mouse)',
      active_state: 'Pressed state with visual feedback'
    }
  },

  TVProgressBar: {
    design: {
      height: '12px (larger for TV)',
      width: '60% of control bar width',
      handle: '24px circle (larger for D-pad control)',
      colors: 'High contrast progress indication'
    },
    accessibility: {
      role: 'slider',
      ariaLabel: 'Video progress: {minutes}:{seconds} of {totalMinutes}:{totalSeconds}',
      valueText: 'Human-readable time format',
      keyboardControl: 'Left/Right arrows for 10-second jumps'
    },
    performance: {
      updateFrequency: '30fps maximum for TV hardware',
      smoothing: 'CSS transitions for progress updates',
      memory: 'Efficient DOM updates'
    }
  }
}
```

---

## **🔄 Collaborative Workflow Demonstration**

### **How Frame0 + Superdesign Work Together:**

**Riley (UX):** *"Here's how we'll use both tools collaboratively:"*

1. **Frame0:** Create wireframe layouts and user flows
2. **Superdesign:** Generate detailed component specifications
3. **Integration:** Combine wireframes with component specs for implementation
4. **Validation:** Team reviews AI-generated designs for accuracy

### **Practical Example: Mobile Video Player**

**Frame0 Mobile Wireframe Prompt:**
```
"Create mobile video player wireframe for portrait orientation:
- Touch-optimized layout with 56px minimum touch targets
- Swipe gestures for seek functionality
- Bottom sheet settings panel
- Picture-in-Picture button
- Accessibility considerations for mobile screen readers"
```

**Expected Frame0 Mobile Output:**
```
Mobile Video Player Wireframe (375 x 812):

┌─────────────────────────┐
│ ●●● 🔋100% 📶 ⏰12:34  │ ← iOS Status Bar
├─────────────────────────┤
│ ← Video Demo      [⚙️] │ ← Navigation Header
├─────────────────────────┤
│                         │
│ ┌─────────────────────┐ │ ← Video Container
│ │                     │ │   (16:9 cropped for
│ │   VIDEO CONTENT     │ │    portrait viewing)
│ │                     │ │
│ │   [▶️ LARGE PLAY]   │ │ ← 64px Touch Target
│ │     (Touch: 1)      │ │
│ │                     │ │
│ │ [CC] [HD] [📺]     │ │ ← Quick Actions
│ └─────────────────────┘ │
│                         │
│ ┌─ Touch Controls ───┐  │ ← 56px Touch Targets
│ │                    │ │
│ │ [▶️]  [🔊]  [⛶]   │ │ ← Primary Controls
│ │ (2)   (3)   (4)    │ │   Touch Order
│ │                    │ │
│ └─────────────────────┘ │
│                         │
│ ┌─ Progress Bar ─────┐  │ ← Touch-Friendly
│ │ ████████░░░░░░░     │ │   Progress (12px)
│ │ 12:34 / 25:46      │ │
│ └─────────────────────┘ │
│                         │
│ Swipe ←→ for seek       │ ← Gesture Hints
│ Tap screen for controls │
│                         │
│ [⚙️ Settings Sheet]    │ ← Bottom Sheet
└─────────────────────────┘   Trigger

Touch Interactions:
1. Single tap: Play/pause
2. Double tap: Fullscreen
3. Swipe left: -10s seek
4. Swipe right: +10s seek
5. Swipe up: Settings panel
```

**Superdesign Component Specification Prompt:**
```
"Generate React TypeScript component specifications for mobile video player with:
- Touch-optimized button components (56px minimum)
- Swipe gesture handlers for seek functionality
- Bottom sheet settings panel with spring animations
- iOS and Android platform adaptations
- Comprehensive accessibility support
- 90% test coverage requirements"
```

**Expected Superdesign Mobile Component Output:**
```typescript
// Superdesign Generated Mobile Components

interface MobileVideoPlayerProps {
  src: string
  poster?: string
  autoplay?: boolean
  muted?: boolean
  onPlaybackChange?: (isPlaying: boolean) => void
  onTimeUpdate?: (currentTime: number, duration: number) => void
  className?: string
}

const MobileVideoPlayer: React.FC<MobileVideoPlayerProps> = ({
  src,
  poster,
  autoplay = false,
  muted = false,
  onPlaybackChange,
  onTimeUpdate,
  className
}) => {
  // Component implementation specification

  const touchHandlers = {
    onTouchStart: 'Record touch start position and time',
    onTouchMove: 'Calculate swipe distance and direction',
    onTouchEnd: 'Execute gesture based on swipe pattern',

    gestures: {
      singleTap: 'Toggle play/pause state',
      doubleTap: 'Toggle fullscreen mode',
      swipeLeft: 'Seek backward 10 seconds',
      swipeRight: 'Seek forward 10 seconds',
      swipeUp: 'Open settings bottom sheet',
      pinch: 'Zoom functionality (if supported)'
    }
  }

  const accessibility = {
    ariaLabel: 'Video player with touch controls',
    announcements: 'State changes announced to screen reader',
    focusManagement: 'Logical focus order for keyboard users',
    touchTargets: 'Minimum 56px for all interactive elements'
  }

  return (
    <div
      className={`mobile-video-player ${className}`}
      role="application"
      aria-label="Mobile video player"
    >
      {/* Video container with touch handlers */}
      {/* Control overlay with large touch targets */}
      {/* Settings bottom sheet component */}
    </div>
  )
}

// Component Styling Specifications
const mobileStyles = {
  container: {
    width: '100%',
    height: 'auto',
    position: 'relative',
    backgroundColor: '#000000',
    borderRadius: '8px',
    overflow: 'hidden'
  },

  touchTargets: {
    minHeight: '56px',
    minWidth: '56px',
    padding: '16px',
    margin: '8px',
    borderRadius: '12px'
  },

  animations: {
    controlFade: 'opacity 300ms ease-in-out',
    bottomSheet: 'transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    buttonPress: 'transform 150ms ease-out'
  }
}
```

---

## **Demo 3: Smart TV Interface with Both Tools**

### **Frame0 Smart TV Layout:**
```
Smart TV Video Player (1920 x 1080):

┌─────────────────────────────────────────────────────────────┐
│ ◄─ 48px Safe ─► FOX Video Player Demo ◄─ 48px Safe ─►      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│     ┌─────────────────────────────────────────────────┐    │
│     │                                                 │    │ ← TV Video Area
│     │               VIDEO CONTENT                     │    │   (1824 x 1026)
│     │               (TV Optimized)                    │    │   Safe margins
│     │                                                 │    │
│     │           [🔵 PLAY BUTTON]                      │    │ ← 96px Button
│     │             (Focused State)                     │    │   TV-sized
│     │                                                 │    │
│     └─────────────────────────────────────────────────┘    │
│                                                             │
│     ┌─ TV Control Bar (80px height) ──────────────────┐    │
│     │                                                 │    │
│     │ [▶️]   [🔊]   [▮▮▮▮▮▮░░░]   [⚙️]   [📺]       │    │ ← 80px Buttons
│     │ (1)    (2)        (3)        (4)    (5)        │    │   Large for TV
│     │  🔵     ○         ○          ○      ○          │    │
│     │                                                 │    │
│     │      ◄── D-pad Navigation Pattern ──►          │    │ ← Navigation
│     └─────────────────────────────────────────────────┘    │   Indicators
│                                                             │
│     Time: 12:34 / 25:46    Quality: Auto (1080p)          │ ← Large Text
│     Use D-pad ↑↓←→ • Enter to select • Back to exit       │   (24px font)
└─────────────────────────────────────────────────────────────┘

D-pad Navigation Map:
- UP: Video area ↔ Settings menu
- DOWN: Video area ↔ Control bar
- LEFT/RIGHT: Between controls (spatial)
- ENTER: Activate focused element
- BACK: Previous level/close
```

**Superdesign Smart TV Component Specs:**
```typescript
// TV-Optimized Component Specifications
const smartTVComponents = {
  TVVideoPlayer: {
    layout: {
      container: '1824px x 1026px (within TV safe area)',
      margins: '48px horizontal, 27px vertical',
      aspectRatio: '16:9 maintained',
      zIndex: 'Layered for proper focus management'
    },

    performance: {
      frameRate: '30fps UI animations (TV hardware)',
      memoryTarget: '< 150MB total usage',
      cpuTarget: '< 30% average CPU',
      responseTime: '< 200ms for D-pad input'
    },

    navigation: {
      focusRing: '4px blue outline + 8px offset',
      spatialLogic: 'Nearest neighbor focus algorithm',
      focusTraps: 'Settings modal traps focus within',
      shortcuts: 'Standard TV remote button mapping'
    }
  }
}
```

---

## **AI Tool Benefits Demonstrated**

### **Frame0 Advantages:**
- ✅ **Rapid Layout Creation:** Wireframes generated in seconds vs. hours
- ✅ **Natural Language Input:** Describe design intent, get visual output
- ✅ **Accessibility Integration:** Built-in focus indicators and navigation
- ✅ **Platform Variations:** Easy to generate desktop/mobile/TV versions

### **Superdesign Advantages:**
- ✅ **Component Specifications:** Detailed React TypeScript specs
- ✅ **Accessibility Built-in:** WCAG compliance considerations included
- ✅ **Testing Integration:** Component specs include testing requirements
- ✅ **Cross-Platform Adaptation:** Platform-specific optimizations

### **Combined Workflow Benefits:**
- ✅ **Design-to-Code Pipeline:** Seamless transition from wireframe to implementation
- ✅ **Consistency Enforcement:** Design system compliance automated
- ✅ **Quality Assurance:** Accessibility and testing built into design specs
- ✅ **Speed:** 10x faster than traditional wireframing methods

---

**Riley (UX):** *"John, this AI-assisted workflow means we can generate professional wireframes and component specifications in minutes instead of hours, while ensuring accessibility is built in from the start. Perfect for our tight 5-7 day timeline!"*

**Morgan (Team Lead):** *"This demonstrates exactly the kind of modern, AI-assisted development workflow that will impress the FOX Corporation hiring team. We're using cutting-edge tools to accelerate delivery while maintaining enterprise quality standards."*

**Ready to start using these tools for our actual video player wireframes?**