# PersonalOS Plugin for Claude Cowork

An AI-powered task management plugin that brings goal-driven prioritization to Claude Cowork. Capture unstructured thoughts in a backlog, process them with smart deduplication, and get automatically prioritized tasks aligned with your personal goals.

## Features

- **Goal-Driven Prioritization** - Tasks are automatically prioritized based on your GOALS.md
- **Smart Deduplication** - Detects similar tasks before creating duplicates
- **Natural Language Processing** - Dump thoughts into BACKLOG.md; AI organizes them
- **Priority Limits** - Enforces P0 (max 3) and P1 (max 7) to prevent overwhelm
- **Self-Contained** - Includes MCP server, no external dependencies required

## Installation

### From GitHub (recommended)

```bash
claude plugins add https://github.com/YOUR_USERNAME/personal-os-plugin
```

### From Local Directory

```bash
claude plugins add /path/to/personal-os-plugin
```

### Requirements

- Node.js 18+ (for the MCP server)

The MCP server runs automatically via `npx` - no manual installation needed.

## Quick Start

1. Install the plugin (see above)

2. Initialize your workspace:
   ```
   /personal-os:start
   ```

3. Define your goals in `GOALS.md`

4. Dump tasks into `BACKLOG.md` and process:
   ```
   /personal-os:process-backlog
   ```

## Commands

| Command | Description |
|---------|-------------|
| `/personal-os:start` | Initialize the system and set up workspace |
| `/personal-os:process-backlog` | Turn backlog items into structured tasks |
| `/personal-os:daily-review` | Review and plan today's priorities |
| `/personal-os:check-priorities` | Verify priority distribution and limits |
| `/personal-os:add-task` | Quickly add a new task |

## Priority System

| Priority | Meaning | Limit |
|----------|---------|-------|
| **P0** | Must do today | Max 3 |
| **P1** | Important this week | Max 7 |
| **P2** | Scheduled / has a date | ~10 |
| **P3** | Someday / maybe | Unlimited |

## Directory Structure

```
workspace/
├── Tasks/              # Individual task files (.md with YAML frontmatter)
├── Knowledge/          # Reference documents
├── BACKLOG.md         # Unstructured inbox - dump thoughts here
├── GOALS.md           # Your personal goals (drives prioritization)
└── AGENTS.md          # AI behavior configuration
```

## Task Format

Tasks are stored as markdown files with YAML frontmatter:

```markdown
---
title: "Ship the new feature"
category: technical
priority: P1
status: n
estimated_time: 2h
created: 2025-02-03
---

Optional detailed notes go here...
```

### Categories
`outreach` | `technical` | `research` | `writing` | `admin` | `marketing` | `other`

### Status Codes
`n` (not started) | `s` (started) | `b` (blocked) | `d` (done) | `r` (recurring)

## Goals File

Your `GOALS.md` drives intelligent prioritization:

```markdown
# Goals

## Vision
[Your long-term vision]

## Core Areas
1. **Career** - Ship products, grow skills
2. **Health** - Exercise, sleep, nutrition
3. **Relationships** - Family, friends, networking

## Current Focus
[What you're prioritizing right now]

## Not Now
[Explicitly deprioritized items]
```

## Workflow

1. **Capture** - Dump thoughts into `BACKLOG.md` without structure
2. **Process** - Run `/personal-os:process-backlog` to organize
3. **Review** - Run `/personal-os:daily-review` each morning
4. **Execute** - Work through P0 tasks
5. **Maintain** - Run `/personal-os:check-priorities` to stay balanced

## Customization

### Adjust MCP Server Settings
Edit `.mcp.json` to change paths or add connectors.

### Modify AI Behavior
Edit `AGENTS.md` to customize how Claude handles tasks.

### Add Integrations
See `CONNECTORS.md` for available integrations (calendar, notes, etc.).

## Based On

This plugin is based on [PersonalOS](https://github.com/amanaiproduct/personal-os) by Amanai Product.

## License

CC BY-NC-SA 4.0 - Non-commercial use with attribution permitted.
