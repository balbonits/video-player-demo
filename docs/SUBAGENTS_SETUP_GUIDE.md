# Claude Code Subagents Setup Guide

## Quick Start

Subagents extend Claude Code with specialized personas for autonomous task execution.

**Key Points:**
- Located in `.claude/agents/` directory
- Use YAML frontmatter configuration
- Named as `subagent` (one word, not "sub-agent")
- Inherit Claude's base model with `model: inherit`

## Architecture

```
┌─────────────────────────────────────────┐
│           Claude Code (You)              │
│         Primary Interface Layer          │
└────────────────┬────────────────────────┘
                 │ Invokes via Task tool
┌────────────────▼────────────────────────┐
│            Subagent Layer               │
│   ┌──────────────────────────────────┐  │
│   │    .claude/agents/*.md files     │  │
│   │  ┌────────┐  ┌────────────────┐ │  │
│   │  │  YAML  │  │   Instructions  │ │  │
│   │  │ Front- │  │   & Persona     │ │  │
│   │  │ matter │  │   Definition    │ │  │
│   │  └────────┘  └────────────────────┘ │
│   └──────────────────────────────────┘  │
└──────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│           Tool Access Layer             │
│  Write, Edit, Read, Bash, Grep, etc.    │
└──────────────────────────────────────────┘
```

## File Structure

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

## Example Subagent

```markdown
---
name: alex-engineer
description: Senior Software Engineer specializing in React, TypeScript, and performance optimization
tools: Write, Edit, Read, MultiEdit, Bash, Glob, Grep, TodoWrite
model: inherit
---

# Alex - Senior Software Engineer

You are Alex, a Senior Software Engineer with expertise in JavaScript performance optimization...

## Core Responsibilities
- Implement technical solutions
- Optimize performance
- Maintain code quality

## Technical Stack
- React 18, Next.js 14
- TypeScript (strict mode)
- Performance optimization
```

## Usage in Claude Code

```typescript
// Invoke subagent using Task tool
Task({
  subagent_type: "alex-engineer",
  description: "Implement video player",
  prompt: "Create an HLS video player component with Smart TV optimizations"
})
```

## Best Practices

1. **Naming Convention**: Use lowercase with hyphens (`alex-engineer`, not `Alex_Engineer`)
2. **Tool Selection**: Only include tools the subagent needs
3. **Clear Personas**: Define specific expertise and responsibilities
4. **Focused Scope**: Each subagent should have a clear, bounded role
5. **Documentation**: Include examples and technical context in instructions

## Common Patterns

### Specialized Engineer
```yaml
name: dakota-video
description: Video streaming engineer specializing in codecs and protocols
tools: Write, Edit, Read, Bash, Grep
model: inherit
```

### QA/Testing Expert
```yaml
name: sam-qa
description: QA Engineer focused on testing and accessibility
tools: Write, Edit, Read, Bash, TodoWrite
model: inherit
```

### Product Manager
```yaml
name: jordan-product
description: Product Manager for requirements and market research
tools: Write, Edit, Read, WebSearch, WebFetch
model: inherit
```

## References

- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code)
- [Agent Tool Documentation](https://docs.claude.com/en/docs/claude-code/tools/agent)
- [Claude Code GitHub Issues](https://github.com/anthropics/claude-code/issues)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Subagent not found | Check file exists in `.claude/agents/` with `.md` extension |
| Tools not working | Verify tools are listed in YAML frontmatter |
| Model errors | Ensure `model: inherit` is set |
| Name conflicts | Use unique, descriptive names |

## Git Worktrees for Parallel Development

Use git worktrees to run multiple Claude Code sessions simultaneously:

```
┌─────────────────────────────────────────┐
│          Main Repository                 │
│         (main branch)                    │
└────────────┬────────────────────────────┘
             │
    ┌────────┼────────┬─────────┐
    ▼        ▼        ▼         ▼
┌────────┐ ┌──────┐ ┌──────┐ ┌──────┐
│feature1│ │ test │ │ docs │ │ ui   │
│worktree│ │ tree │ │ tree │ │ tree │
└────────┘ └──────┘ └──────┘ └──────┘
    │        │        │         │
    ▼        ▼        ▼         ▼
[Session1] [Session2] [Session3] [Session4]
```

### Setup Commands

```bash
# Create worktree for a feature branch
git worktree add ../project-testing testing
git worktree add ../project-storybook storybook

# List all worktrees
git worktree list

# Each worktree can have its own Claude Code session
cd ../project-testing
claude code  # Session 1: Testing work

cd ../project-storybook
claude code  # Session 2: UI work
```

### Benefits

1. **Parallel Execution**: Multiple subagents working simultaneously
2. **Branch Isolation**: Each worktree on separate branch
3. **No Context Switching**: Dedicated sessions per task
4. **Clean Commits**: Focused changes per branch

### Example Workflow

```bash
# Main branch: Alex works on core features
claude code  # alex-engineer on main

# Testing worktree: Sam runs tests
cd ../video-player-testing
claude code  # sam-qa on testing branch

# Storybook worktree: Riley builds UI
cd ../video-player-storybook
claude code  # riley-ux on storybook branch
```

## Quick Setup Script

```bash
# Create agents directory
mkdir -p .claude/agents

# Create a new subagent
cat > .claude/agents/my-subagent.md << 'EOF'
---
name: my-subagent
description: Description here
tools: Write, Edit, Read
model: inherit
---

# My Subagent

Instructions here...
EOF

# Set up worktrees for parallel work
git worktree add ../project-feature feature-branch
git worktree add ../project-testing testing-branch
```

---

*For complex multi-persona projects, see [SUB-AGENT_PERSONAS.md](./SUB-AGENT_PERSONAS.md)*