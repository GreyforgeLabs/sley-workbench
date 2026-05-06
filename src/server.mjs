#!/usr/bin/env node
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const port = Number(args[args.indexOf("--port") + 1] || process.env.PORT || 4173);
const target = args[args.indexOf("--target") + 1] || process.env.SLEY_TARGET || ".";
const sleyBin = process.env.SLEY_BIN || "sley";

function runSley(command) {
  const allowed = {
    doctor: ["doctor", "--json", target],
    verify: ["verify", "--json", target],
    query: ["query", "--json", "--kind", "all", target],
    lint: ["lint", "--json", target],
    graph: ["graph", "--json", target],
    plan: ["plan", "--json", "--graft-templates", target],
    seal: ["seal", "--json", target],
    zjx: ["zjx", "--json", target],
  };
  if (!allowed[command]) return { ok: false, error: "unsupported command" };
  const result = spawnSync(sleyBin, allowed[command], { encoding: "utf8" });
  return { ok: result.status === 0, status: result.status, stdout: result.stdout, stderr: result.stderr };
}

export function startServer() {
  return createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname.startsWith("/api/")) {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify(runSley(url.pathname.slice(5))));
      return;
    }
    const file = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
    const path = join("static", file);
    const type = extname(path) === ".css" ? "text/css" : extname(path) === ".js" ? "text/javascript" : "text/html";
    res.setHeader("content-type", type);
    res.end(readFileSync(path));
  }).listen(port, () => {
    console.log(`sley-workbench listening on http://127.0.0.1:${port}`);
  });
}

if (process.argv.includes("--help")) {
  console.log("usage: sley-workbench --target <path> [--port 4173]");
} else if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
