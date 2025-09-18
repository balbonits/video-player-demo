# 🎬 Video Player Demo Project - Planning Q&A

## Instructions
Please answer all questions below. Your responses will guide the technical implementation, feature prioritization, and career strategy for this project.

---

## 📋 **1. PROJECT SCOPE & STRATEGY**

### **Q1.1:** What's your preferred timeline for this project?
- [ ] **Fast track (2-3 days)** - Minimal viable demo for immediate interviews
- [ ] **Standard (3-5 days)** - Solid demo with 2-3 polished features
- [ ] **Extended (5-7 days)** - Comprehensive demo with all planned features
- [ ] **Other:** _______________

**Your answer:**
- [X] **Extended (5-7 days)** - Comprehensive demo with all planned features

### **Q1.2:** Do you have any upcoming FOX interviews scheduled or anticipated?
**Your answer:**
not yet, but I'm applying to other job posts. I really want to land this job, so we're trying to impress the hiring manager as much as possible with this "show of ability" kind of project.

### **Q1.3:** What's more important for your career goals?
- [ ] **Rapid deployment** - Get something live ASAP for applications
- [ ] **Technical depth** - Showcase advanced engineering skills
- [ ] **Accessibility focus** - Highlight WCAG expertise from ADP/TBN experience
- [ ] **Balanced approach** - Mix of all above

**Your answer:**
- [X] **Balanced approach** - Mix of all above

### **Q1.4:** Risk tolerance for experimental features (Web Speech API, Smart TV nav)?
- [ ] **Conservative** - Stick to proven, reliable features only
- [ ] **Moderate** - Include experimental features with fallbacks
- [ ] **Aggressive** - Showcase cutting-edge features prominently

**Your answer:**
- [X] **Conservative** - Stick to proven, reliable features only
---

## 🛠️ **2. TECHNICAL ARCHITECTURE**

### **Q2.1:** Browser support priorities? (Web Speech API doesn't work in Edge)
- [ ] **Chrome-first** - Optimize for Chrome, mention browser requirements
- [ ] **Progressive enhancement** - Core features work everywhere, advanced features in supported browsers
- [ ] **Broad compatibility** - Avoid Web Speech API, use more compatible alternatives

**Your answer:**
- [X] **Broad compatibility** - Avoid Web Speech API, use more compatible alternatives.
- more notes: we'll focus on showing a cross-platform video player, which would be web-based (iirc, PC/Mac, XBOX, and Chromecast can have a shared video player codebase being web-based.), but also adding separate ones under this project for native OTT/TV platforms. we'll target Tizen, Vizio, & Roku, with Roku have as much "attention" as possible.

### **Q2.2:** TypeScript strictness preference?
- [ ] **Strict mode** - Full type safety, longer development time
- [ ] **Moderate** - Important types, practical compromises
- [ ] **Minimal** - Basic types, focus on functionality

**Your answer:**
- [X] **Strict mode** - Full type safety, longer development time
- more notes: TDD approach, so type safety will be a driving point due to how we need to be specc'ed out of our minds here.

### **Q2.3:** Testing strategy given timeline constraints?
- [ ] **Comprehensive** - Unit, integration, e2e, accessibility tests
- [ ] **Focused** - Key functionality and accessibility tests only
- [ ] **Manual** - Manual testing, focus on implementation speed

**Your answer:**
- [X] **Comprehensive** - Unit, integration, e2e, accessibility tests

### **Q2.4:** Performance vs. feature richness trade-off?
- [ ] **Performance first** - Lightweight, fast-loading player
- [ ] **Feature rich** - More impressive demo features, acceptable loading times
- [ ] **Balanced** - Good performance with key features

**Your answer:**
- [X] **Performance first** - Lightweight, fast-loading player
- more notes: focus on cross-platforming & web accessibility.

---

## 🎯 **3. FEATURE PRIORITIZATION**

### **Q3.1:** Core feature priority ranking (1=highest, 4=lowest):
- [ ] **HLS video streaming with adaptive quality** - Rank: ___
- [ ] **Live transcription (Web Speech API)** - Rank: ___
- [ ] **Smart TV remote navigation** - Rank: ___
- [ ] **Caption customization & WCAG compliance** - Rank: ___

