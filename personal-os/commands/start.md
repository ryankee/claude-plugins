# /personal-os:start

Initialize the PersonalOS task management system in the current workspace.

## Instructions

### 1. Check Current Setup

Verify the workspace contains the required files:

```
workspace/
├── Tasks/          # Task files directory
├── Knowledge/      # Reference documents
├── BACKLOG.md     # Unstructured inbox
├── GOALS.md       # Personal goals
└── AGENTS.md      # AI instructions
```

### 2. Create Missing Components

**If `Tasks/` directory doesn't exist:**
```bash
mkdir -p Tasks
```

**If `Knowledge/` directory doesn't exist:**
```bash
mkdir -p Knowledge
```

**If `BACKLOG.md` doesn't exist:**
Create it with the template:
```markdown
# Backlog

Dump your thoughts, tasks, and ideas here. Don't worry about formatting.
The AI will process this into structured tasks.

---

```

**If `GOALS.md` doesn't exist:**
Create it and prompt the user to fill it in:
```markdown
# Goals

## Vision
[What's your long-term vision? Who do you want to become?]

## Core Areas

### 1. [Area Name]
- Goal 1
- Goal 2

### 2. [Another Area]
- Goal 1
- Goal 2

## Current Focus
[What are you prioritizing right now?]

## Not Now
[What are you explicitly NOT focusing on?]
```

**If `AGENTS.md` doesn't exist:**
Copy from the core templates directory.

### 3. Bootstrap Goals (First Run)

If GOALS.md is empty or contains only the template, help the user fill it out:

**Ask:**
```
Let's set up your goals to drive task prioritization.

What are the 3-5 main areas of your life you want to focus on?
(e.g., Career, Health, Relationships, Learning, Side Projects)
```

For each area, ask:
```
For [Area], what are your specific goals?
What does success look like in 6 months?
```

Then ask:
```
What's your PRIMARY focus right now - the one thing that should get most of your attention?
```

Finally:
```
What are you explicitly NOT focusing on?
(This helps avoid distraction from shiny objects)
```

### 4. System Status

Once setup is complete, use `get_system_status` MCP tool to show:
- Number of tasks by priority
- Tasks by category
- Any priority limit violations
- Backlog item count

### 5. Report Results

```
PersonalOS is ready!

📁 Workspace: [path]
📋 Tasks: [X] total ([Y] P0, [Z] P1)
🎯 Goals: [X] areas defined
📥 Backlog: [X] items waiting

Quick commands:
- /personal-os:process-backlog - Turn backlog into tasks
- /personal-os:daily-review - Review priorities for today
- /personal-os:check-priorities - Verify priority limits
```

### 6. Offer Next Steps

If there are items in the backlog:
```
I see you have items in your backlog. Want me to process them now?
```

If no goals are defined:
```
Your GOALS.md is empty. Want me to help you define your goals?
This will make task prioritization much more effective.
```
