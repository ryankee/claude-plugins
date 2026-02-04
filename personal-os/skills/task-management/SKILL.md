# Task Management Skill

## Overview

This skill enables intelligent task management using the PersonalOS framework. Tasks are stored as individual markdown files with YAML frontmatter in the `Tasks/` directory. The system emphasizes metadata-first task creation with smart deduplication.

## Directory Structure

```
workspace/
├── Tasks/              # Individual task files (.md)
├── Knowledge/          # Reference documents
├── BACKLOG.md         # Unstructured inbox
├── GOALS.md           # Personal goals for prioritization
└── AGENTS.md          # AI instructions
```

## Task File Format

Each task is a markdown file with YAML frontmatter:

```markdown
---
title: "Task title here"
category: technical
priority: P1
status: n
estimated_time: 30m
created: 2025-02-03
---

# Task Content

Detailed task description goes here...
```

## Categories

- **outreach** - Communication, meetings, networking
- **technical** - Development, debugging, infrastructure
- **research** - Investigation, analysis, learning
- **writing** - Documentation, content creation
- **admin** - Administrative tasks, organization
- **marketing** - Promotion, campaigns, branding
- **other** - Miscellaneous tasks

## Priority Levels

| Priority | Description | Recommended Limit |
|----------|-------------|-------------------|
| **P0** | Critical - do today | Max 3 tasks |
| **P1** | Important - this week | Max 7 tasks |
| **P2** | Scheduled - has a date | ~10 tasks |
| **P3** | Someday/maybe | Unlimited |

## Status Codes

- `n` - Not started
- `s` - Started/in progress
- `b` - Blocked
- `d` - Done
- `r` - Recurring

## Available MCP Tools

When the MCP server is connected, use these tools:

| Tool | Purpose |
|------|---------|
| `list_tasks` | Get all tasks with optional filtering |
| `create_task` | Create new task with metadata |
| `update_task_status` | Change task status |
| `get_task_summary` | Overview by priority/category |
| `check_priority_limits` | Verify P0/P1 limits |
| `prune_completed_tasks` | Archive done tasks |

## How to Interact

**When user asks "what's on my plate" / "my tasks":**
1. Use `list_tasks` to get current tasks
2. Summarize by priority level
3. Highlight P0 (today) and any blocked items

**When user says "add a task" / "I need to...":**
1. Extract task details from conversation
2. Guess appropriate category and priority
3. Create task with `create_task` tool
4. Default to metadata-only (no content generation unless requested)

**When user says "done with X" / "finished X":**
1. Find matching task
2. Use `update_task_status` to mark as `d` (done)
3. Confirm completion

**When user asks about priorities:**
1. Use `check_priority_limits` to verify counts
2. Alert if P0 > 3 or P1 > 7
3. Suggest reprioritization if needed

## Default Behavior

**Always create tasks with metadata first:**
- Title, category, priority, status, estimated time
- Content generation only when explicitly requested
- This keeps tasks lightweight and actionable

**Before creating any task:**
- Check for duplicates using similarity detection
- Flag ambiguous items for clarification
- Ask user confirmation before creation

## Writing Style Preferences

When generating task content:
- Keep language personal and conversational
- Avoid clichéd phrases like "the key insight is" or "it's not about X but Y"
- No em dashes or excessive formatting
- Be specific and action-oriented
