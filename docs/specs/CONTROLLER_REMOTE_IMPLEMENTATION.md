# Smart TV Remote Control Implementation Strategy

## Executive Product Overview

**Product Manager**: Jordan
**Business Objective**: Demonstrate Smart TV platform expertise for FOX Corporation role
**Target Outcome**: Showcase JavaScript performance optimization for TV remote interactions
**Primary Platform**: Web-based Smart TV simulation with actual TV testing

---

## **🎯 Platform Controller/Remote Overview**

### **Input Method Matrix by Platform**
```typescript
interface InputMethodMatrix {
  web: {
    primary: ['Mouse', 'Keyboard'],
    secondary: ['Touch (mobile browsers)', 'Gamepad API'],
    implementation: 'Standard web APIs',
    complexity: '🟢 Low'
  },

  mobile: {
    iOS: {
      primary: ['Touch gestures', 'Physical buttons'],
      secondary: ['External keyboard', 'MFi controllers'],
      implementation: 'UIKit/SwiftUI gesture recognizers',
      complexity: '🟡 Medium'
    },
    android: {
      primary: ['Touch gestures', 'Physical buttons'],
      secondary: ['External keyboard', 'Bluetooth controllers'],
      implementation: 'Android MotionEvent and KeyEvent APIs',
      complexity: '🟡 Medium'
    }
  },

  smartTV: {
    roku: {
      primary: ['Roku remote control'],
      secondary: ['Mobile app remote', 'Voice commands'],
      implementation: 'BrightScript key event handling + ECP',
      complexity: '🔴 High'
    },
    tizen: {
      primary: ['Samsung remote control'],
      secondary: ['Mobile app', 'Voice (Bixby)', 'Gesture'],
      implementation: 'Tizen TVInputDevice API',
      complexity: '🔴 High'
    },
    webOS: {
      primary: ['LG Magic Remote'],
      secondary: ['LG ThinQ app', 'Voice commands'],
      implementation: 'webOS TV API with pointer/key events',
      complexity: '🔴 High'
    }
  },

  gamingConsoles: {
    playstation: {
      primary: ['DualSense/DualShock controller'],
      secondary: ['Voice commands', 'Mobile app'],
      implementation: 'PlayStation SDK controller APIs',
      complexity: '🔴 Very High'
    },
    nintendoSwitch: {
      primary: ['Joy-Con controllers', 'Pro Controller'],
      secondary: ['Touch screen (handheld)'],
      implementation: 'Nintendo SDK input handling',
      complexity: '🔴 Very High'
    }
  }
}
```

---

## **🌐 Web Platform Implementation**

### **Keyboard Event Handling**
```typescript
// Web keyboard implementation for video player
interface WebKeyboardImplementation {
  eventHandling: `
    const useKeyboardControls = () => {
      const dispatch = useAppDispatch()
      const { isPlaying, volume, currentTime, duration } = useAppSelector(state => state.player)

      useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
          // Prevent default for video player shortcuts
          const videoPlayerKeys = [' ', 'f', 'F', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']
          if (videoPlayerKeys.includes(event.key)) {
            event.preventDefault()
          }

          switch (event.key) {
            case ' ': // Spacebar - Play/Pause
              dispatch(togglePlayback())
              break

            case 'f':
            case 'F': // F key - Fullscreen
              dispatch(toggleFullscreen())
              break

            case 'ArrowLeft': // Left arrow - Seek backward
              dispatch(seekRelative(-10))
              break

            case 'ArrowRight': // Right arrow - Seek forward
              dispatch(seekRelative(10))
              break

            case 'ArrowUp': // Up arrow - Volume up
              dispatch(adjustVolume(0.1))
              break

            case 'ArrowDown': // Down arrow - Volume down
              dispatch(adjustVolume(-0.1))
              break

            case 'm':
            case 'M': // M key - Mute toggle
              dispatch(toggleMute())
              break

            case 'Escape': // Escape - Exit fullscreen/close modals
              dispatch(exitFullscreen())
              dispatch(closeSettings())
              break

            case 'Tab': // Tab - Focus management (let browser handle)
              // Standard tab navigation
              break

            default:
              // Allow other keys to bubble up
              break
          }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
      }, [dispatch])
    }
  `,

  gamepadAPI: `
    // Optional gamepad support for web
    const useGamepadSupport = () => {
      useEffect(() => {
        const handleGamepadInput = () => {
          const gamepads = navigator.getGamepads()
          const gamepad = gamepads[0]

          if (gamepad) {
            // D-pad handling
            if (gamepad.buttons[12].pressed) dispatch(focusPrevious()) // D-pad left
            if (gamepad.buttons[13].pressed) dispatch(focusNext())     // D-pad right
            if (gamepad.buttons[0].pressed) dispatch(activateControl()) // A button

            // Analog stick for seeking/volume
            if (Math.abs(gamepad.axes[0]) > 0.5) {
              dispatch(seekRelative(gamepad.axes[0] * 5))
            }
          }
        }

        const gamepadInterval = setInterval(handleGamepadInput, 100)
        return () => clearInterval(gamepadInterval)
      }, [dispatch])
    }
  `
}
```

