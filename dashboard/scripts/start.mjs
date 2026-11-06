process.env.HOSTNAME = process.env.HOSTNAME_OVERRIDE || "127.0.0.1";
process.env.PORT = process.env.PORT || "3100";
await import("../.next/standalone/server.js");
