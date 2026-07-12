#!/usr/bin/env node

import path from "node:path";
import { spawn } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const repoRoot = path.resolve(__dirname, "..");
export const PLUGIN_NAME = "oh-my-paper-codex";

export async function main(argv = process.argv.slice(2), environment = process.env) {
  const args = parseArgs(argv);
  const sourceDir = path.resolve(args.source ?? path.join(repoRoot, "plugins", PLUGIN_NAME));
  const marketplacePath = path.resolve(
    args.marketplace ?? path.join(repoRoot, ".agents", "plugins", "marketplace.json"),
  );
  const marketplaceRoot = marketplaceRootFromManifest(marketplacePath);
  const marketplace = await readMarketplace(marketplacePath);
  await assertPluginSource(sourceDir);

  const context = {
    cwd: path.resolve(args.cwd ?? repoRoot),
    command: args.codex ?? resolveCodexCommand(environment),
    environment: args.home ? { ...environment, CODEX_HOME: path.resolve(args.home) } : environment,
    marketplace,
    marketplacePath,
    marketplaceRoot,
  };

  if (args.command === "install") {
    await installPlugin(context);
  } else if (args.command === "status") {
    process.stdout.write(`${JSON.stringify(await pluginStatus(context), null, 2)}\n`);
  } else {
    await uninstallPlugin(context, args.removeMarketplace);
  }
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  if (!command || !["install", "status", "uninstall"].includes(command)) {
    throw new Error(
      "Usage: node scripts/manage-codex-plugin.mjs <install|status|uninstall> [--source <dir>] [--marketplace <root/.agents/plugins/marketplace.json>] [--cwd <dir>] [--home <codex-home>] [--codex <path>] [--remove-marketplace]",
    );
  }
  const parsed = { command, source: null, marketplace: null, cwd: null, home: null, codex: null, removeMarketplace: false };
  for (let index = 0; index < rest.length; index += 1) {
    const flag = rest[index];
    if (flag === "--remove-marketplace") {
      parsed.removeMarketplace = true;
      continue;
    }
    const key = { "--source": "source", "--marketplace": "marketplace", "--cwd": "cwd", "--home": "home", "--codex": "codex" }[flag];
    if (!key || !rest[index + 1]) throw new Error(`Unknown or incomplete option: ${flag}`);
    parsed[key] = rest[index + 1];
    index += 1;
  }
  return parsed;
}

async function assertPluginSource(sourceDir) {
  await access(path.join(sourceDir, ".codex-plugin", "plugin.json"));
  await access(path.join(sourceDir, "skills", "omp-sync", "SKILL.md"));
  await access(path.join(sourceDir, "hooks", "hooks.json"));
}

async function readMarketplace(marketplacePath) {
  const marketplace = JSON.parse(await readFile(marketplacePath, "utf8"));
  if (!marketplace?.name || !Array.isArray(marketplace.plugins)) {
    throw new Error(`Invalid marketplace manifest: ${marketplacePath}`);
  }
  if (!marketplace.plugins.some((plugin) => plugin?.name === PLUGIN_NAME)) {
    throw new Error(`${marketplacePath} does not contain ${PLUGIN_NAME}`);
  }
  return marketplace;
}

function marketplaceRootFromManifest(marketplacePath) {
  const pluginsDir = path.dirname(marketplacePath);
  const agentsDir = path.dirname(pluginsDir);
  if (
    path.basename(marketplacePath) !== "marketplace.json" ||
    path.basename(pluginsDir) !== "plugins" ||
    path.basename(agentsDir) !== ".agents"
  ) {
    throw new Error(
      `Marketplace manifest must be located at <root>/.agents/plugins/marketplace.json: ${marketplacePath}`,
    );
  }
  return path.dirname(agentsDir);
}

export async function installPlugin(context) {
  const marketplaces = await listMarketplaces(context);
  if (!marketplaceIsPresent(marketplaces, context.marketplace.name)) {
    await runCodex(context, ["plugin", "marketplace", "add", context.marketplaceRoot, "--json"]);
  }

  const plugins = await listPlugins(context);
  if (findPlugin(plugins, PLUGIN_NAME)?.installed) {
    await runCodex(context, ["plugin", "remove", `${PLUGIN_NAME}@${context.marketplace.name}`, "--json"]);
  }
  await runCodex(context, ["plugin", "add", `${PLUGIN_NAME}@${context.marketplace.name}`, "--json"]);
  const status = await pluginStatus(context);
  process.stdout.write(`${JSON.stringify(status, null, 2)}\n`);
  return status;
}

