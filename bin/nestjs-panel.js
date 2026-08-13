#!/usr/bin/env node
"use strict";

const { existsSync } = require("fs");
const { join } = require("path");

const subcommand = process.argv[2];

if (subcommand !== "generate") {
  console.error("Usage: nestjs-panel generate");
  process.exit(1);
}

const jsEntry = join(__dirname, "..", "dist", "generator", "generate.js");

if (!existsSync(jsEntry)) {
  console.error(
    "[nestjs-panel] Generator not found. The package must be built before use.",
  );
  process.exit(1);
}

require(jsEntry);
