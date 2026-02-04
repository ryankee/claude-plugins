#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";
import * as YAML from "yaml";

// Configuration from environment
const BASE_DIR = process.env.PERSONALOS_BASE_DIR || process.env.WORKSPACE || process.cwd();
const TASKS_DIR = process.env.TASKS_DIR || path.join(BASE_DIR, "Tasks");
const KNOWLEDGE_DIR = process.env.KNOWLEDGE_DIR || path.join(BASE_DIR, "Knowledge");
const BACKLOG_FILE = process.env.BACKLOG_FILE || path.join(BASE_DIR, "BACKLOG.md");
const GOALS_FILE = process.env.GOALS_FILE || path.join(BASE_DIR, "GOALS.md");

// Priority limits
const PRIORITY_LIMITS: Record<string, number> = {
  P0: 3,
  P1: 7,
  P2: 10,
};

// Ensure directories exist
function ensureDirectories() {
  if (!fs.existsSync(TASKS_DIR)) {
    fs.mkdirSync(TASKS_DIR, { recursive: true });
  }
  if (!fs.existsSync(KNOWLEDGE_DIR)) {
    fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true });
  }
}

// Parse YAML frontmatter from markdown
function parseYamlFrontmatter(content: string): { metadata: Record<string, any>; body: string } {
  if (!content.startsWith("---")) {
    return { metadata: {}, body: content };
  }

  const parts = content.split("---").slice(1);
  if (parts.length >= 1) {
    try {
      const metadata = YAML.parse(parts[0]) || {};
      const body = parts.slice(1).join("---");
      return { metadata, body };
    } catch {
      return { metadata: {}, body: content };
    }
  }
  return { metadata: {}, body: content };
}

// Get all tasks from Tasks directory
interface Task {
  title?: string;
  category?: string;
  priority?: string;
  status?: string;
  estimated_time?: number;
  created?: string;
  completed?: string;
  filename: string;
  body_content?: string;
  [key: string]: any;
}

function getAllTasks(): Task[] {
  const tasks: Task[] = [];

  if (!fs.existsSync(TASKS_DIR)) {
    return tasks;
  }

  const files = fs.readdirSync(TASKS_DIR).filter((f) => f.endsWith(".md"));

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(TASKS_DIR, file), "utf-8");
      const { metadata, body } = parseYamlFrontmatter(content);
      if (Object.keys(metadata).length > 0) {
        tasks.push({
          ...metadata,
          filename: file,
          body_content: body.slice(0, 500),
        });
      }
    } catch (e) {
      console.error(`Error reading ${file}:`, e);
    }
  }

  return tasks;
}

// Calculate string similarity (Levenshtein-based)
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  const matrix: number[][] = [];

  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const maxLen = Math.max(s1.length, s2.length);
  return 1 - matrix[s1.length][s2.length] / maxLen;
}

// Extract keywords from text
function extractKeywords(text: string): Set<string> {
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with", "from", "up", "out",
  ]);
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  return new Set(words.filter((w) => !stopWords.has(w) && w.length > 2));
}

// Find similar tasks
function findSimilarTasks(
  item: string,
  existingTasks: Task[],
  threshold = 0.6
): Array<{ title: string; filename: string; category: string; status: string; priority: string; similarity_score: number }> {
  const similar: Array<{
    title: string;
    filename: string;
    category: string;
    status: string;
    priority: string;
    similarity_score: number;
  }> = [];

  const itemKeywords = extractKeywords(item);

  for (const task of existingTasks) {
    if (task.status === "d") continue;

    const title = task.title || "";
    const titleSimilarity = calculateSimilarity(item, title);

    const taskKeywords = extractKeywords(title);
    let keywordOverlap = 0;
    if (itemKeywords.size > 0 && taskKeywords.size > 0) {
      const intersection = new Set([...itemKeywords].filter((x) => taskKeywords.has(x)));
      const union = new Set([...itemKeywords, ...taskKeywords]);
      keywordOverlap = intersection.size / union.size;
    }

    const similarityScore = titleSimilarity * 0.7 + keywordOverlap * 0.3;

    if (similarityScore >= threshold) {
      similar.push({
        title,
        filename: task.filename,
        category: task.category || "",
        status: task.status || "",
        priority: task.priority || "",
        similarity_score: Math.round(similarityScore * 100) / 100,
      });
    }
  }

  similar.sort((a, b) => b.similarity_score - a.similarity_score);
  return similar.slice(0, 3);
}

