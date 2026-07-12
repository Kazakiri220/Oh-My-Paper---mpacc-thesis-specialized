import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = path.join(repoRoot, "plugins", "oh-my-paper-codex");
const promptRoot = path.join(pluginRoot, "prompts");
const pluginSkillsRoot = path.join(pluginRoot, "skills");
const canonicalSkillsRoot = path.join(repoRoot, "skills");
const pluginManifestPath = path.join(pluginRoot, ".codex-plugin", "plugin.json");
const pluginHooksPath = path.join(pluginRoot, "hooks", "hooks.json");
const marketplacePath = path.join(repoRoot, ".agents", "plugins", "marketplace.json");
const packagePath = path.join(repoRoot, "package.json");

const WORKFLOW_SKILLS = [
  ["omp-setup", "Initialize or repair an Oh My Paper thesis project. Use for project setup, Codex project configuration, and workflow bootstrap; do not use for drafting a chapter."],
  ["omp-plan", "Plan the next evidence-grounded task for an Oh My Paper thesis project. Use for project planning and task sequencing; do not use to fabricate research evidence."],
  ["omp-survey", "Run a literature survey workflow for an Oh My Paper thesis project. Use for search strategy, screening, and evidence tracking; do not use as a substitute for source verification."],
  ["omp-ideate", "Develop and evaluate thesis-topic ideas from real professional problems. Use for scoped ideation; do not use to invent a case, data, or research gap."],
  ["omp-experiment", "Plan or execute an evidence-preserving research experiment or analysis. Use for experiment workflow; do not use when the required data or method fit is unavailable."],
  ["omp-write", "Draft or revise an Oh My Paper thesis artifact with traceable evidence. Use for writing tasks; do not use to invent citations, enterprise facts, or research results."],
  ["omp-review", "Review an Oh My Paper thesis artifact for evidence, logic, and presentation quality. Use for critique and revision planning; do not use to certify unverifiable claims."],
  ["omp-sync", "Synchronize Oh My Paper pipeline state, task records, and working memory. Use for state reconciliation; do not use to overwrite unresolved or conflicting project evidence."],
  ["omp-delegate", "Delegate a bounded Oh My Paper task with an explicit handoff. Use for task routing; do not use for unbounded recursive delegation or unsafe automation."],
];

const CORE_SKILLS = [
  "mpacc-thesis-writer",
  "research-pipeline-planner",
  "research-idea-convergence",
  "inno-paper-writing",
  "inno-paper-reviewer",
  "inno-reference-audit",
];

const mode = process.argv[2] ?? "check";
if (!new Set(["sync", "check"]).has(mode)) {
  throw new Error("Usage: node scripts/sync-codex-plugin-skills.mjs <sync|check>");
}

const expectedFiles = expectedSkillFiles();
if (mode === "sync") {
  syncPluginMetadata();
  syncSkills(expectedFiles);
}

const report = checkSkills(expectedFiles);
if (report.length > 0) {
  process.stderr.write(`Codex plugin skills are out of sync:\n${report.map((item) => `  - ${item}`).join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Codex plugin skills are in sync (${WORKFLOW_SKILLS.length} workflows, ${CORE_SKILLS.length} core skills).\n`);
}

function expectedSkillFiles() {
  const files = new Map();
  for (const [name, description] of WORKFLOW_SKILLS) {
    const promptPath = path.join(promptRoot, `${name}.md`);
    assertFile(promptPath, `workflow prompt for ${name}`);
    const prompt = stripFrontmatter(readFileSync(promptPath, "utf8")).trim();
    files.set(
      path.join(pluginSkillsRoot, name, "SKILL.md"),
      `---\nname: ${name}\ndescription: ${JSON.stringify(description)}\n---\n\n${prompt}\n`,
    );
  }

  for (const name of CORE_SKILLS) {
    const sourceDir = path.join(canonicalSkillsRoot, name);
    assertDirectory(sourceDir, `canonical skill ${name}`);
    for (const sourceFile of walkFiles(sourceDir)) {
      const relative = path.relative(sourceDir, sourceFile);
      files.set(path.join(pluginSkillsRoot, name, relative), readFileSync(sourceFile));
    }
  }
  return files;
}

function stripFrontmatter(content) {
  const normalized = content.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) return normalized;
  const end = normalized.indexOf("\n---\n", 4);
  return end === -1 ? normalized : normalized.slice(end + 5);
}