**Your answer:**
- [1] **HLS video streaming with adaptive quality** - Rank: ___
- [4] **Live transcription (Web Speech API)** - Rank: ___
- [2] **Smart TV remote navigation** - Rank: ___
- [3] **Caption customization & WCAG compliance** - Rank: ___

### **Q3.2:** Smart TV navigation implementation approach?
- [ ] **Full spatial navigation** - Arrow key navigation between all controls
- [ ] **Focus management** - Tab/Shift-Tab with enhanced focus indicators
- [ ] **Hybrid approach** - Both arrow keys and tab navigation
- [ ] **Skip for now** - Focus on other features first

**Your answer:**
- [X] **Hybrid approach** - Both arrow keys and tab navigation

### **Q3.3:** Web Speech API strategy given browser limitations?
- [ ] **Chrome-only showcase** - Mention browser requirements prominently
- [ ] **Graceful degradation** - Show feature in supported browsers, hide elsewhere
- [ ] **Alternative implementation** - Use different transcription approach
- [ ] **Mock/simulate** - Fake transcription for demo purposes

**Your answer:**
- [X] **Graceful degradation** - Show feature in supported browsers, hide elsewhere

### **Q3.4:** Additional features you'd like to see?
**Your answer:**
- seek bar thumbnails
- logo branding
- social media sharing
- timestamp linking
- light/dark ("theater") mode
- PiP mode
- analytics integration (use Google Analytics & Web Perf metrics)

all of them are "nice-to-haves", not urgent items.
---

## 📺 **4. CONTENT & TESTING**

### **Q4.1:** Video content preference?
- [ ] **Planete Interdite HLS** - Use the mentioned stream with captions
- [ ] **Multiple test sources** - Various streams for different scenarios
- [ ] **Local files included** - Big Buck Bunny or similar for offline development
- [ ] **Mix of all** - Comprehensive content testing

**Your answer:**
- [X] **Mix of all** - Comprehensive content testing
- more notes: we'll create different "pages", or sections, that feature different video player & content. look for public domain/creative commons content & streams we could use. free & legal are the points to remember.

### **Q4.2:** Device testing priorities?
- [ ] **Desktop browser focus** - Chrome, Safari, Firefox on desktop
- [ ] **Mobile responsive** - Ensure mobile browser compatibility
- [ ] **Smart TV simulation** - Test with TV-like interfaces
- [ ] **All devices** - Comprehensive cross-device testing

**Your answer:**
- [X] **All devices** - Comprehensive cross-device testing
- more notes: cross-platform is most important for the project to demonstrate. everthing else would be second, at most.

### **Q4.3:** Deployment preference?
- [ ] **Vercel** - Easy React deployment
- [ ] **Netlify** - Alternative deployment platform
- [ ] **GitHub Pages** - Simple, free hosting
- [ ] **Your preference:** _______________

**Your answer:**
- [X] **Vercel** - Easy React deployment
- more notes: I've been told that Next.js is the most important to feature, and what the hiring manager is looking as a specialist for. 
---

## 💼 **5. CAREER STRATEGY**

### **Q5.1:** FOX interview demo structure preference?
- [ ] **Technical deep-dive** - Show code, explain architecture decisions
- [ ] **User-focused demo** - Emphasize user experience and accessibility
- [ ] **Story-driven** - Connect each feature to your FOX experience
- [ ] **Hybrid presentation** - Mix of technical and user perspectives

**Your answer:**
- [X] **Hybrid presentation** - Mix of technical and user perspectives

### **Q5.2:** Repository presentation style?
- [ ] **Professional corporate** - Clean, enterprise-style documentation
- [ ] **Open source project** - Comprehensive README, contribution guidelines
- [ ] **Portfolio showcase** - Focused on demonstrating your skills
- [ ] **Technical experiment** - Research project with findings

**Your answer:**
- [X] **Professional corporate** - Clean, enterprise-style documentation

### **Q5.3:** Code documentation level?
- [ ] **Comprehensive** - Full JSDoc, architectural decision records
- [ ] **Practical** - Key functions documented, clear README
- [ ] **Minimal** - Clean code with basic comments
- [ ] **Your preference:** _______________

