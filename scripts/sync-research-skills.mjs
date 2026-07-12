import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const canonicalRoot = path.join(repoRoot, "skills");
const resourceRoot = path.join(repoRoot, "src-tauri", "resources", "skills");
const scopePath = path.join(canonicalRoot, "research-scope.json");
const mode = process.argv[2] ?? "check";

if (!new Set(["sync", "check", "report"]).has(mode)) {
  throw new Error("Usage: node scripts/sync-research-skills.mjs <sync|check|report>");
}

if (mode === "sync") {
  rmSync(resourceRoot, { recursive: true, force: true });
  mkdirSync(resourceRoot, { recursive: true });
  cpSync(canonicalRoot, resourceRoot, { recursive: true });
}

const report = validate();
if (mode === "report") {
  process.stdout.write(`${formatReport(report)}\n`);
} else if (report.errors.length > 0) {
  process.stderr.write(`${formatReport(report)}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Research skill resources are in sync (${report.skillCount} Skills).\n`);
}

function validate() {
  const errors = [];
  const scope = readJson(scopePath, errors, "canonical research scope");
  const scopeIds = Array.isArray(scope?.skills) ? scope.skills : [];
  if (!scopeIds.includes("mpacc-thesis-writer")) {
    errors.push("skills/research-scope.json must include mpacc-thesis-writer");
  }

  const canonicalFiles = fileMap(canonicalRoot);
  const resourceFiles = fileMap(resourceRoot);
  for (const [relative, source] of canonicalFiles) {
    const target = resourceFiles.get(relative);
    if (!target) {
      errors.push(`missing resource file: src-tauri/resources/skills/${relative}`);
    } else if (!readFileSync(source).equals(readFileSync(target))) {
      errors.push(`resource differs from canonical source: ${relative}`);
    }
  }
  for (const relative of resourceFiles.keys()) {
    if (!canonicalFiles.has(relative)) {
      errors.push(`unexpected resource file: src-tauri/resources/skills/${relative}`);
    }
  }

  for (const skillId of scopeIds) {
    const canonicalSkill = path.join(canonicalRoot, skillId, "SKILL.md");
    const resourceSkill = path.join(resourceRoot, skillId, "SKILL.md");
    if (!existsSync(canonicalSkill)) errors.push(`scoped canonical Skill is missing: ${skillId}`);
    if (!existsSync(resourceSkill)) errors.push(`scoped resource Skill is missing: ${skillId}`);
  }

  for (const [relative, source] of canonicalFiles) {
    if (path.basename(relative) !== "SKILL.md") continue;
    for (const dependency of referencedLocalFiles(readFileSync(source, "utf8"))) {
      const resolved = path.resolve(path.dirname(source), dependency);
      if (!resolved.startsWith(canonicalRoot) || !existsSync(resolved)) {
        errors.push(`missing Skill dependency: ${relative} -> ${dependency}`);
      }
    }
  }

  return { errors, skillCount: scopeIds.length };
}

function fileMap(root) {
  const files = new Map();
  if (!existsSync(root)) return files;
  for (const file of walkFiles(root)) {
    files.set(path.relative(root, file).replaceAll(path.sep, "/"), file);
  }
  return files;
}

function* walkFiles(directory) {
  for (const name of readdirSync(directory)) {
    if (name === "node_modules" || name === ".DS_Store") continue;
    const file = path.join(directory, name);
    const stats = statSync(file);
    if (stats.isDirectory()) yield* walkFiles(file);
    else if (stats.isFile()) yield file;
  }
}

function referencedLocalFiles(content) {
  const dependencies = new Set();
  for (const match of content.matchAll(/`([^`]+)`/g)) {
    const candidate = match[1];
    if (
      /(?:^|\/)(?:references|scripts|templates|assets)\/[A-Za-z0-9_.-]+$/.test(candidate)
      && !candidate.includes("://")
    ) {
      dependencies.add(candidate);
    }
  }
  return dependencies;
}

function readJson(file, errors, label) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`cannot read ${label}: ${error.message}`);
    return null;
  }
}

function formatReport({ errors, skillCount }) {
  return [
    `Scoped Skills: ${skillCount}`,
    `Errors: ${errors.length}`,
    ...errors.map((error) => `  - ${error}`),
  ].join("\n");
}