---

## **📺 Smart TV Platform Implementation**

### **Roku Remote Control Implementation**
```typescript
interface RokuRemoteImplementation {
  brightScriptImplementation: `
    ' Roku BrightScript remote control handling
    function onKeyEvent(key as String, press as Boolean) as Boolean
        if press then
            if key = "OK" or key = "play"
                ' Handle play/pause
                togglePlayback()
                return true
            else if key = "left"
                ' Handle left arrow - seek backward
                seekRelative(-10)
                return true
            else if key = "right"
                ' Handle right arrow - seek forward
                seekRelative(10)
                return true
            else if key = "up"
                ' Handle up arrow - volume up or focus up
                if m.focusedControl = "volume"
                    adjustVolume(0.1)
                else
                    focusUp()
                end if
                return true
            else if key = "down"
                ' Handle down arrow - volume down or focus down
                if m.focusedControl = "volume"
                    adjustVolume(-0.1)
                else
                    focusDown()
                end if
                return true
            else if key = "back"
                ' Handle back button - exit or previous menu
                exitCurrentScreen()
                return true
            end if
        end if
        return false
    end function
  `,

  keyMapping: {
    'OK': 'Activate focused control or play/pause',
    'play': 'Play/pause toggle',
    'left': 'Navigate left or seek backward',
    'right': 'Navigate right or seek forward',
    'up': 'Navigate up or volume up',
    'down': 'Navigate down or volume down',
    'back': 'Exit screen or close modal',
    'home': 'Return to Roku home screen',
    'options': 'Open settings menu',
    'replay': 'Seek backward 10 seconds',
    'fastforward': 'Seek forward 30 seconds'
  },

  externalControlProtocol: {
    purpose: 'Allow external devices to control Roku via HTTP',
    endpoint: 'http://roku-ip:8060/keypress/<key>',
    testing: 'curl -d "" http://192.168.1.100:8060/keypress/Play',
    integration: 'Mobile app remote control, automation testing'
  }
}
```