**Your answer:**
- [X] **Comprehensive** - Full JSDoc, architectural decision records

### **Q5.4:** What specific aspects of your FOX experience should this project highlight?
**Your answer:**
- different platforms represented/implemented
- Next.js mastery
- TDD tests & specs
- full documentation

---


## 🎨 **6. UX & DESIGN**

### **Q6.1:** Design approach?
- [ ] **FOX-inspired branding** - Colors/styling reminiscent of FOX properties
- [ ] **Modern minimalist** - Clean, contemporary video player design
- [ ] **Accessibility-first** - High contrast, clear focus states, readable fonts
- [ ] **Your preference:** _______________

**Your answer:**
- [X] **Accessibility-first** - High contrast, clear focus states, readable fonts
- more notes: we'll add a toggle, or settings item, for coloring/branding

### **Q6.2:** Caption/transcription display preference?
- [ ] **Overlay on video** - Traditional caption positioning
- [ ] **Side panel** - Separate transcript area alongside video
- [ ] **Both options** - User can choose display mode
- [ ] **Your preference:** _______________

**Your answer:**
- [X] **Both options** - User can choose display mode

---

## 🚀 **7. IMPLEMENTATION APPROACH**

### **Q7.1:** Development methodology preference?
- [ ] **Feature-branch workflow** - Separate branches for each feature
- [ ] **Direct to main** - Rapid commits to main branch
- [ ] **MVP then iterate** - Get basic player working, then add features
- [ ] **Your preference:** _______________

**Your answer:**
- [X] **Feature-branch workflow** - Separate branches for each feature

### **Q7.2:** Team persona coordination preference?
- [ ] **All personas involved** - Each decision involves relevant team members
- [ ] **Lead-coordinated** - Morgan (Team Lead) makes most decisions with input
- [ ] **Streamlined** - Fewer personas for faster development
- [ ] **Your preference:** _______________

**Your answer:**
- [X] **Lead-coordinated** - Morgan (Team Lead) makes most decisions with input
---

## 📝 **ADDITIONAL QUESTIONS**

### **Q8.1:** Any specific concerns or constraints I should know about?
**Your answer:**
- nothing yet.

### **Q8.2:** What would make this project a "home run" for your career goals?
**Your answer:**
- i get the job
- i get to feature this on my portfolio site: www.jdilig.me (under "/projects")

### **Q8.3:** Any other requirements, preferences, or considerations?
**Your answer:**
- in-code comments - aim for readability, avoid redundant comments.
- DRY - "don't repeat yourself". componentize/modularize repeating logic & functionality. think like you're building a video player framework and/or library.
- Testable - Test-first, test-often, and test-fast. we'll skip visual/HTML reporting, and aim for automation for results.
---

## 🎯 **TARGET JOB POSTING ANALYSIS**

### **FOX Corporation - Senior Web/JavaScript Engineer**
**Team:** "webapps" engineering team
**Focus:** FOX's News, Sports and Entertainment streaming video applications
**Platforms:** Xbox, Samsung, LG, Comcast, and Vizio Smart TV platforms

### **🔑 Key Requirements That Our Demo Should Address:**

#### **Core Technical Skills:**
- ✅ **JavaScript (ES6+) & React** - Our primary tech stack
- ✅ **Performance optimization for low-end devices** - Smart TV focus
- ✅ **Media Playback with HLS/DASH** - Exactly what we're building
- ✅ **Responsive CSS across devices** - Multi-platform compatibility

#### **Architecture & Process:**
- ✅ **High-performance web applications** - Optimize for Smart TV constraints
- ✅ **Code quality through reviews, testing** - Comprehensive testing strategy
- ✅ **REST APIs and client-server architecture** - HLS streaming integration
- ✅ **SDLC and build processes** - Professional development workflow

#### **Leadership & Collaboration:**
- ✅ **Lead critical initiatives** - Demonstrate project leadership
- ✅ **Work with Product/QA stakeholders** - Our persona-based approach
- ✅ **POCs on new technologies** - Web Speech API exploration
- ✅ **SAFe/Agile environment** - Professional project management

