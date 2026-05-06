#!/usr/bin/env node
import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const port = Number(args[args.indexOf("--port") + 1] || process.env.PORT || 4173);
const target = args[args.indexOf("--target") + 1] || process.env.SLEY_TARGET || ".";
const sleyBin = process.env.SLEY_BIN || "sley";
const root = resolve(new URL(".", import.meta.url).pathname);
const staticRoot = join(root, "static");

const commandCommands = {
  doctor: ["doctor", "--json"],
  verify: ["verify", "--json"],
  query: ["query", "--json", "--kind", "all"],
  lint: ["lint", "--json"],
  graph: ["graph", "--json"],
  plan: ["plan", "--json", "--graft-templates"],
  seal: ["seal", "--json"],
  zjx: ["zjx", "--json"],
  check: ["check", "--json"],
  format: ["format"],
};

function listCommands() {
  return Object.keys(commandCommands).map((name) => ({ name, args: commandCommands[name].slice() }));
}

function jsonError(message, status = 500) {
  return { status, ok: false, error: message };
}

function runCommand(name, targetOverride) {
  const args = commandCommands[name];
  if (!args) return jsonError(`unsupported command: ${name}`, 400);
  const result = spawnSync(sleyBin, [...args, targetOverride ?? target], { encoding: "utf8" });
  const output = result.stdout ?? "";
  let parsed = null;
  try {
    parsed = JSON.parse(output);
  } catch {
    parsed = output;
  }
  return {
    ok: result.status === 0,
    command: name,
    status: result.status,
    raw: output,
    parsed,
    stderr: result.stderr,
  };
}

function readText(targetPath) {
  const requestPath = resolve(targetPath);
  if (!requestPath.startsWith(resolve(target))) {
    return null;
  }
  try {
    const stats = statSync(requestPath);
    if (!stats.isFile()) return null;
    return statSync(requestPath).isFile() ? String(stats.size) : null;
  } catch {
    return null;
  }
}

function sendJson(res, obj, status = 200) {
  const text = JSON.stringify(obj, null, 2);
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(text);
}

function handleApi(url) {
  const command = url.searchParams.get("command") || "health";
  if (command === "health") return { status: "ok", version: VERSION };
  if (command === "commands") return { status: "ok", commands: listCommands() };
  if (command === "file-size") {
    const path = decodeURIComponent(url.searchParams.get("path") ?? "");
    if (!path) return jsonError("missing path", 400);
    const size = readText(path);
    return size == null ? jsonError("unreadable path", 404) : { status: "ok", path, size };
  }
  if (command === "run") {
    const name = url.searchParams.get("name");
    if (!name) return jsonError("missing command name", 400);
    const targetOverride = decodeURIComponent(url.searchParams.get("target") || target);
    return runCommand(name, targetOverride);
  }
  return jsonError(`unsupported api command ${command}`, 400);
}

function staticPath(urlPath) {
  const file = urlPath === "/" ? "index.html" : urlPath.slice(1);
  const path = resolve(join(staticRoot, file));
  if (!path.startsWith(staticRoot + "/") && path !== staticRoot + "/" + file) {
    throw new Error("invalid path");
  }
  return path;
}

const VERSION = "0.0.0-private";

export function startServer() {
  return createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname.startsWith("/api/")) {
      const apiCommand = url.pathname.replace("/api/", "");
      const body = handleApi(new URL(req.url, `http://localhost/api/${apiCommand}`));
      sendJson(res, body, body?.status && body.status >= 400 ? 400 : 200);
      return;
    }

    if (url.pathname === "/") {
      const path = join(staticRoot, "index.html");
      res.setHeader("content-type", "text/html");
      createReadStream(path).pipe(res);
      return;
    }

    try {
      const file = staticPath(url.pathname);
      const mime = extname(file) === ".css" ? "text/css" : extname(file) === ".js" ? "text/javascript" : "text/html";
      res.setHeader("content-type", mime);
      createReadStream(file).pipe(res);
    } catch {
      res.statusCode = 403;
      res.end("forbidden");
    }
  }).listen(port, () => {
    console.log(`sley-workbench listening on http://127.0.0.1:${port}`);
  });
}

if (process.argv.includes("--help")) {
  console.log("usage: sley-workbench --target <path> [--port 4173]");
} else if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