### **Samsung Tizen Remote Control Implementation**
```typescript
interface TizenRemoteImplementation {
  tvInputDeviceAPI: `
    // Samsung Tizen TVInputDevice API implementation
    class TizenRemoteHandler {
      constructor() {
        this.registerRemoteKeys()
      }

      registerRemoteKeys() {
        try {
          // Register custom keys (automatic keys don't need registration)
          const supportedKeys = tizen.tvinputdevice.getSupportedKeys()

          const customKeys = ['ColorF0Red', 'ColorF1Green', 'ColorF2Yellow', 'ColorF3Blue']

          // Batch register for better performance (2016+ models)
          tizen.tvinputdevice.registerKeyBatch(customKeys, (keys) => {
            console.log('Registered keys:', keys)
          }, (error) => {
            console.error('Key registration failed:', error)
          })

        } catch (error) {
          console.error('TVInputDevice API not available:', error)
        }
      }

      handleKeyDown(event) {
        const key = event.keyCode || event.which

        switch (key) {
          case 13: // Enter key
            this.activateFocusedControl()
            event.preventDefault()
            break

          case 37: // Left arrow
            this.navigateLeft()
            event.preventDefault()
            break

          case 39: // Right arrow
            this.navigateRight()
            event.preventDefault()
            break

          case 38: // Up arrow
            this.navigateUp()
            event.preventDefault()
            break

          case 40: // Down arrow
            this.navigateDown()
            event.preventDefault()
            break

          case 10009: // Back key
            this.goBack()
            event.preventDefault()
            break

          case 404: // Green button (custom)
            this.openSettings()
            event.preventDefault()
            break
        }
      }

      // Spatial navigation logic
      navigateLeft() {
        const currentControl = this.getCurrentFocusedControl()
        const nextControl = this.findNextControl('left', currentControl)
        this.focusControl(nextControl)
      }

      // Voice control integration (Bixby)
      initializeBixbySupport() {
        if (typeof webOSBixby !== 'undefined') {
          webOSBixby.initialize({
            onVoiceCommand: (command) => {
              this.handleVoiceCommand(command)
            }
          })
        }
      }
    }
  `,

  privilegeRequirements: `
    <!-- config.xml - Required privileges for Tizen TV -->
    <tizen:privilege name="http://tizen.org/privilege/tv.inputdevice"/>
    <tizen:privilege name="http://tizen.org/privilege/tv.display"/>
    <tizen:privilege name="http://developer.samsung.com/privilege/avplay"/>
  `,

  keyCodeMapping: {
    enter: 13,
    back: 10009,
    left: 37,
    right: 39,
    up: 38,
    down: 40,
    red: 403,
    green: 404,
    yellow: 405,
    blue: 406,
    channelUp: 427,
    channelDown: 428,
    volumeUp: 447,
    volumeDown: 448
  }
}
```

### **LG webOS Remote Control Implementation**
```typescript
interface WebOSRemoteImplementation {
  webOSAPIImplementation: `
    // LG webOS TV API implementation
    class WebOSRemoteHandler {
      constructor() {
        this.initializeWebOS()
      }

      initializeWebOS() {
        // Initialize webOS TV JS API
        if (typeof webOS !== 'undefined') {
          webOS.fetchAppInfo((appInfo) => {
            console.log('App Info:', appInfo)
            this.setupRemoteHandling()
          })
        }
      }

      setupRemoteHandling() {
        // Standard key event handling
        document.addEventListener('keydown', (event) => {
          this.handleRemoteInput(event)
        })

        // Magic Remote pointer events (LG specific)
        if (typeof webOS.service !== 'undefined') {
          webOS.service.request('luna://com.webos.service.ime', {
            method: 'registerRemoteKeyFilter',
            parameters: {
              keys: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter']
            },
            onSuccess: (result) => {
              console.log('Remote key filter registered')
            },
            onFailure: (error) => {
              console.error('Failed to register key filter:', error)
            }
          })
        }
      }

      handleRemoteInput(event) {
        const key = event.key || event.keyCode

        switch (key) {
          case 'Enter':
          case 13:
            this.activateControl()
            break

          case 'ArrowLeft':
          case 37:
            this.navigateLeft()
            break

          case 'ArrowRight':
          case 39:
            this.navigateRight()
            break

          case 'Back':
          case 461: // webOS back key
            this.handleBackButton()
            break

          case 'Home':
          case 458: // webOS home key
            this.returnToHome()
            break
        }
      }

      // Magic Remote specific features
      handleMagicRemotePointer() {
        // LG Magic Remote has pointer capabilities
        document.addEventListener('mousemove', (event) => {
          if (this.isMagicRemote()) {
            this.updatePointerFocus(event.clientX, event.clientY)
          }
        })
      }

      isMagicRemote() {
        return navigator.userAgent.includes('webOS')
      }
    }
  `,

  magicRemoteFeatures: {
    pointer: 'Magic Remote acts as air mouse with cursor',
    gestures: 'Point and click interface for TV',
    scroll: 'Scroll wheel for content navigation',
    voice: 'Voice search and commands via LG ThinQ'
  }
}
```

---

## **📱 Mobile Platform Implementation**