#### **🌟 "Nice to Have" Differentiators:**
- ✅ **Smart TV platform experience** - Perfect match for our Smart TV navigation focus
- ✅ **Performance optimization** - Critical for low-end devices
- ✅ **Streaming concepts expertise** - HLS implementation demonstrates this

---

## 📊 **RESEARCH FINDINGS TO CONSIDER**

### **FOX Technology Context (2024):**
- FOX One launched August 2024 at $19.99/month
- Uses cutting-edge technology from Tubi Media Group
- Supports web, mobile, and connected TV platforms
- Serves 65+ million households outside cable bundle

### **Web Speech API Limitations:**
- Works in Chrome and Safari
- **Does NOT work in Microsoft Edge** (despite being Chromium-based)
- Best for real-time microphone input, not video file transcription
- Requires user permission and HTTPS

### **WCAG 2.1 AA Requirements:**
- Keyboard navigation for all controls
- Visible focus indicators
- Caption support with customization
- Screen reader compatibility
- Sufficient color contrast

### **🎯 Strategic Implications for Our Demo:**

1. **Smart TV Performance** should be the #1 priority - this directly matches the job requirements
2. **HLS streaming expertise** is a perfect technical match for their media playback needs
3. **JW Player Context:** FOX uses JW Player (built on HLS) for web video - our HLS.js demo shows understanding of their stack
4. **Low-end device optimization** should be highlighted throughout
5. **Professional development workflow** demonstrates SDLC experience
6. **Cross-platform compatibility** (Xbox, Samsung, LG, etc.) validates our responsive approach

### **FOX Technology Stack Context (John's Insider Knowledge):**
- **Current Web Player:** FOX uses JW Player for web video streaming
- **JW Player Foundation:** Built on top of HLS streaming protocol
- **Our Demo Relevance:** HLS.js implementation shows deep understanding of FOX's video streaming architecture
- **Technical Alignment:** Our HLS expertise directly relates to FOX's current technology choices

---

---

## **🤔 Final Team Questions Before Day 2 Implementation**

### **💰 Platform SDK Cost Decisions (Morgan - Team Lead)**
**URGENT:** Which paid platforms should we invest in for the demo?

#### **💰 PAID SDK/LICENSE REQUIRED:**
- **Apple iOS Development:** $99/year Apple Developer Account (for App Store deployment)
- **Android Play Store:** $25 one-time Google Play Developer Account
- **PlayStation Development:** $1000s+ (Dev kit + licensing, not practical for demo)
- **Nintendo Switch Development:** $1000s+ (Dev kit + licensing, not practical for demo)
- **Suitest (Smart TV Testing):** $200+/month professional OTT testing platform

#### **✅ FREE DEVELOPMENT OPTIONS:**
- **Roku:** Free developer account, free SDK, free device testing
- **Samsung Tizen:** Free developer account, free Tizen Studio
- **LG webOS:** Free developer account, free webOS TV SDK
- **Web Development:** Completely free (our primary focus)
- **Android Development:** Free (command-line tools, we can avoid Play Store)
- **iOS PWA:** Free (web-based, no App Store needed)

**Question for John:** Should we invest $99 for iOS development or stick with free PWA approach for mobile demo?

**Answer:** free PWA approach, for now. web & PWA will be our MVP (web/PWA) & v1 (free OTT platforms). v2 will include the paid platforms.
---

### **🎯 Feature Prioritization (Jordan - Product)**
From the comprehensive feature matrix, which specific features would you like us to focus on for Day 2?

**Top candidates for 2-hour implementation:**
- **Must Have:** HLS streaming, basic controls, Smart TV D-pad navigation, accessibility
- **Should Consider:** Caption customization, Picture-in-Picture, performance monitoring
- **Nice to Have:** Seek thumbnails, social sharing, advanced analytics

**Question:** Any specific features from the glossary you want prioritized or definitely want to see?

**Answer:** "Must Haves" will be our focus & only work for Day 2. We'll have to worry about actually running the damn thing, so we might not have time for the rest in one day.
---

### **🧪 Testing Scope (Sam - QA)**
How comprehensive should our testing be for the initial demo?

