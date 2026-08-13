#!/usr/bin/env node
"use strict";

const { existsSync } = require("fs");
const { join } = require("path");

const subcommand = process.argv[2];

if (subcommand !== "generate") {
  console.error("Usage: nestjs-panel generate");
  process.exit(1);
}

const root = join(__dirname, "..");
const jsEntry = join(root, "generator", "generate.js");
const tsEntry = join(root, "generator", "generate.ts");

if (existsSync(jsEntry)) {
  require(jsEntry);
} else if (existsSync(tsEntry)) {
  require("ts-node/register");
  require(tsEntry);
} else {
  console.error("[nestjs-panel] Generator entry not found.");
  process.exit(1);
}