// Check if item is ambiguous
function isAmbiguous(item: string): boolean {
  const itemLower = item.toLowerCase().trim();

  if (itemLower.split(/\s+/).length <= 2) {
    return true;
  }

  const vaguePatterns = [
    /^(fix|update|improve|check|review|look at|work on)\s+(the|a|an)?\s*\w+$/,
    /^\w+\s+(stuff|thing|issue|problem)$/,
    /^(follow up|reach out|contact|email)$/,
    /^(investigate|research|explore)\s*\w{0,20}$/,
  ];

  return vaguePatterns.some((pattern) => pattern.test(itemLower));
}

// Generate clarification questions
function generateClarificationQuestions(item: string): string[] {
  const questions: string[] = [];
  const itemLower = item.toLowerCase();

  if (["fix", "bug", "error", "issue"].some((w) => itemLower.includes(w))) {
    questions.push("Which specific bug or error? Can you provide more details?");
    questions.push("What component or feature is affected?");
  }

  if (["update", "improve", "refactor"].some((w) => itemLower.includes(w))) {
    questions.push("What specific aspects need updating/improvement?");
    questions.push("What's the success criteria for this task?");
  }

  if (["email", "contact", "reach out", "follow up"].some((w) => itemLower.includes(w))) {
    questions.push("Who should be contacted?");
    questions.push("What's the purpose or goal of this outreach?");
  }

  if (["research", "investigate", "explore"].some((w) => itemLower.includes(w))) {
    questions.push("What specific questions need to be answered?");
    questions.push("What decisions will this research inform?");
  }

  if (questions.length === 0) {
    questions.push("Can you provide more specific details about what needs to be done?");
    questions.push("What's the expected outcome or deliverable?");
  }

  return questions;
}

// Guess category from text
function guessCategory(item: string): string {
  const itemLower = item.toLowerCase();

  if (["email", "contact", "reach out", "follow up", "meeting", "call"].some((w) => itemLower.includes(w))) {
    return "outreach";
  }
  if (["code", "api", "database", "deploy", "fix", "bug", "implement"].some((w) => itemLower.includes(w))) {
    return "technical";
  }
  if (["research", "study", "learn", "understand", "investigate"].some((w) => itemLower.includes(w))) {
    return "research";
  }
  if (["write", "draft", "document", "blog", "article", "proposal"].some((w) => itemLower.includes(w))) {
    return "writing";
  }
  if (["expense", "invoice", "schedule", "calendar", "organize"].some((w) => itemLower.includes(w))) {
    return "admin";
  }
  if (["tweet", "post", "linkedin", "social", "twitter", "marketing"].some((w) => itemLower.includes(w))) {
    return "marketing";
  }
  return "other";
}

// Update file frontmatter
function updateFileFrontmatter(filepath: string, updates: Record<string, any>): boolean {
  try {
    const content = fs.readFileSync(filepath, "utf-8");
    const { metadata, body } = parseYamlFrontmatter(content);
    const newMetadata = { ...metadata, ...updates };
    const yamlStr = YAML.stringify(newMetadata);
    const newContent = `---\n${yamlStr}---\n${body}`;
    fs.writeFileSync(filepath, newContent);
    return true;
  } catch (e) {
    console.error(`Error updating ${filepath}:`, e);
    return false;
  }
}