**Testing Options:**
- **Minimal:** Basic functionality testing, focus on working demo
- **Standard:** 90% coverage with cross-browser validation (our current plan)
- **Comprehensive:** Add real device testing, paid testing services

**Question:** Should we invest in BrowserStack or Suitest for real device testing, or is simulation sufficient for the demo?

**Answer:**: simulation is sufficient for now. important part is writing & defining tests & specs, and being super comprehensive & robust in coverage. if they break, they break. comment them out if they require actual device testing to confirm, but write them in advance.
---

### **🚀 Deployment Strategy (Casey - Release)**
What's your preference for production deployment and domain?

**Deployment Options:**
- **Vercel Free:** video-player-demo.vercel.app (free, excellent for demo)
- **Custom Domain:** Purchase domain like johndilig-video-demo.com (~$15/year)
- **Subdomain:** video-demo.jdilig.me (if you control jdilig.me DNS)

**Question:** Should we set up a custom domain for professional presentation, or is Vercel subdomain sufficient?
**Answer:** I have a domain (jdilig.me) for my portfolio/personal site, we'll set up a subdomain for this project under it.
---

### **🎨 Design Polish Level (Riley - UX)**
How polished should the visual design be for the demo?

**Design Options:**
- **Functional:** Clean, professional wireframes converted to working UI
- **Polished:** Custom design system with animations and micro-interactions
- **Premium:** Advanced visual effects, custom illustrations, branded experience

**Question:** Should we focus on functionality or invest time in visual polish for the FOX presentation?
**Answer:** MVP - functional, v1 - polished + branded experience, v2 will have the rest.
---

### **🏗️ Technical Architecture (Alex - Engineer)**
Any specific technical patterns or approaches you want emphasized?

**Architecture Questions:**
- **Redux vs Zustand:** Redux Toolkit (enterprise) or Zustand (simpler) for state management?
- **Styling Approach:** Tailwind CSS (utility) or CSS Modules (traditional) or Styled Components?
- **Component Library:** Headless UI, Radix, or custom components from scratch?
- **Testing Philosophy:** TDD (test first) or development-driven testing?

**Question:** Any strong preferences for technical implementation approaches or libraries?
**Answer:** 
State Management: Redux (+ Context API, if possible or in improves performance & efficiency. ignore if it doesn't)
Styling: CSS Modules
Component Library: custom components
Testing Philosophy: TDD (+ SDD/spec-driven)
---

### **📊 Analytics & Metrics (All Personas)**
What metrics are most important for demonstrating success?

**Metric Options:**
- **Technical:** Performance metrics, Core Web Vitals, accessibility compliance
- **User Experience:** Engagement rates, feature usage, user journey completion
- **Business:** Portfolio traffic, GitHub engagement, interview conversions
- **Career Impact:** FOX interview success, job offer tracking

**Question:** Which metrics should we prioritize for tracking and reporting?
**Answer:** for the job, "Technical". everything else would be secondary, or even when only I land the job.
---

### **⏱️ Timeline Flexibility (Morgan - Team Lead)**
How flexible is the 5-7 day timeline?

**Timeline Questions:**
- **Day 2 Sprint:** Is the 2-hour implementation realistic, or should we plan for 4-6 hours?
- **Feature Scope:** Should we focus on perfecting fewer features or demonstrating more features?
- **Quality vs Speed:** Prefer working demo quickly or polished demo with more time?
- **Platform Coverage:** All 6 platforms or focus on web + Smart TV simulation?

**Question:** What's more important - speed to demo or comprehensive feature coverage?
**Answer:** tbh, we should write everything now, that's not actual coding (except for the wireframing & its generator/system).
- scope - core components on day 2 only, we need the thing to play a video and/or stream, then we worry about the features next.
- platform coverage - defined & ticketed today, even if it's a "future feature" or "tech debt". we're only doing web-based first (MVP). day 2 will be just using the browser. I need to find my Chromecast & XBOX devices, too.
- day 2 is rapid development and get the player running first, day 3 would be the "meat & potatoes" of our video player "stew". 
---

**Please answer any questions above that will help guide our Day 2 implementation approach!**