import { spawn } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const projects = ["backend", "frontend"];

const children = projects.map((project) =>
  spawn(npmCommand, ["--prefix", project, "run", "dev"], {
    stdio: "inherit",
    shell: false,
  }),
);

function shutdown() {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
}

for (const child of children) {
  child.on("exit", (code) => {
    if (code && code !== 0) {
      shutdown();
      process.exitCode = code;
    }
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
