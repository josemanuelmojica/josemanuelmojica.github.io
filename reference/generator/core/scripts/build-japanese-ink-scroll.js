#!/usr/bin/env node
process.env.COLLECTION_CONFIG = "design/japanese-ink-scroll.json";
process.env.COLLECTION_OUTPUT = "public/maps/japanese-ink-scroll";
await import("./build-city-collection.js");
