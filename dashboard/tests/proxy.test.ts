import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { proxy } from "../proxy";
import { verifyDashboardSession } from "../lib/server/session";

test("unauthenticated request to /workspace returns 307 redirect to /login?next=/workspace without hitting backend", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", () => {
    throw new Error("should not call backend without sessionid cookie");
  });

  const req = new NextRequest("http://127.0.0.1:3100/workspace", {
    headers: {
      host: "127.0.0.1:3100",
    },
  });
  const res = await proxy(req);

  assert.equal(res.status, 307);
  assert.equal(
    res.headers.get("location"),
    "http://127.0.0.1:3100/login?next=%2Fworkspace"
  );
  assert.equal(fetchMock.mock.callCount(), 0);
});

test("unauthenticated request to nested /workspace route respects forwarded headers", async (t) => {
  t.mock.method(globalThis, "fetch", () => {
    throw new Error("should not fetch");
  });

  const req = new NextRequest("http://0.0.0.0:3100/workspace/inventory?tab=draft", {
    headers: {
      host: "dreamcarhouse.com",
      "x-forwarded-proto": "https",
    },
  });
  const res = await proxy(req);

  assert.equal(res.status, 307);
  assert.equal(
    res.headers.get("location"),
    "https://dreamcarhouse.com/login?next=%2Fworkspace%2Finventory%3Ftab%3Ddraft"
  );
});

test("rejected or non-staff session returns 307 redirect", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    Response.json({
      success: true,
      data: {
        user: {
          id: 7,
          username: "viewer",
          email: "viewer@example.com",
          is_staff: false,
          is_superuser: false,
          permissions: [],
        },
      },
    })
  );

  const req = new NextRequest("http://127.0.0.1:3100/workspace/settings", {
    headers: {
      host: "127.0.0.1:3100",
      cookie: "sessionid=nonstaff-token",
    },
  });
  const res = await proxy(req);

  assert.equal(res.status, 307);
  assert.equal(
    res.headers.get("location"),
    "http://127.0.0.1:3100/login?next=%2Fworkspace%2Fsettings"
  );
});

test("verified staff session passes through proxy", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    Response.json({
      success: true,
      data: {
        user: {
          id: 1,
          username: "admin",
          email: "admin@dreamcarhouse.com",
          is_staff: true,
          is_superuser: true,
          permissions: ["*"],
        },
      },
    })
  );

  const req = new NextRequest("http://127.0.0.1:3100/workspace", {
    headers: {
      host: "127.0.0.1:3100",
      cookie: "sessionid=valid-staff-session; csrftoken=csrf123",
    },
  });
  const res = await proxy(req);

  assert.equal(res.status, 200);
  assert.equal(res.headers.get("x-middleware-next"), "1");
});

test("verifyDashboardSession fails closed on blank sessionid", async () => {
  const res = await verifyDashboardSession({ sessionid: "   " });
  assert.equal(res.allowed, false);
  if (!res.allowed) {
    assert.equal(res.reason, "UNAUTHENTICATED");
  }
});

