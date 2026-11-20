#!/usr/bin/env node

import { runTask } from "../src/tasks.js";

runTask("generate", process.argv[2]);