// Read goals file
function readGoals(): { exists: boolean; content?: string; sections?: Record<string, string>; error?: string } {
  if (!fs.existsSync(GOALS_FILE)) {
    return { exists: false };
  }

  try {
    const content = fs.readFileSync(GOALS_FILE, "utf-8");
    const sections: Record<string, string> = {};
    let currentSection: string | null = null;
    let currentContent: string[] = [];

    for (const line of content.split("\n")) {
      if (line.startsWith("## ")) {
        if (currentSection) {
          sections[currentSection] = currentContent.join("\n");
        }
        currentSection = line.slice(3).trim().toLowerCase().replace(/\s+/g, "_");
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    }

    if (currentSection) {
      sections[currentSection] = currentContent.join("\n");
    }

    return { exists: true, content, sections };
  } catch (e) {
    return { exists: false, error: String(e) };
  }
}

// Define tools
const tools: Tool[] = [
  {
    name: "list_tasks",
    description: "List tasks with optional filters (category, priority, status)",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", description: "Filter by category (comma-separated)" },
        priority: { type: "string", description: "Filter by priority (comma-separated, e.g., P0,P1)" },
        status: { type: "string", description: "Filter by status (n=not started, s=started, b=blocked, d=done)" },
        include_done: { type: "boolean", description: "Include completed tasks", default: false },
      },
    },
  },
  {
    name: "create_task",
    description: "Create a new task with YAML frontmatter",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Task title" },
        category: { type: "string", description: "Task category", default: "other" },
        priority: { type: "string", description: "Priority (P0-P3)", default: "P2" },
        estimated_time: { type: "number", description: "Estimated time in minutes", default: 30 },
        content: { type: "string", description: "Optional task content/notes" },
      },
      required: ["title"],
    },
  },
  {
    name: "update_task_status",
    description: "Update task status",
    inputSchema: {
      type: "object",
      properties: {
        task_file: { type: "string", description: "Task filename" },
        status: { type: "string", description: "New status (n/s/b/d/r)" },
      },
      required: ["task_file", "status"],
    },
  },
  {
    name: "update_task_priority",
    description: "Update task priority",
    inputSchema: {
      type: "object",
      properties: {
        task_file: { type: "string", description: "Task filename" },
        priority: { type: "string", description: "New priority (P0-P3)" },
      },
      required: ["task_file", "priority"],
    },
  },
  {
    name: "get_task_summary",
    description: "Get summary statistics for all tasks",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "check_priority_limits",
    description: "Check if priority limits are exceeded (P0 max 3, P1 max 7)",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_system_status",
    description: "Get comprehensive system status",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "read_backlog",
    description: "Read and parse backlog contents",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "clear_backlog",
    description: "Clear processed items from backlog",
    inputSchema: {
      type: "object",
      properties: {
        keep_items: { type: "array", items: { type: "string" }, description: "Items to keep" },
      },
    },
  },
  {
    name: "process_backlog_with_dedup",
    description: "Process backlog items with duplicate detection",
    inputSchema: {
      type: "object",
      properties: {
        items: { type: "array", items: { type: "string" }, description: "Backlog items to process" },
        auto_create: { type: "boolean", description: "Auto-create non-duplicate tasks", default: false },
      },
      required: ["items"],
    },
  },
  {
    name: "read_goals",
    description: "Read the GOALS.md file for prioritization context",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "prune_completed_tasks",
    description: "Delete completed tasks older than specified days",
    inputSchema: {
      type: "object",
      properties: {
        days: { type: "number", description: "Days old threshold", default: 30 },
      },
    },
  },
];

