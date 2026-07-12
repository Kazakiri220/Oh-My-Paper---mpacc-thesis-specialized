import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, chmodSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manager = path.join(repoRoot, "scripts", "manage-codex-plugin.mjs");
const marketplace = path.join(repoRoot, ".agents", "plugins", "marketplace.json");
const source = path.join(repoRoot, "plugins", "oh-my-paper-codex");
const temp = mkdtempSync(path.join(os.tmpdir(), "omp-codex-plugin-test-"));
const log = path.join(temp, "codex-args.log");
const fakeCodex = path.join(temp, process.platform === "win32" ? "codex.cmd" : "codex");

try {
  writeFakeCodex({});

  const install = runManager("install");
  assert.equal(install.status, 0, install.stderr);

  const commands = readFileSync(log, "utf8");
  assert.match(commands, /"plugin" "marketplace" "add"/);
  assert.ok(commands.includes(repoRoot), commands);
  assert.doesNotMatch(commands, /marketplace\.json/);
  assert.match(commands, /"plugin" "add" "oh-my-paper-codex@oh-my-paper-codex"/);
  assert.doesNotMatch(commands, /app-server/);

  writeFileSync(log, "");
  writeFakeCodex({
    marketplaces: [{ name: "oh-my-paper-codex" }],
    installed: [{ pluginId: "oh-my-paper-codex@oh-my-paper-codex", name: "oh-my-paper-codex", installed: true }],
    available: [],
  });
  const uninstall = runManager("uninstall", "--remove-marketplace");
  assert.equal(uninstall.status, 0, uninstall.stderr);

  const uninstallCommands = readFileSync(log, "utf8");
  assert.match(uninstallCommands, /"plugin" "remove" "oh-my-paper-codex@oh-my-paper-codex"/);
  assert.match(uninstallCommands, /"plugin" "marketplace" "remove" "oh-my-paper-codex"/);

  writeFileSync(log, "");
  writeFakeCodex({
    marketplaces: [{ name: "oh-my-paper-codex" }],
    installed: [{ pluginId: "oh-my-paper-codex@oh-my-paper-codex", name: "oh-my-paper-codex", installed: true }],
    available: [{ pluginId: "another-plugin@oh-my-paper-codex", name: "another-plugin", installed: false }],
  });
  const protectedUninstall = runManager("uninstall", "--remove-marketplace");
  assert.notEqual(protectedUninstall.status, 0, "must preserve a marketplace with other plugins");
  assert.match(protectedUninstall.stderr, /Refusing to remove marketplace/);
  const protectedCommands = readFileSync(log, "utf8");
  assert.match(protectedCommands, /"plugin" "remove" "oh-my-paper-codex@oh-my-paper-codex"/);
  assert.doesNotMatch(protectedCommands, /"plugin" "marketplace" "remove" "oh-my-paper-codex"/);
  process.stdout.write("Codex plugin install/uninstall fake-CLI test passed.\n");
} finally {
  rmSync(temp, { recursive: true, force: true });
}

function writeFakeCodex(response) {
  const json = JSON.stringify(response);
  if (process.platform === "win32") {
    writeFileSync(fakeCodex, `@echo off\r\necho %*>> "%OMP_CODEX_FAKE_LOG%"\r\necho ${json}\r\n`);
    return;
  }
  writeFileSync(
    fakeCodex,
    `#!/bin/sh\nprintf '%s\\n' "$*" >> "$OMP_CODEX_FAKE_LOG"\nprintf '%s\\n' '${json}'\n`,
  );
  chmodSync(fakeCodex, 0o755);
}

function runManager(command, ...args) {
  return spawnSync(
    process.execPath,
    [manager, command, ...args, "--codex", fakeCodex, "--source", source, "--marketplace", marketplace, "--cwd", repoRoot],
    {
      cwd: repoRoot,
      env: { ...process.env, OMP_CODEX_FAKE_LOG: log },
      encoding: "utf8",
    },
  );
}