### **iOS Controller Implementation**
```typescript
interface iOSControllerImplementation {
  swiftUIImplementation: `
    // iOS SwiftUI video player with controller support
    import SwiftUI
    import AVFoundation
    import GameController

    struct VideoPlayerView: View {
        @StateObject private var playerViewModel = VideoPlayerViewModel()
        @State private var showControls = true

        var body: some View {
            ZStack {
                // Video player view
                VideoPlayerContainer(player: playerViewModel.player)

                // Touch gesture overlay
                TouchGestureOverlay()
                    .opacity(showControls ? 1 : 0)
            }
            .onAppear {
                setupControllerSupport()
            }
            .gesture(
                // Tap gesture for control visibility
                TapGesture()
                    .onEnded { _ in
                        withAnimation {
                            showControls.toggle()
                        }
                    }
            )
        }

        private func setupControllerSupport() {
            // MFi controller support
            NotificationCenter.default.addObserver(
                forName: .GCControllerDidConnect,
                object: nil,
                queue: .main
            ) { _ in
                setupGameController()
            }
        }

        private func setupGameController() {
            guard let controller = GCController.controllers().first else { return }

            // Extended gamepad support
            if let extendedGamepad = controller.extendedGamepad {
                // D-pad navigation
                extendedGamepad.dpad.left.pressedChangedHandler = { _, _, pressed in
                    if pressed { playerViewModel.navigateLeft() }
                }

                extendedGamepad.dpad.right.pressedChangedHandler = { _, _, pressed in
                    if pressed { playerViewModel.navigateRight() }
                }

                // A button for activation
                extendedGamepad.buttonA.pressedChangedHandler = { _, _, pressed in
                    if pressed { playerViewModel.activateControl() }
                }

                // B button for back
                extendedGamepad.buttonB.pressedChangedHandler = { _, _, pressed in
                    if pressed { playerViewModel.goBack() }
                }
            }
        }
    }

    // Touch gesture handling
    struct TouchGestureOverlay: View {
        var body: some View {
            Rectangle()
                .fill(Color.clear)
                .contentShape(Rectangle())
                .simultaneousGesture(
                    // Single tap - play/pause
                    TapGesture()
                        .onEnded { _ in
                            VideoPlayerViewModel.shared.togglePlayback()
                        }
                )
                .simultaneousGesture(
                    // Double tap - fullscreen
                    TapGesture(count: 2)
                        .onEnded { _ in
                            VideoPlayerViewModel.shared.toggleFullscreen()
                        }
                )
                .simultaneousGesture(
                    // Swipe left - seek backward
                    DragGesture()
                        .onEnded { value in
                            let swipeDistance = value.translation.x
                            if swipeDistance < -50 {
                                VideoPlayerViewModel.shared.seekRelative(-10)
                            } else if swipeDistance > 50 {
                                VideoPlayerViewModel.shared.seekRelative(10)
                            }
                        }
                )
        }
    }
  `,

  controllerSupport: {
    mfiControllers: 'MFi (Made for iPhone) certified controllers',
    gamepadAPI: 'GameController framework for standard controllers',
    keyboardSupport: 'External keyboard with standard shortcuts',
    accessibilityControllers: 'Switch Control and AssistiveTouch support'
  }
}
```