// Handle tool calls
async function handleToolCall(name: string, args: Record<string, any>): Promise<string> {
  ensureDirectories();

  switch (name) {
    case "list_tasks": {
      let tasks = getAllTasks();

      if (!args.include_done) {
        tasks = tasks.filter((t) => t.status !== "d");
      }
      if (args.category) {
        const categories = args.category.split(",").map((c: string) => c.trim());
        tasks = tasks.filter((t) => categories.includes(t.category));
      }
      if (args.priority) {
        const priorities = args.priority.split(",").map((p: string) => p.trim());
        tasks = tasks.filter((t) => priorities.includes(t.priority));
      }
      if (args.status) {
        const statuses = args.status.split(",").map((s: string) => s.trim());
        tasks = tasks.filter((t) => statuses.includes(t.status));
      }

      // Sort by priority
      const priorityOrder: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
      tasks.sort((a, b) => (priorityOrder[a.priority || "P2"] || 2) - (priorityOrder[b.priority || "P2"] || 2));

      return JSON.stringify({ tasks, count: tasks.length, filters_applied: args }, null, 2);
    }

    case "create_task": {
      const title = args.title;
      const category = args.category || "other";
      const priority = args.priority || "P2";
      const estimatedTime = args.estimated_time || 30;
      const content = args.content || "";

      // Create safe filename
      let filename = title.replace(/[^\w\s-]/g, "").trim().replace(/[-\s]+/g, "-").slice(0, 50) + ".md";
      let filepath = path.join(TASKS_DIR, filename);

      // Handle existing file
      let counter = 1;
      while (fs.existsSync(filepath)) {
        filepath = path.join(TASKS_DIR, `${filename.slice(0, -3)}_${counter}.md`);
        counter++;
      }

      const metadata = {
        title,
        category,
        priority,
        status: "n",
        estimated_time: estimatedTime,
        created: new Date().toISOString().split("T")[0],
      };

      const yamlStr = YAML.stringify(metadata);
      const fileContent = `---\n${yamlStr}---\n\n# ${title}\n\n${content}`;

      try {
        fs.writeFileSync(filepath, fileContent);
        return JSON.stringify({
          success: true,
          filename: path.basename(filepath),
          message: `Task '${title}' created successfully`,
          priority,
          category,
        }, null, 2);
      } catch (e) {
        return JSON.stringify({ success: false, error: String(e) }, null, 2);
      }
    }

    case "update_task_status": {
      let taskFile = args.task_file;
      if (!taskFile.endsWith(".md")) taskFile += ".md";

      const filepath = path.join(TASKS_DIR, taskFile);
      if (!fs.existsSync(filepath)) {
        return JSON.stringify({ success: false, error: `Task not found: ${taskFile}` }, null, 2);
      }

      const updates: Record<string, any> = { status: args.status };
      if (args.status === "d") {
        updates.completed = new Date().toISOString().split("T")[0];
      }

      const success = updateFileFrontmatter(filepath, updates);
      const statusNames: Record<string, string> = {
        n: "not started", s: "started", b: "blocked", d: "done", r: "recurring",
      };

      return JSON.stringify({
        success,
        task_file: taskFile,
        new_status: statusNames[args.status] || args.status,
      }, null, 2);
    }

    case "update_task_priority": {
      let taskFile = args.task_file;
      if (!taskFile.endsWith(".md")) taskFile += ".md";

      const filepath = path.join(TASKS_DIR, taskFile);
      if (!fs.existsSync(filepath)) {
        return JSON.stringify({ success: false, error: `Task not found: ${taskFile}` }, null, 2);
      }

      const success = updateFileFrontmatter(filepath, { priority: args.priority });
      return JSON.stringify({ success, task_file: taskFile, new_priority: args.priority }, null, 2);
    }

    case "get_task_summary": {
      const tasks = getAllTasks();
      const activeTasks = tasks.filter((t) => t.status !== "d");

      const byPriority: Record<string, number> = {};
      const byCategory: Record<string, number> = {};
      const byStatus: Record<string, number> = {};

      for (const t of activeTasks) {
        const p = t.priority || "P2";
        const c = t.category || "other";
        byPriority[p] = (byPriority[p] || 0) + 1;
        byCategory[c] = (byCategory[c] || 0) + 1;
      }

      for (const t of tasks) {
        const s = t.status || "n";
        byStatus[s] = (byStatus[s] || 0) + 1;
      }

      const timeByPriority: Record<string, { count: number; total_minutes: number; total_hours: number }> = {};
      for (const p of ["P0", "P1", "P2", "P3"]) {
        const priorityTasks = activeTasks.filter((t) => t.priority === p);
        const totalTime = priorityTasks.reduce((sum, t) => sum + (t.estimated_time || 30), 0);
        timeByPriority[p] = {
          count: priorityTasks.length,
          total_minutes: totalTime,
          total_hours: Math.round(totalTime / 60 * 10) / 10,
        };
      }

      return JSON.stringify({
        total_tasks: tasks.length,
        active_tasks: activeTasks.length,
        by_priority: byPriority,
        by_category: byCategory,
        by_status: byStatus,
        time_by_priority: timeByPriority,
      }, null, 2);
    }

    case "check_priority_limits": {
      const tasks = getAllTasks().filter((t) => t.status !== "d");
      const byPriority: Record<string, number> = {};

      for (const t of tasks) {
        const p = t.priority || "P2";
        byPriority[p] = (byPriority[p] || 0) + 1;
      }

      const alerts: Array<{ priority: string; count: number; limit: number; over_by: number; message: string }> = [];

      for (const [priority, limit] of Object.entries(PRIORITY_LIMITS)) {
        const count = byPriority[priority] || 0;
        if (count > limit) {
          alerts.push({
            priority,
            count,
            limit,
            over_by: count - limit,
            message: `${priority} has ${count} tasks (limit: ${limit})`,
          });
        }
      }

      return JSON.stringify({
        priority_counts: byPriority,
        limits: PRIORITY_LIMITS,
        alerts,
        balanced: alerts.length === 0,
      }, null, 2);
    }

    case "get_system_status": {
      const tasks = getAllTasks();
      const activeTasks = tasks.filter((t) => t.status !== "d");

      const priorityCounts: Record<string, number> = {};
      const statusCounts: Record<string, number> = {};
      const categoryCounts: Record<string, number> = {};

      for (const t of activeTasks) {
        const p = t.priority || "P2";
        const c = t.category || "other";
        priorityCounts[p] = (priorityCounts[p] || 0) + 1;
        categoryCounts[c] = (categoryCounts[c] || 0) + 1;
      }

      for (const t of activeTasks) {
        const s = t.status || "n";
        statusCounts[s] = (statusCounts[s] || 0) + 1;
      }

      // Check backlog
      let backlogItems = 0;
      if (fs.existsSync(BACKLOG_FILE)) {
        const content = fs.readFileSync(BACKLOG_FILE, "utf-8").trim();
        if (content && !["all done!", ""].includes(content.toLowerCase())) {
          backlogItems = content.split("\n").filter((l) => l.trim().startsWith("-")).length;
        }
      }

      // Check goals
      const goals = readGoals();

      // Priority alerts
      const alerts: string[] = [];
      for (const [priority, limit] of Object.entries(PRIORITY_LIMITS)) {
        const count = priorityCounts[priority] || 0;
        if (count > limit) {
          alerts.push(`${priority} over limit: ${count}/${limit}`);
        }
      }

      return JSON.stringify({
        total_active_tasks: activeTasks.length,
        priority_distribution: priorityCounts,
        status_distribution: statusCounts,
        category_distribution: categoryCounts,
        backlog_items: backlogItems,
        goals_defined: goals.exists,
        priority_alerts: alerts,
        directories: {
          tasks: TASKS_DIR,
          knowledge: KNOWLEDGE_DIR,
          backlog: BACKLOG_FILE,
          goals: GOALS_FILE,
        },
        timestamp: new Date().toISOString(),
      }, null, 2);
    }

    case "read_backlog": {
      if (!fs.existsSync(BACKLOG_FILE)) {
        return JSON.stringify({ success: false, error: "BACKLOG.md not found", path: BACKLOG_FILE }, null, 2);
      }

      const content = fs.readFileSync(BACKLOG_FILE, "utf-8").trim();

      if (!content || ["all done!", ""].includes(content.toLowerCase())) {
        return JSON.stringify({ success: true, content: null, items: [], count: 0, message: "Backlog is empty" }, null, 2);
      }

      const items = content.split("\n")
        .filter((l) => l.trim().startsWith("- "))
        .map((l) => l.trim().slice(2));

      return JSON.stringify({ success: true, content, items, count: items.length }, null, 2);
    }

    case "clear_backlog": {
      const keepItems = args.keep_items || [];

      try {
        let newContent: string;
        if (keepItems.length > 0) {
          newContent = "# Backlog\n\n" + keepItems.map((item: string) => `- ${item}`).join("\n");
        } else {
          newContent = "# Backlog\n\nall done!";
        }

        fs.writeFileSync(BACKLOG_FILE, newContent);
        return JSON.stringify({
          success: true,
          message: keepItems.length === 0 ? "Backlog cleared" : `Backlog updated, kept ${keepItems.length} items`,
        }, null, 2);
      } catch (e) {
        return JSON.stringify({ success: false, error: String(e) }, null, 2);
      }
    }

    case "process_backlog_with_dedup": {
      const items = args.items || [];
      const autoCreate = args.auto_create || false;

      if (items.length === 0) {
        return JSON.stringify({ error: "No items provided to process" }, null, 2);
      }

      const existingTasks = getAllTasks();

      const result = {
        ready_to_create: [] as Array<{ item: string; suggested_category: string; suggested_priority: string }>,
        potential_duplicates: [] as Array<{ item: string; similar_tasks: any[]; recommended_action: string }>,
        needs_clarification: [] as Array<{ item: string; questions: string[] }>,
        auto_created: [] as string[],
        summary: {} as Record<string, any>,
      };

      for (const item of items) {
        const similarTasks = findSimilarTasks(item, existingTasks);

        if (similarTasks.length > 0) {
          result.potential_duplicates.push({
            item,
            similar_tasks: similarTasks,
            recommended_action: similarTasks[0].similarity_score > 0.8 ? "skip" : "review",
          });
        } else if (isAmbiguous(item)) {
          result.needs_clarification.push({
            item,
            questions: generateClarificationQuestions(item),
          });
        } else {
          const taskInfo = {
            item,
            suggested_category: guessCategory(item),
            suggested_priority: "P2",
          };
          result.ready_to_create.push(taskInfo);

          if (autoCreate) {
            const filename = item.replace(/[^\w\s-]/g, "").trim().replace(/[-\s]+/g, "-").slice(0, 50) + ".md";
            const filepath = path.join(TASKS_DIR, filename);

            const metadata = {
              title: item,
              category: taskInfo.suggested_category,
              priority: "P2",
              status: "n",
              estimated_time: 30,
              created: new Date().toISOString().split("T")[0],
            };

            const yamlStr = YAML.stringify(metadata);
            const content = `---\n${yamlStr}---\n\n# ${item}\n`;

            fs.writeFileSync(filepath, content);
            result.auto_created.push(filename);
          }
        }
      }

      result.summary = {
        total_items: items.length,
        ready_to_create: result.ready_to_create.length,
        duplicates_found: result.potential_duplicates.length,
        needs_clarification: result.needs_clarification.length,
        auto_created: result.auto_created.length,
      };

      return JSON.stringify(result, null, 2);
    }

    case "read_goals": {
      return JSON.stringify(readGoals(), null, 2);
    }

    case "prune_completed_tasks": {
      const days = args.days || 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const deleted: string[] = [];

      if (fs.existsSync(TASKS_DIR)) {
        const files = fs.readdirSync(TASKS_DIR).filter((f) => f.endsWith(".md"));

        for (const file of files) {
          const filepath = path.join(TASKS_DIR, file);
          try {
            const stats = fs.statSync(filepath);
            if (stats.mtime < cutoffDate) {
              const content = fs.readFileSync(filepath, "utf-8");
              const { metadata } = parseYamlFrontmatter(content);
              if (metadata.status === "d") {
                fs.unlinkSync(filepath);
                deleted.push(file);
              }
            }
          } catch (e) {
            console.error(`Error processing ${file}:`, e);
          }
        }
      }

      return JSON.stringify({
        success: true,
        deleted_count: deleted.length,
        deleted_files: deleted,
        message: `Deleted ${deleted.length} completed tasks older than ${days} days`,
      }, null, 2);
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` }, null, 2);
  }
}

// Main server setup
async function main() {
  const server = new Server(
    { name: "personal-os-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const result = await handleToolCall(name, args || {});
    return { content: [{ type: "text", text: result }] };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(`PersonalOS MCP Server running`);
  console.error(`Tasks: ${TASKS_DIR}`);
  console.error(`Backlog: ${BACKLOG_FILE}`);
  console.error(`Goals: ${GOALS_FILE}`);
}

main().catch(console.error);
