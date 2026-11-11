import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

function secretsMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) {
    // Compare equal-length dummy buffers to avoid timing leaks on length mismatch
    crypto.timingSafeEqual(Buffer.alloc(32), Buffer.alloc(32));
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

function collectRevalidationTargets(
  pathsInput: string[],
  tagsInput: string[]
): { paths: string[]; tags: string[] } {
  const paths = new Set<string>();
  for (const raw of pathsInput) {
    const trimmed = raw.trim();
    if (!trimmed || !trimmed.startsWith("/")) continue;
    paths.add(trimmed);
    if (trimmed !== "/" && !trimmed.endsWith("/")) {
      paths.add(`${trimmed}/`);
    }
  }

  const tags = new Set<string>();
  for (const raw of tagsInput) {
    const trimmed = raw.trim();
    if (trimmed) {
      tags.add(trimmed);
    }
  }

  return {
    paths: Array.from(paths),
    tags: Array.from(tags),
  };
}

function executeRevalidation(paths: string[], tags: string[]) {
  const targetPaths = paths.length > 0 || tags.length > 0 ? paths : ["/"];
  for (const p of targetPaths) {
    revalidatePath(p);
  }
  for (const t of tags) {
    revalidateTag(t, "max");
  }
  return {
    revalidated: true,
    paths: targetPaths,
    tags,
    timestamp: new Date().toISOString(),
  };
}

async function handleRevalidate(request: NextRequest, bodyPayload?: Record<string, unknown>) {
  const expectedSecret = process.env.REVALIDATE_SECRET?.trim() || "";
  if (!expectedSecret) {
    return NextResponse.json(
      { ok: false, error: "REVALIDATE_SECRET is not configured on frontend." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  const url = request.nextUrl;
  const authHeader = request.headers.get("authorization") || "";
  const bearerToken = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";

  const providedSecret =
    url.searchParams.get("secret") ||
    request.headers.get("x-revalidate-secret") ||
    bearerToken ||
    (typeof bodyPayload?.secret === "string" ? bodyPayload.secret : "");

  if (!providedSecret || !secretsMatch(providedSecret, expectedSecret)) {
    return NextResponse.json(
      { ok: false, error: "Invalid or missing revalidation secret." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const rawPaths = [
    ...url.searchParams.getAll("path"),
    ...(typeof bodyPayload?.path === "string" ? [bodyPayload.path] : []),
    ...(Array.isArray(bodyPayload?.paths)
      ? bodyPayload.paths.filter((v): v is string => typeof v === "string")
      : []),
  ];

  const rawTags = [
    ...url.searchParams.getAll("tag"),
    ...(typeof bodyPayload?.tag === "string" ? [bodyPayload.tag] : []),
    ...(Array.isArray(bodyPayload?.tags)
      ? bodyPayload.tags.filter((v): v is string => typeof v === "string")
      : []),
  ];

  const { paths, tags } = collectRevalidationTargets(rawPaths, rawTags);
  const result = executeRevalidation(paths, tags);

  return NextResponse.json(result, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(request: NextRequest) {
  return handleRevalidate(request);
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    const parsed = await request.json();
    if (parsed && typeof parsed === "object") {
      body = parsed as Record<string, unknown>;
    }
  } catch {
    body = {};
  }
  return handleRevalidate(request, body);
}

