# /personal-os:daily-review

Review and plan your priorities for today based on goals and current tasks.

## Instructions

### 1. Gather Context

Read these files in parallel:
- `GOALS.md` - Current focus areas
- `BACKLOG.md` - Any unprocessed items
- Use `list_tasks` to get all active tasks
- Use `check_priority_limits` for current counts

### 2. Show Today's Focus

Based on GOALS.md "Current Focus" section, highlight:
```
🎯 Today's Focus: [Current Focus from GOALS.md]
```

### 3. Present P0 Tasks (Today)

```
## Must Do Today (P0)

1. [ ] [Task title]
   Category: [cat] | Est: [time]

2. [ ] [Task title]
   Category: [cat] | Est: [time]

[X]/3 P0 slots used
```

If no P0 tasks:
```
No P0 tasks set for today. Review P1 tasks and promote what's most urgent.
```

If too many P0 tasks (>3):
```
⚠️ You have [X] P0 tasks. Maximum recommended is 3.
Which can be moved to P1 for later this week?
```

### 4. Present P1 Tasks (This Week)

```
## This Week (P1)

1. [ ] [Task title]
2. [ ] [Task title]
...

[X]/7 P1 slots used
```

### 5. Check Goal Alignment

Review if today's P0 tasks align with "Current Focus":

```
### Goal Alignment Check

✅ [Task] → Supports [Goal Area]
✅ [Task] → Supports [Goal Area]
⚠️ [Task] → Doesn't align with current focus
   Consider: Is this truly urgent, or just feels urgent?
```

### 6. Surface Blocked Items

If any tasks have status `b` (blocked):
```
### Blocked Items

🚫 [Task title]
   What's blocking this? Can it be unblocked today?
```

### 7. Check Backlog

If backlog has items:
```
### Backlog Alert

📥 You have [X] items in your backlog.
Run /personal-os:process-backlog to organize them.
```

### 8. Time Estimation

Calculate total estimated time for P0 tasks:
```
### Time Budget

P0 tasks: ~[X] hours estimated
Available focus time: [Assume 4-6 hours of deep work]

[Status: On track / Overcommitted / Room for more]
```

### 9. Daily Questions

End with reflection prompts:
```
### Quick Check

- What's the ONE thing that would make today successful?
- Anything that should be delegated or deferred?
- Any tasks that have been sitting too long?
```

### 10. Offer Actions

```
### Quick Actions

- "promote [task]" - Move a P1 task to P0
- "defer [task]" - Move to P2/P3
- "block [task]" - Mark as blocked
- "done [task]" - Mark as complete
```

## Time-Based Variations

### Morning (before 10am)
Focus on planning:
- Show full P0 and P1 lists
- Emphasize goal alignment
- Ask about energy levels for task scheduling

### Midday (10am-3pm)
Focus on progress:
- Show only incomplete P0 tasks
- Ask what's been accomplished
- Offer to update statuses

### Evening (after 5pm)
Focus on review:
- Summarize what was completed
- Move incomplete P0s to tomorrow
- Preview tomorrow's priorities
