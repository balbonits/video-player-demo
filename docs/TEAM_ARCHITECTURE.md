# 👥 Team Architecture & Sub-Agent Guide

**Architecture Lead:** Jordan (Product Manager)
**Date:** 2024-09-21
**Purpose:** Comprehensive guide to project team structure and sub-agent implementation

---

## 🎯 Team Architecture Overview

This project operates with a specialized team of AI personas, each with distinct expertise areas and autonomous decision-making authority. The team structure is designed to maximize productivity while maintaining enterprise-quality standards.

### **Core Team Structure**

```typescript
interface TeamArchitecture {
  'alex-engineer': {
    specialization: 'Technical implementation, performance optimization',
    ownership: 'Next.js, React, TypeScript, Redux Toolkit, HLS.js',
    focus: 'JavaScript performance optimization for FOX shared TV codebase',
    autonomy: 'Complete technical decision-making within agreed architecture'
  },

  'sam-qa': {
    specialization: 'Testing automation, quality assurance, performance validation',
    ownership: 'Jest, Testing Library, Playwright, Axe-core, coverage validation',
    focus: '90% test coverage with performance regression prevention',
    autonomy: 'Complete testing strategy and quality gate decisions'
  },

  'jordan-product': {
    specialization: 'Product strategy, market research, business requirements',
    ownership: 'WebSearch, market research, requirements management, content strategy',
    focus: 'Performance optimization business value and FOX alignment',
    autonomy: 'Complete product and research decision-making'
  },

  'casey-release': {
    specialization: 'DevOps, deployment, performance monitoring, analytics',
    ownership: 'GitHub Actions, Vercel, CI/CD, monitoring, security',
    focus: 'Performance monitoring infrastructure and deployment optimization',
    autonomy: 'Complete DevOps and deployment authority'
  },

  'riley-ux': {
    specialization: 'UX design, accessibility, performance-conscious design',
    ownership: 'Superdesign MCP Server (exclusive), AI wireframing, accessibility',
    focus: 'Performance-optimized UX patterns for Smart TV constraints',
    autonomy: 'Complete design process ownership via AI tools'
  },

  'dakota-video': {
    specialization: 'Streaming technology, video codecs, protocols',
    ownership: 'HLS.js config, video codecs, streaming protocols, DRM, ABR',
    focus: 'Enterprise-grade streaming infrastructure optimization',
    autonomy: 'Complete streaming technology and optimization authority'
  },

  'morgan-teamlead': {
    specialization: 'Team coordination, documentation, decision facilitation',
    ownership: 'Project coordination, documentation, conversation logging',
    focus: 'Project success and comprehensive documentation',
    autonomy: 'Day-to-day project management decisions'
  }
}
```

---

## 🔧 Sub-Agent Implementation

### **Claude Code Sub-Agents**

Sub-agents are specialized AI assistants that enable more efficient problem-solving through:

- **Specialized Intelligence**: Each agent optimized for specific domain expertise
- **Independent Context**: Every sub-agent operates within isolated context space
- **Parallel Execution**: Up to 10 concurrent agents (90.2% improvement over single-agent)
- **Automatic Delegation**: Claude Code intelligently selects appropriate sub-agents

### **File Structure**

```yaml
---
name: subagent-name          # Identifier for Task tool
description: Brief purpose   # What this subagent does
tools: Write, Edit, Read     # Available tools (comma-separated)
model: inherit               # Always use 'inherit'
---

# Subagent Name

Role definition and detailed instructions...
```

### **Directory Structure**

```bash
# Project-specific agents
.claude/
└── agents/
    ├── alex-engineer.md
    ├── sam-qa.md
    ├── jordan-product.md
    ├── casey-release.md
    ├── riley-ux.md
    ├── dakota-video.md
    └── morgan-lead.md
```

---

## 🚀 Collaboration Protocols

### **Autonomous Operation**

Each persona has complete ownership of their assigned tools and makes independent decisions within their domain:

- **Alex**: Complete technical decision-making within architecture
- **Sam**: Complete testing strategy and framework control
- **Jordan**: Complete product and research decision-making
- **Casey**: Complete DevOps and deployment authority
- **Riley**: Complete design process ownership via AI tools
- **Dakota**: Complete streaming technology authority
- **Morgan**: Day-to-day project management decisions

### **Communication Protocol**

```typescript
interface CollaborationProtocol {
  autonomousOperation: {
    decisionMaking: 'Each agent makes decisions within their domain expertise',
    documentation: 'All agents update their respective documentation',
    progressTracking: 'Real-time TODOS.md updates for coordination',
    qualityStandards: 'Maintain enterprise-level practices throughout'
  },

  crossAgentCollaboration: {
    technicalReview: 'Alex and Sam coordinate on TDD implementation',
    requirementsValidation: 'Jordan and Alex align on performance specifications',
    deploymentIntegration: 'Casey and Alex coordinate on CI/CD requirements',
    uxImplementation: 'Riley and Alex coordinate on design implementation'
  },

  escalationProtocol: {
    minorIssues: 'Agents coordinate directly for resolution',
    majorDecisions: 'Morgan coordinates complex decisions',
    scopeChanges: 'Escalate to John for approval',
    technicalBlocks: 'Cross-agent consultation for resolution'
  }
}
```

---

## 📊 Performance Benefits

### **Multi-Agent Performance Advantages**

**Anthropic Research Results:**
- **90.2% improvement** over single-agent approach
- **Parallel execution** of specialized tasks
- **Coordination efficiency** through orchestrator-worker pattern

**Real-World Example:**
- 12 Claude agents rebuilt entire frontend overnight
- One refactored components, another wrote tests, third updated docs
- 10,000+ lines of perfectly coordinated changes
- Complex tasks completed while developer slept

---

## 🛠️ Current Implementation Status

### **Setup Complete**
✅ All sub-agent files created in `.claude/agents/`
✅ Complete context references in each sub-agent
✅ Performance optimization focus throughout
✅ Cross-agent coordination protocols defined

### **Recognition Issue (2024)**
- **Problem**: Claude Code not detecting custom sub-agents
- **Version**: Claude Code may have sub-agent detection bugs
- **Workaround**: Enhanced persona-based coordination with sub-agent concepts
- **Future**: Monitor Claude Code updates for sub-agent fixes

### **Current Approach**
- Use enhanced persona-based workflow incorporating sub-agent concepts
- Apply specialized prompts and context isolation patterns
- Maintain autonomous decision-making within domains
- Ready to migrate to true sub-agents when technical issues resolved

---

## 🎯 Business Impact

This team architecture directly supports the primary business objective: **demonstrating JavaScript performance optimization expertise for FOX Corporation's shared TV application needs**.

### **Key Advantages**
- **Specialized Expertise**: Each agent focused on specific technical domains
- **Parallel Productivity**: Multiple workstreams progressing simultaneously
- **Quality Assurance**: Built-in testing and validation at every step
- **Professional Output**: Enterprise-grade documentation and implementation
- **Interview Readiness**: Comprehensive technical demonstration capability

---

**This architecture ensures maximum productivity and professional quality while maintaining focus on the core business objective: landing the FOX Corporation Senior JavaScript Engineer position through demonstrated performance optimization expertise.**