### **Android Controller Implementation**
```typescript
interface AndroidControllerImplementation {
  kotlinImplementation: `
    // Android Kotlin video player with controller support
    class VideoPlayerActivity : ComponentActivity() {
        private lateinit var videoPlayerViewModel: VideoPlayerViewModel

        override fun onCreate(savedInstanceState: Bundle?) {
            super.onCreate(savedInstanceState)

            setContent {
                VideoPlayerScreen(
                    viewModel = videoPlayerViewModel,
                    onKeyEvent = { keyEvent -> handleKeyEvent(keyEvent) }
                )
            }
        }

        private fun handleKeyEvent(keyEvent: KeyEvent): Boolean {
            return when (keyEvent.keyCode) {
                KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE,
                KeyEvent.KEYCODE_SPACE -> {
                    videoPlayerViewModel.togglePlayback()
                    true
                }

                KeyEvent.KEYCODE_DPAD_LEFT -> {
                    if (videoPlayerViewModel.focusedControl.value == "seek") {
                        videoPlayerViewModel.seekRelative(-10)
                    } else {
                        videoPlayerViewModel.navigateLeft()
                    }
                    true
                }

                KeyEvent.KEYCODE_DPAD_RIGHT -> {
                    if (videoPlayerViewModel.focusedControl.value == "seek") {
                        videoPlayerViewModel.seekRelative(10)
                    } else {
                        videoPlayerViewModel.navigateRight()
                    }
                    true
                }

                KeyEvent.KEYCODE_DPAD_UP -> {
                    if (videoPlayerViewModel.focusedControl.value == "volume") {
                        videoPlayerViewModel.adjustVolume(0.1f)
                    } else {
                        videoPlayerViewModel.navigateUp()
                    }
                    true
                }

                KeyEvent.KEYCODE_DPAD_DOWN -> {
                    if (videoPlayerViewModel.focusedControl.value == "volume") {
                        videoPlayerViewModel.adjustVolume(-0.1f)
                    } else {
                        videoPlayerViewModel.navigateDown()
                    }
                    true
                }

                KeyEvent.KEYCODE_BACK -> {
                    videoPlayerViewModel.handleBackButton()
                    true
                }

                else -> false
            }
        }
    }

    // Compose gesture handling
    @Composable
    fun VideoPlayerGestureOverlay(
        onTap: () -> Unit,
        onDoubleTap: () -> Unit,
        onSwipe: (direction: SwipeDirection) -> Unit
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .pointerInput(Unit) {
                    detectTapGestures(
                        onTap = { onTap() },
                        onDoubleTap = { onDoubleTap() }
                    )
                }
                .pointerInput(Unit) {
                    detectDragGestures { change, _ ->
                        val swipeThreshold = 100f
                        when {
                            change.x > swipeThreshold -> onSwipe(SwipeDirection.Right)
                            change.x < -swipeThreshold -> onSwipe(SwipeDirection.Left)
                            change.y > swipeThreshold -> onSwipe(SwipeDirection.Down)
                            change.y < -swipeThreshold -> onSwipe(SwipeDirection.Up)
                        }
                    }
                }
        )
    }
  `,

  androidTVSupport: {
    leanbackSupport: 'Android TV Leanback library for D-pad navigation',
    remoteKeys: 'Standard Android TV remote key codes',
    voiceSupport: 'Google Assistant integration for voice control'
  }
}
```

---

## **🎮 Gaming Console Implementation**

### **PlayStation Controller Implementation**
```typescript
interface PlayStationImplementation {
  dualSenseFeatures: {
    hapticFeedback: 'Tactile feedback for UI interactions and video events',
    adaptiveTriggers: 'Variable resistance for volume/seek controls',
    touchpad: 'Swipe gestures for seeking and volume',
    speakerFeedback: 'Audio cues through controller speaker'
  },

  controllerMapping: {
    'X': 'Activate/Select (primary action)',
    'Circle': 'Back/Cancel',
    'Square': 'Settings/Options',
    'Triangle': 'Info/Details',
    'L1/R1': 'Previous/Next content',
    'L2/R2': 'Volume down/up (analog)',
    'DPad': 'Navigation between controls',
    'LeftStick': 'Seeking (analog)',
    'RightStick': 'Volume (analog)',
    'Share': 'Share clip or screenshot',
    'Options': 'Settings menu',
    'PS': 'Home/Dashboard'
  },

  implementationNote: 'Requires PlayStation SDK and developer license ($$$)'
}
```

### **Nintendo Switch Controller Implementation**
```typescript
interface NintendoSwitchImplementation {
  joyConSupport: {
    handheldMode: 'Touch screen + physical buttons',
    dockedMode: 'Joy-Con controllers or Pro Controller',
    tabletopMode: 'Detached Joy-Con controllers'
  },

  controllerMapping: {
    'A': 'Activate/Select',
    'B': 'Back/Cancel',
    'X': 'Settings',
    'Y': 'Info',
    'L/R': 'Shoulder buttons for quick actions',
    'ZL/ZR': 'Trigger buttons for analog control',
    'DPad': 'Navigation',
    'LeftStick': 'Seeking',
    'RightStick': 'Volume',
    'Plus': 'Settings',
    'Minus': 'Back',
    'Home': 'Switch home menu'
  },

  implementationNote: 'Requires Nintendo SDK and developer license ($$$)'
}
```

---

## **📋 Official Documentation Quick Reference**

