# PersonalOS Connectors

This plugin connects to the PersonalOS MCP server which provides task management and deduplication capabilities.

## Built-in MCP Server

The plugin includes its own TypeScript MCP server (`mcp/src/index.ts`) that provides:

### Task Management Tools
| Tool | Description |
|------|-------------|
| `list_tasks` | Get all tasks with filtering by priority, category, or status |
| `create_task` | Create a new task with YAML metadata |
| `update_task_status` | Change task status (not started, started, blocked, done, recurring) |
| `get_task_summary` | Overview of tasks by priority and category |
| `check_priority_limits` | Verify P0/P1 limits aren't exceeded |
| `prune_completed_tasks` | Archive completed tasks |

### Backlog Processing Tools
| Tool | Description |
|------|-------------|
| `read_backlog` | Read and parse backlog contents |
| `process_backlog_with_dedup` | Process with duplicate detection |
| `clear_backlog` | Remove processed items from backlog |

### System Tools
| Tool | Description |
|------|-------------|
| `get_system_status` | Overall system health and statistics |

## Optional External Connectors

PersonalOS can be extended with additional MCP servers for richer functionality. Add these to `.mcp.json`:

### Calendar Integration
Sync tasks with your calendar:
```json
{
  "google-calendar": {
    "command": "npx",
    "args": ["@anthropic/mcp-server-google-calendar"]
  }
}
```

### Note-Taking Apps
Import tasks from notes:
```json
{
  "notion": {
    "command": "npx",
    "args": ["@anthropic/mcp-server-notion"]
  }
}
```

### Meeting Notes (Granola)
The `core/integrations/` directory includes Granola integration for syncing meeting notes and extracting action items.

## Environment Variables

The MCP server uses these environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `WORKSPACE` | Base workspace directory | Current directory |
| `TASKS_DIR` | Directory for task files | `${WORKSPACE}/Tasks` |
| `KNOWLEDGE_DIR` | Directory for reference docs | `${WORKSPACE}/Knowledge` |
| `BACKLOG_FILE` | Path to backlog file | `${WORKSPACE}/BACKLOG.md` |
| `GOALS_FILE` | Path to goals file | `${WORKSPACE}/GOALS.md` |

## Customizing Connections

Edit `.mcp.json` to:
1. Change paths to match your setup
2. Add new MCP servers for additional tools
3. Modify environment variables

### Local Development (using tsx)
```json
{
  "mcpServers": {
    "personal-os": {
      "command": "npx",
      "args": ["tsx", "${PLUGIN_ROOT}/mcp/src/index.ts"],
      "env": {
        "WORKSPACE": "${WORKSPACE}"
      }
    }
  }
}
```

### Published npm Package
```json
{
  "mcpServers": {
    "personal-os": {
      "command": "npx",
      "args": ["@rykee/personal-os-mcp"],
      "env": {
        "WORKSPACE": "${WORKSPACE}"
      }
    }
  }
}
```

### With Additional Connectors
```json
{
  "mcpServers": {
    "personal-os": {
      "command": "npx",
      "args": ["@rykee/personal-os-mcp"],
      "env": {
        "WORKSPACE": "${WORKSPACE}"
      }
    },
    "calendar": {
      "command": "npx",
      "args": ["@anthropic/mcp-server-google-calendar"]
    }
  }
}
```
