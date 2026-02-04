# /personal-os:process-backlog

Process unstructured items from BACKLOG.md into organized tasks with smart deduplication.

## Instructions

### 1. Read the Backlog

Read `BACKLOG.md` from the workspace. If empty, inform the user:
```
Your backlog is empty! Add items to BACKLOG.md and run this command again.

Tip: Just dump thoughts, tasks, and ideas without worrying about format.
```

### 2. Read Goals for Context

Read `GOALS.md` to understand the user's priorities. This helps with:
- Categorizing tasks appropriately
- Suggesting priority levels
- Flagging items that don't align with goals

### 3. Process with Deduplication

Use the `process_backlog_with_dedup` MCP tool to:
1. Parse each backlog item
2. Check for duplicates against existing tasks
3. Identify ambiguous items needing clarification
4. Suggest categories and priorities

### 4. Present Results

Group items into categories:

**Ready to Create:**
Tasks with clear intent and no duplicates.
```
1. [Task Title] - Category: technical, Priority: P1
   "Original text from backlog"

2. [Task Title] - Category: outreach, Priority: P2
   "Original text from backlog"
```

**Potential Duplicates:**
Items similar to existing tasks.
```
⚠️ "[Backlog item]"
   Similar to existing task: "[Existing task title]"
   → Skip / Merge / Create anyway?
```

**Needs Clarification:**
Ambiguous items.
```
❓ "[Backlog item]"
   - What specifically needs to be done?
   - Who is this for?
   - What's the deadline?
```

**No Goal Alignment:**
Items that don't match any defined goals.
```
🤔 "[Backlog item]"
   This doesn't seem to align with your goals.
   → Create anyway / Add to "Not Now" / Skip?
```

### 5. Get User Confirmation

**Ask for each category:**

For Ready items:
```
I found [X] items ready to create as tasks. Proceed with all?
Or type numbers to select specific items (e.g., "1, 3, 5")
```

For Duplicates:
```
How should I handle potential duplicates?
- "skip" - Don't create these
- "merge" - Add notes to existing tasks
- "create" - Create as new tasks anyway
```

For Clarification needed:
```
I need more info on [X] items. Want to clarify them now, or skip for later?
```

### 6. Create Tasks

For each confirmed item, use `create_task` MCP tool:
- Create with metadata only (title, category, priority, status)
- Estimated time if mentioned
- No content generation unless specifically requested

### 7. Clear Processed Items

After successful creation, use `clear_backlog` MCP tool to:
- Remove processed items from BACKLOG.md
- Keep items that were skipped or need clarification

### 8. Report Summary

```
✅ Backlog processed!

Created: [X] new tasks
- [Y] high priority (P0-P1)
- [Z] normal priority (P2-P3)

Skipped: [X] duplicates
Deferred: [X] items (need clarification)

Priority check:
- P0: [X]/3 ✓
- P1: [X]/7 ✓

Use /personal-os:check-priorities if you need to rebalance.
```

## Options

### --dry-run
Show what would be created without actually creating tasks.
```
/personal-os:process-backlog --dry-run
```

### --auto
Skip confirmations and create all non-duplicate items automatically.
```
/personal-os:process-backlog --auto
```

### --strict
Only create items that clearly align with goals.
```
/personal-os:process-backlog --strict
```
