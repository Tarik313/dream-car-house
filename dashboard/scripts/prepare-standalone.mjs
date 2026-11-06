import { cpSync } from "node:fs";
const root = new URL("../", import.meta.url);
// Next's standalone trace omits these assets; local start needs them just as Docker does.
cpSync(new URL("public", root), new URL(".next/standalone/public", root), { recursive: true });
cpSync(new URL(".next/static", root), new URL(".next/standalone/.next/static", root), { recursive: true });
