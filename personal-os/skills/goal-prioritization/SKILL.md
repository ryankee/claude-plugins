# Goal-Driven Prioritization Skill

## Overview

This skill enables intelligent task prioritization based on the user's personal goals defined in `GOALS.md`. Tasks are automatically aligned with goals to ensure work stays focused on what matters most.

## The Goals File

`GOALS.md` contains the user's personal vision and priorities. This file drives all prioritization decisions.

### Goals File Structure

```markdown
# Goals

## Vision
[Long-term vision statement - who you want to become]

## Core Areas
1. **Area Name** - Description
   - Specific goal
   - Specific goal

2. **Another Area** - Description
   - Specific goal
   - Specific goal

## Current Focus
[What you're prioritizing right now]

## Not Now
[Things explicitly deprioritized]
```

## How Goal Alignment Works

When processing tasks:

1. **Read GOALS.md** to understand current priorities
2. **Match task to goals** - Which goal area does this task serve?
3. **Assess alignment strength:**
   - **High alignment** → Candidate for P0/P1
   - **Medium alignment** → P1/P2
   - **Low alignment** → P2/P3
   - **No alignment / "Not Now"** → P3 or skip

## Prioritization Algorithm

### Step 1: Goal Matching
For each task, determine:
- Which goal area(s) does it support?
- Is it in "Current Focus" or "Not Now"?
- How directly does it contribute?

### Step 2: Apply Priority Rules

| Scenario | Recommended Priority |
|----------|---------------------|
| Directly serves Current Focus | P0-P1 |
| Supports core goal area | P1-P2 |
| Tangentially related | P2-P3 |
| In "Not Now" list | P3 or defer |
| No goal alignment | Question if needed |

### Step 3: Respect Limits
- P0: Max 3 tasks (what MUST happen today)
- P1: Max 7 tasks (this week's priorities)
- If over limit, bump lower-alignment tasks down

## How to Interact

**When user asks to prioritize tasks:**
1. Read GOALS.md for context
2. List current tasks
3. Score each task against goals
4. Recommend priority adjustments
5. Flag any tasks with no goal alignment

**When user adds a new task:**
1. Ask which goal it serves (if not obvious)
2. Suggest appropriate priority based on alignment
3. Warn if it doesn't fit any goals

**When user asks "what should I focus on":**
1. Review GOALS.md Current Focus section
2. Filter tasks to those aligned with focus
3. Recommend top 1-3 actions for today

**When reviewing backlog:**
1. Process each item against goals
2. Group by goal area
3. Suggest priorities based on alignment
4. Highlight items that don't fit any goal

## Goal-Based Questions

When a task seems misaligned, ask:
- "Which of your goals does this support?"
- "Should this go in your 'Not Now' list?"
- "Is this urgent but not important? Can it be delegated?"

## Maintaining Goal Alignment

Periodically (weekly or when user requests):
1. Review task distribution across goal areas
2. Flag if one area is over/under-represented
3. Suggest rebalancing if needed
4. Ask if GOALS.md needs updating

## Example Goal-Task Alignment

**Goals:**
- Career: Ship product features, build technical skills
- Health: Exercise 4x/week, sleep 7+ hours
- Relationships: Weekly family time, monthly friend meetups

**Task Analysis:**
| Task | Goal Area | Alignment | Suggested Priority |
|------|-----------|-----------|-------------------|
| Fix API bug | Career | High | P1 |
| Gym session | Health | High | P1 |
| Random admin | None | Low | P3 |
| Learn Rust | Career | Medium | P2 |

## Proactive Checks

The system should automatically:
- Alert when P0 tasks don't align with Current Focus
- Suggest demoting tasks that don't serve goals
- Recommend promoting neglected goal areas
- Flag when "Not Now" items keep appearing