export async function uninstallPlugin(context, removeMarketplace = false) {
  const marketplaces = await listMarketplaces(context);
  if (marketplaceIsPresent(marketplaces, context.marketplace.name)) {
    const plugins = await listPlugins(context);
    if (findPlugin(plugins, PLUGIN_NAME)?.installed) {
      await runCodex(context, ["plugin", "remove", `${PLUGIN_NAME}@${context.marketplace.name}`, "--json"]);
    }
    if (removeMarketplace) {
      const remaining = await listPlugins(context);
      const otherPlugins = pluginEntries(remaining).filter((plugin) => plugin.name !== PLUGIN_NAME);
      if (otherPlugins.length > 0) {
        throw new Error(`Refusing to remove marketplace ${context.marketplace.name}: it still provides other plugins.`);
      }
      await runCodex(context, ["plugin", "marketplace", "remove", context.marketplace.name, "--json"]);
    }
  }
  process.stdout.write(`${JSON.stringify(await pluginStatus(context), null, 2)}\n`);
}

export async function pluginStatus(context) {
  const marketplaces = await listMarketplaces(context);
  const configured = marketplaceIsPresent(marketplaces, context.marketplace.name);
  const plugins = configured ? await listPlugins(context) : {};
  const plugin = findPlugin(plugins, PLUGIN_NAME);
  return {
    marketplace: {
      name: context.marketplace.name,
      configured,
      source: context.marketplaceRoot,
      manifest: context.marketplacePath,
    },
    plugin: {
      name: PLUGIN_NAME,
      available: Boolean(plugin),
      installed: Boolean(plugin?.installed),
      enabled: plugin?.enabled ?? null,
    },
    skills: {
      packaged: true,
      discovered: "unknown (verify in a new Codex session with /skills)",
    },
    hooks: {
      packaged: true,
      trusted: "unknown (review and trust with /hooks)",
    },
  };
}

async function listMarketplaces(context) {
  return runCodex(context, ["plugin", "marketplace", "list", "--json"]);
}

async function listPlugins(context) {
  return runCodex(context, ["plugin", "list", "--marketplace", context.marketplace.name, "--available", "--json"]);
}

function marketplaceIsPresent(listing, name) {
  return marketplaceEntries(listing).some((marketplace) => marketplace.name === name);
}

function marketplaceEntries(value) {
  if (Array.isArray(value)) return value;
  return Array.isArray(value?.marketplaces) ? value.marketplaces : [];
}

function pluginEntries(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.plugins)) return value.plugins;
  const entries = [
    ...(Array.isArray(value?.installed) ? value.installed : []),
    ...(Array.isArray(value?.available) ? value.available : []),
    ...marketplaceEntries(value).flatMap((marketplace) => marketplace.plugins ?? []),
  ];
  const seen = new Set();
  return entries.filter((plugin) => {
    const key = plugin?.pluginId ?? plugin?.id ?? plugin?.name;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function findPlugin(listing, name) {
  return pluginEntries(listing).find(
    (plugin) =>
      plugin?.name === name ||
      plugin?.id === name ||
      plugin?.pluginId === name ||
      plugin?.pluginId?.startsWith(`${name}@`),
  ) ?? null;
}

function resolveCodexCommand(environment) {
  return environment.OMP_CODEX_PATH || environment.CODEX_CLI_PATH || (process.platform === "win32" ? "codex.cmd" : "codex");
}

export async function runCodex(context, args) {
  const invocation = codexInvocation(context.command, args);
  const output = await new Promise((resolve, reject) => {
    const child = spawn(invocation.command, invocation.args, {
      cwd: context.cwd,
      env: context.environment,
      shell: false,
      windowsHide: true,
      windowsVerbatimArguments: process.platform === "win32" && invocation.command.toLowerCase() === "cmd.exe",
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`codex ${args.join(" ")} failed (${code}): ${stderr || stdout}`));
    });
  });
  const trimmed = output.stdout.trim();
  if (!trimmed) return {};
  try {
    return JSON.parse(trimmed);
  } catch {
    return { raw: trimmed };
  }
}

function codexInvocation(command, args) {
  if (process.platform === "win32" && /\.(?:cmd|bat)$/i.test(command)) {
    // Node's spawn cannot execute npm's Windows command shims directly when
    // shell is disabled. Invoke cmd.exe explicitly while keeping each
    // user-controlled argument quoted as one command argument.
    return {
      command: "cmd.exe",
      args: ["/d", "/s", "/c", `call ${[command, ...args].map(quoteWindowsArgument).join(" ")}`],
    };
  }
  return { command, args };
}

function quoteWindowsArgument(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

if (path.resolve(process.argv[1] ?? "") === __filename) {
  main().catch((error) => {
    process.stderr.write(`Error: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  });
}
