# /personal-os:check-priorities

Verify priority distribution and suggest rebalancing if needed.

## Instructions

### 1. Get Current Status

Use `check_priority_limits` MCP tool to get:
- Count of tasks at each priority level
- Any limit violations
- Tasks per category

### 2. Display Priority Overview

```
## Priority Distribution

| Priority | Count | Limit | Status |
|----------|-------|-------|--------|
| P0 (Today) | [X] | 3 | ✅/⚠️ |
| P1 (Week) | [X] | 7 | ✅/⚠️ |
| P2 (Scheduled) | [X] | ~10 | ✅/⚠️ |
| P3 (Someday) | [X] | ∞ | ✅ |

Total active tasks: [X]
```

### 3. Flag Violations

**If P0 > 3:**
```
⚠️ Too Many P0 Tasks

You have [X] P0 tasks but should have max 3.
P0 means "MUST do today" - not everything urgent is P0.

Current P0 tasks:
1. [Task title]
2. [Task title]
...

Which of these can move to P1 (this week)?
```

**If P1 > 7:**
```
⚠️ Too Many P1 Tasks

You have [X] P1 tasks but should have max 7.
P1 means "important this week" - be selective.

Which can be:
- Moved to P2 (scheduled for later)?
- Moved to P3 (someday/maybe)?
- Delegated or deleted?
```

### 4. Goal Alignment Check

Cross-reference tasks with GOALS.md:
```
## Goal Alignment

| Goal Area | P0 | P1 | P2 | P3 | Total |
|-----------|----|----|----|----|-------|
| [Area 1] | X | X | X | X | X |
| [Area 2] | X | X | X | X | X |
| No Goal | X | X | X | X | X |

[Analysis]
- [Area] is well-represented
- [Area] has no high-priority tasks
- [X] tasks don't align with any goal
```

### 5. Suggest Rebalancing

Based on analysis, provide specific suggestions:

**If a goal area is neglected:**
```
💡 [Goal Area] has no P0/P1 tasks this week.
Consider promoting one of these:
- [P2/P3 task that serves this goal]
```

**If tasks don't align with goals:**
```
💡 These tasks don't serve your stated goals:
- [Task] - Move to P3 or delete?
- [Task] - Move to P3 or delete?

Are these truly important, or just habitual?
```

**If priorities are well-balanced:**
```
✅ Priorities look balanced!

- P0/P1 limits respected
- All goal areas represented
- No orphaned tasks
```

### 6. Offer Quick Actions

```
### Quick Rebalance

Type to adjust:
- "promote [task]" - Increase priority
- "demote [task]" - Decrease priority
- "delete [task]" - Remove task
- "p0 [task]" / "p1 [task]" / etc. - Set specific priority
```

### 7. Historical Trend (if available)

If evaluation data exists:
```
### Trend (Last 7 Days)

- Avg P0 tasks/day: [X]
- P0 completion rate: [X]%
- Most productive category: [X]
- Frequently blocked: [X]
```

## Options

### --fix
Automatically suggest and apply rebalancing:
```
/personal-os:check-priorities --fix
```

### --strict
Show warnings even for soft limits:
```
/personal-os:check-priorities --strict
```

### --by-category
Group priority issues by category:
```
/personal-os:check-priorities --by-category
```