function syncSkills(files) {
  if (existsSync(pluginSkillsRoot) && !statSync(pluginSkillsRoot).isDirectory()) {
    rmSync(pluginSkillsRoot, { force: true });
  }
  mkdirSync(pluginSkillsRoot, { recursive: true });

  for (const [name] of WORKFLOW_SKILLS) {
    rmSync(path.join(pluginSkillsRoot, name), { recursive: true, force: true });
  }
  for (const name of CORE_SKILLS) {
    rmSync(path.join(pluginSkillsRoot, name), { recursive: true, force: true });
  }

  for (const [target, content] of files) {
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
}

function syncPluginMetadata() {
  const manifest = JSON.parse(readFileSync(pluginManifestPath, "utf8"));
  const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
  if (!hasCurrentPluginVersion(manifest.version, packageJson.version)) {
    manifest.version = packageJson.version;
    writeFileSync(pluginManifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }
}

function checkSkills(files) {
  const report = [];
  validatePluginMetadata(report);
  if (!existsSync(pluginSkillsRoot) || !statSync(pluginSkillsRoot).isDirectory()) {
    return ["plugins/oh-my-paper-codex/skills is not a real directory"];
  }
  if (lstatSync(pluginSkillsRoot).isSymbolicLink()) {
    report.push("plugins/oh-my-paper-codex/skills must not be a symbolic link");
  }
  for (const [target, expected] of files) {
    if (!existsSync(target)) {
      report.push(`${relativeToRepo(target)} is missing`);
      continue;
    }
    const actual = readFileSync(target);
    if (!actual.equals(Buffer.isBuffer(expected) ? expected : Buffer.from(expected))) {
      report.push(`${relativeToRepo(target)} differs from its canonical source`);
    }
  }
  return report;
}

function validatePluginMetadata(report) {
  try {
    const manifest = JSON.parse(readFileSync(pluginManifestPath, "utf8"));
    const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
    const marketplace = JSON.parse(readFileSync(marketplacePath, "utf8"));
    if (manifest.name !== "oh-my-paper-codex") report.push("plugin manifest has an unexpected name");
    if (!hasCurrentPluginVersion(manifest.version, packageJson.version)) {
      report.push("plugin manifest version must match package.json or use its +codex.<cachebuster> suffix");
    }
    if (manifest.skills !== "./skills/") report.push("plugin manifest must expose ./skills/");
    if (manifest.hooks !== "./hooks/hooks.json") report.push("plugin manifest must expose ./hooks/hooks.json");
    if (!marketplace.plugins?.some((plugin) => plugin?.name === manifest.name)) {
      report.push("marketplace manifest does not expose the Codex plugin");
    }
  } catch (error) {
    report.push(`invalid plugin or marketplace JSON: ${error.message}`);
  }
  validatePluginHooks(report);
}

function hasCurrentPluginVersion(version, packageVersion) {
  if (version === packageVersion) return true;
  const prefix = `${packageVersion}+codex.`;
  return typeof version === "string"
    && version.startsWith(prefix)
    && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(version.slice(prefix.length));
}

function validatePluginHooks(report) {
  try {
    const config = JSON.parse(readFileSync(pluginHooksPath, "utf8"));
    const unixRoot = "${CLAUDE_PLUGIN_ROOT}";
    const windowsRoot = "${CLAUDE_PLUGIN_ROOT}";
    const expected = [
      ["SessionStart", "on-session-start.mjs"],
      ["Stop", "on-task-complete.mjs"],
      ["PostToolUse", "on-stage-transition.mjs"],
    ];
    for (const [eventName, script] of expected) {
      const handler = config.hooks?.[eventName]?.[0]?.hooks?.[0];
      if (handler?.command !== `node "${unixRoot}/scripts/${script}"`) {
        report.push(`${eventName} hook must use ${unixRoot}`);
      }
      if (handler?.commandWindows !== `node "${windowsRoot}/scripts/${script}"`) {
        report.push(`${eventName} Windows hook must use ${windowsRoot}`);
      }
    }
  } catch (error) {
    report.push(`invalid Codex hook JSON: ${error.message}`);
  }
}

function* walkFiles(directory) {
  for (const entry of readdirSync(directory)) {
    const fullPath = path.join(directory, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      yield* walkFiles(fullPath);
    } else if (stats.isFile()) {
      yield fullPath;
    }
  }
}

function assertFile(filePath, label) {
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    throw new Error(`Missing ${label}: ${relativeToRepo(filePath)}`);
  }
}

function assertDirectory(directory, label) {
  if (!existsSync(directory) || !statSync(directory).isDirectory()) {
    throw new Error(`Missing ${label}: ${relativeToRepo(directory)}`);
  }
}

function relativeToRepo(filePath) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, "/");
}
