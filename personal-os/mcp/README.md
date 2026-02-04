# @rykee/personal-os-mcp

MCP (Model Context Protocol) server for PersonalOS - AI-powered task management with goal-driven prioritization.

## Installation

```bash
npm install -g @rykee/personal-os-mcp
```

Or run directly with npx:

```bash
npx @rykee/personal-os-mcp
```

## Usage

### With Claude Desktop / Cowork

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "personal-os": {
      "command": "npx",
      "args": ["@rykee/personal-os-mcp"],
      "env": {
        "WORKSPACE": "/path/to/your/workspace"
      }
    }
  }
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `WORKSPACE` | Base workspace directory | Current directory |
| `TASKS_DIR` | Directory for task files | `${WORKSPACE}/Tasks` |
| `KNOWLEDGE_DIR` | Directory for reference docs | `${WORKSPACE}/Knowledge` |
| `BACKLOG_FILE` | Path to backlog file | `${WORKSPACE}/BACKLOG.md` |
| `GOALS_FILE` | Path to goals file | `${WORKSPACE}/GOALS.md` |

## Available Tools

### Task Management
- `list_tasks` - List tasks with filters (category, priority, status)
- `create_task` - Create a new task with YAML frontmatter
- `update_task_status` - Update task status (n/s/b/d/r)
- `update_task_priority` - Update task priority (P0-P3)
- `get_task_summary` - Get summary statistics
- `prune_completed_tasks` - Archive old completed tasks

### Backlog Processing
- `read_backlog` - Read backlog contents
- `process_backlog_with_dedup` - Process with duplicate detection
- `clear_backlog` - Clear processed items

### System
- `get_system_status` - Comprehensive system status
- `check_priority_limits` - Verify P0/P1 limits
- `read_goals` - Read GOALS.md for prioritization

## Priority System

| Priority | Meaning | Limit |
|----------|---------|-------|
| P0 | Must do today | Max 3 |
| P1 | This week | Max 7 |
| P2 | Scheduled | ~10 |
| P3 | Someday | Unlimited |

## Attribution

Based on [PersonalOS](https://github.com/amanaiproduct/personal-os) by Amanai Product.

## License

CC-BY-NC-SA-4.0