### **Platform Documentation URLs**
```typescript
interface OfficialDocumentation {
  smartTV: {
    roku: {
      developer: 'https://developer.roku.com/',
      brightScript: 'https://developer.roku.com/docs/references/brightscript/',
      remoteControl: 'https://developer.roku.com/docs/developer-program/core-concepts/scenegraph-xml/remote-control-events.md',
      externalControl: 'https://developer.roku.com/docs/developer-program/dev-tools/external-control-api.md',
      sdk: 'Roku SDK available via developer portal'
    },

    tizen: {
      developer: 'https://developer.samsung.com/smarttv/',
      webAPI: 'https://developer.samsung.com/smarttv/develop/api-references/tizen-web-device-api-references.html',
      inputDevice: 'https://developer.samsung.com/smarttv/develop/api-references/tizen-web-device-api-references/tvinputdevice-api.html',
      remoteControl: 'https://developer.samsung.com/smarttv/develop/guides/user-interaction/remote-control.html',
      sdk: 'Tizen Studio with TV extensions'
    },

    webOS: {
      developer: 'https://webostv.developer.lge.com/',
      webOSAPI: 'https://webostv.developer.lge.com/develop/references/webostvjs-webos',
      deviceInfo: 'https://webostv.developer.lge.com/develop/references/tv-device-information',
      sdk: 'webOS TV SDK with webOS Studio (VS Code extension)',
      cli: 'webOS CLI for project management'
    }
  },

  mobile: {
    iOS: {
      developer: 'https://developer.apple.com/',
      avFoundation: 'https://developer.apple.com/documentation/avfoundation/',
      gameController: 'https://developer.apple.com/documentation/gamecontroller/',
      uikit: 'https://developer.apple.com/documentation/uikit/',
      swiftUI: 'https://developer.apple.com/documentation/swiftui/'
    },

    android: {
      developer: 'https://developer.android.com/',
      mediaPlayer: 'https://developer.android.com/guide/topics/media/mediaplayer',
      exoPlayer: 'https://exoplayer.dev/',
      jetpackCompose: 'https://developer.android.com/jetpack/compose',
      androidTV: 'https://developer.android.com/tv'
    }
  },

  web: {
    w3c: 'https://www.w3.org/TR/html52/semantics-embedded-content.html#the-video-element',
    mdn: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement',
    gamepadAPI: 'https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API',
    mediaSession: 'https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API'
  },

  gamingConsoles: {
    playstation: {
      developer: 'https://www.playstation.com/en-us/develop/',
      sdk: 'PlayStation SDK (requires developer license)',
      note: 'Access restricted to licensed developers'
    },
    nintendo: {
      developer: 'https://developer.nintendo.com/',
      sdk: 'Nintendo SDK (requires developer license)',
      note: 'Access restricted to licensed developers'
    }
  }
}
```

---

## **🔧 Implementation Strategy for Our Demo**

### **Cross-Platform Controller Abstraction**
```typescript
// Unified controller handling across platforms
interface ControllerAbstraction {
  webImplementation: {
    primary: 'Keyboard event handling with gamepad API support',
    testing: 'Easy testing with browser developer tools',
    deployment: 'No additional requirements',
    coverage: 'Mouse, keyboard, basic gamepad support'
  },

  smartTVSimulation: {
    approach: 'Simulate TV remote behavior with web keyboard events',
    implementation: `
      const useSmartTVSimulation = () => {
        const [isTVMode, setIsTVMode] = useState(false)

        useEffect(() => {
          // Detect Smart TV environment
          const isTV = /Smart-?TV|Tizen|webOS|Roku/i.test(navigator.userAgent) ||
                      (window.innerWidth >= 1920 && window.devicePixelRatio === 1)

          setIsTVMode(isTV)

          if (isTV) {
            // Apply TV-specific keyboard handling
            document.addEventListener('keydown', handleTVRemoteInput)
          }

          return () => {
            document.removeEventListener('keydown', handleTVRemoteInput)
          }
        }, [])

        const handleTVRemoteInput = (event: KeyboardEvent) => {
          // Map keyboard keys to TV remote functions
          const keyMap = {
            'Enter': 'activate',
            'ArrowLeft': 'navigateLeft',
            'ArrowRight': 'navigateRight',
            'ArrowUp': 'navigateUp',
            'ArrowDown': 'navigateDown',
            'Escape': 'back',
            'Backspace': 'back'
          }

          const action = keyMap[event.key]
          if (action) {
            event.preventDefault()
            dispatch(tvRemoteAction(action))
          }
        }

        return { isTVMode }
      }
    `
  },

  mobileWebImplementation: {
    approach: 'Touch gesture handling with responsive design',
    implementation: 'Touch event listeners with swipe detection',
    testing: 'Browser mobile device emulation',
    coverage: 'Touch gestures, orientation changes, viewport adaptation'
  }
}
```

