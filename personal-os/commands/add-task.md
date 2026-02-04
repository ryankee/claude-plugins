# /personal-os:add-task

Quickly add a new task with smart defaults and deduplication checking.

## Usage

```
/personal-os:add-task [task description]
```

## Instructions

### 1. Parse Task Description

Extract from the user's input:
- **Title**: Main task description
- **Category**: Guess from keywords (technical, outreach, writing, etc.)
- **Priority**: Default P2, or infer from urgency words
- **Due date**: If mentioned ("by Friday", "tomorrow", etc.)
- **Person**: If mentioned ("for John", "with Sarah", etc.)

### 2. Check for Duplicates

Use similarity detection to find existing similar tasks:
- If >80% similar: Flag as potential duplicate
- If 50-80% similar: Show for awareness
- If <50%: Proceed normally

**If duplicate found:**
```
⚠️ Similar task exists:
"[Existing task title]" (Priority: [X], Status: [X])

Options:
- "create" - Create anyway
- "update" - Add to existing task
- "skip" - Don't create
```

### 3. Check Goal Alignment

Compare against GOALS.md:
```
🎯 This task aligns with: [Goal Area]
```

Or if no alignment:
```
🤔 This doesn't seem to align with your stated goals.
Still want to create it?
```

### 4. Confirm and Create

Show preview:
```
📋 New Task

Title: [Parsed title]
Category: [Guessed category]
Priority: [Default or inferred]
Est. Time: [If provided, else "not set"]
Goal Area: [Matched goal]

Create this task? (yes/no/edit)
```

If user says "edit", allow modifications:
```
What would you like to change?
- title: [new title]
- priority: p0/p1/p2/p3
- category: [category]
- time: [estimate]
```

### 5. Create Task

Use `create_task` MCP tool with:
- Metadata only (no content generation)
- Status: `n` (not started)
- Created date: today

### 6. Confirm Creation

```
✅ Task created: "[Title]"

Priority: [X] | Category: [X]
[Link to task file if applicable]

Quick actions:
- "start" - Begin working on it
- "p0" - Promote to today's must-do
```

## Options

### --quick
Skip confirmations, create immediately:
```
/personal-os:add-task --quick Fix the login bug
```

### --p0 / --p1 / --p2 / --p3
Set specific priority:
```
/personal-os:add-task --p0 Ship the feature
```

### --category [cat]
Set specific category:
```
/personal-os:add-task --category technical Debug memory leak
```

## Examples

**Basic:**
```
/personal-os:add-task Review PR from Alice
```

**With priority:**
```
/personal-os:add-task --p1 Prepare quarterly report
```

**With urgency detected:**
```
/personal-os:add-task URGENT: Fix production bug
→ Automatically suggests P0
```

**With person:**
```
/personal-os:add-task Follow up with Bob about contract
→ Category: outreach, includes "Bob" context
```

**With deadline:**
```
/personal-os:add-task Submit expenses by Friday
→ Includes due date in metadata
```