### **Platform Detection & Adaptation**
```typescript
interface PlatformDetectionStrategy {
  detectionLogic: `
    const usePlatformDetection = () => {
      const [platform, setPlatform] = useState<Platform>('web')
      const [inputMethod, setInputMethod] = useState<InputMethod>('mouse')

      useEffect(() => {
        const userAgent = navigator.userAgent
        const viewport = { width: window.innerWidth, height: window.innerHeight }
        const devicePixelRatio = window.devicePixelRatio

        // Smart TV detection
        if (/Smart-?TV|Tizen|webOS|Roku/i.test(userAgent) ||
            (viewport.width >= 1920 && devicePixelRatio === 1)) {
          setPlatform('smartTV')
          setInputMethod('remote')
        }
        // Mobile detection
        else if (/Mobile|Android|iPhone|iPad/i.test(userAgent) ||
                 'ontouchstart' in window) {
          setPlatform('mobile')
          setInputMethod('touch')
        }
        // Desktop detection
        else {
          setPlatform('desktop')
          setInputMethod('mouse')
        }

        // Apply platform-specific optimizations
        applyPlatformOptimizations(platform, inputMethod)
      }, [])

      return { platform, inputMethod }
    }
  `,

  optimizationApplication: {
    smartTV: 'Large buttons, D-pad navigation, TV-safe margins',
    mobile: 'Touch targets, swipe gestures, responsive layout',
    desktop: 'Hover effects, keyboard shortcuts, full feature set'
  }
}
```

---

## **🎯 Implementation Priority for Our Demo**

### **Day 2 Controller Implementation (2-hour sprint)**
```typescript
const controllerImplementationPlan = {
  hour1: {
    webKeyboard: {
      duration: '15 minutes',
      implementation: 'Basic keyboard shortcuts (space, arrows, f)',
      testing: 'Keyboard navigation validation',
      priority: 'Essential for accessibility and Smart TV demo'
    },

    smartTVSimulation: {
      duration: '25 minutes',
      implementation: 'D-pad navigation with focus management',
      testing: 'TV viewport simulation with keyboard',
      priority: 'Critical for FOX Smart TV platform demonstration'
    }
  },

  hour2: {
    mobileTouch: {
      duration: '20 minutes',
      implementation: 'Touch gestures for mobile browsers',
      testing: 'Mobile device emulation',
      priority: 'Important for responsive demonstration'
    },

    refinement: {
      duration: '20 minutes',
      implementation: 'Polish, edge cases, cross-platform testing',
      testing: 'Comprehensive input method validation',
      priority: 'Quality assurance and demo preparation'
    }
  }
}
```

### **Future Platform Implementation (Post-Demo)**
```typescript
const futureImplementation = {
  nativeMobile: {
    timeline: 'Week 2-3 post-demo',
    ios: 'SwiftUI with GameController framework',
    android: 'Jetpack Compose with MotionEvent handling',
    complexity: 'Medium - requires native development setup'
  },

  realSmartTV: {
    timeline: 'Month 2-3 post-demo',
    roku: 'BrightScript with ECP integration',
    tizen: 'Tizen Web API with TVInputDevice',
    webOS: 'webOS TV API with Magic Remote support',
    complexity: 'High - requires platform-specific development'
  },

  gamingConsoles: {
    timeline: 'Future consideration',
    playstation: 'PlayStation SDK required',
    nintendo: 'Nintendo SDK required',
    complexity: 'Very High - expensive licensing and development'
  }
}
```

---

**Alex & Morgan's Controller Implementation Mission:** Create comprehensive controller and remote control support that demonstrates understanding of cross-platform input handling while focusing on practical implementation for our demo timeline. The web-based Smart TV simulation approach provides professional demonstration capability without requiring expensive development licenses or hardware.

This implementation strategy balances technical depth with practical delivery, ensuring our video player demo showcases controller expertise relevant to FOX Corporation's multi-platform streaming requirements.