import { test } from "node:test";
import assert from "node:assert/strict";
import { requestDashboard } from "../lib/server/transport";
import { validateSafeRedirect, hasPermission, type DashboardUser } from "../lib/server/auth";

const baseOptions = {
  origin: "http://127.0.0.1:8000",
  path: "access/" as const,
  cookie: "sessionid=test-session-id",
  decode: (data: unknown) => (typeof data === "string" ? data : undefined),
};

test("missing credentials or session cookie rejects without fetching", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", () => {
    throw Error("must not fetch");
  });
  const res = await requestDashboard({ ...baseOptions, cookie: undefined, credential: undefined });
  assert.equal(res.ok, false);
  assert.equal(!res.ok && res.error.code, "UNAUTHENTICATED");
  assert.equal(fetch.mock.callCount(), 0);
});

test("transport rejects bad configuration without fetching", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", () => {
    throw Error("must not fetch");
  });
  for (const origin of [undefined, "invalid", "ftp://host", "https://user:password@host", "https://host/api/"]) {
    const result = await requestDashboard({ ...baseOptions, origin });
    assert.equal(!result.ok && result.error.code, "CONFIGURATION");
  }
  assert.equal(fetch.mock.callCount(), 0);
});

test("HTTP errors and status codes normalize safely without leaking backend bodies", async (t) => {
  for (const [status, code] of [
    [401, "UNAUTHENTICATED"],
    [403, "FORBIDDEN"],
    [404, "NOT_FOUND"],
    [429, "THROTTLED"],
    [500, "UNAVAILABLE"],
  ] as const) {
    const mock = t.mock.method(
      globalThis,
      "fetch",
      async () => new Response("private-backend-detail", { status })
    );
    const result = await requestDashboard(baseOptions);
    assert.equal(!result.ok && result.error.code, code);
    assert.equal(JSON.stringify(result).includes("private-backend-detail"), false);
    mock.mock.restore();
  }
});

test("validates envelope and payload at runtime", async (t) => {
  for (const body of ["<html>", '{"success":false}', '{"success":true,"data":12}', "{}"]) {
    const mock = t.mock.method(globalThis, "fetch", async () => new Response(body));
    const result = await requestDashboard(baseOptions);
    assert.equal(!result.ok && result.error.code, "INVALID_RESPONSE");
    mock.mock.restore();
  }
  t.mock.method(globalThis, "fetch", async (_url: string | URL | Request, init?: RequestInit) => {
    assert.equal(init?.cache, "no-store");
    assert.equal(init?.redirect, "error");
    return Response.json({ success: true, data: "validated" });
  });
  assert.deepEqual(await requestDashboard(baseOptions), { ok: true, data: "validated", cookies: [] });
});

test("network failure and timeout are distinct", async (t) => {
  const mock = t.mock.method(globalThis, "fetch", async () => {
    throw Error("private host");
  });
  const result = await requestDashboard(baseOptions);
  assert.equal(!result.ok && result.error.code, "UNAVAILABLE");
  mock.mock.restore();

  t.mock.method(
    globalThis,
    "fetch",
    (_url: string | URL | Request, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () =>
          reject(new DOMException("aborted", "AbortError"))
        );
      })
  );
  const timeout = await requestDashboard({ ...baseOptions, timeoutMs: 10 });
  assert.equal(!timeout.ok && timeout.error.code, "TIMEOUT");
});

test("validateSafeRedirect prevents open redirects and allows relative paths", () => {
  assert.equal(validateSafeRedirect("/workspace"), "/workspace");
  assert.equal(validateSafeRedirect("/workspace?sort=id"), "/workspace?sort=id");
  assert.equal(validateSafeRedirect("https://evil.com"), "/workspace");
  assert.equal(validateSafeRedirect("//evil.com"), "/workspace");
  assert.equal(validateSafeRedirect("/\\evil.com"), "/workspace");
  assert.equal(validateSafeRedirect(null), "/workspace");
  assert.equal(validateSafeRedirect(undefined), "/workspace");
});

test("hasPermission verifies model permissions and superuser bypass", () => {
  const staffUser: DashboardUser = {
    id: 1,
    username: "staff",
    email: "staff@example.com",
    is_staff: true,
    is_superuser: false,
    permissions: ["inventory.view_inventory"],
  };

  const superUser: DashboardUser = {
    id: 2,
    username: "admin",
    email: "admin@example.com",
    is_staff: true,
    is_superuser: true,
    permissions: [],
  };

  assert.equal(hasPermission(staffUser, "inventory.view_inventory"), true);
  assert.equal(hasPermission(staffUser, "inventory.add_inventory"), false);
  assert.equal(hasPermission(superUser, "inventory.add_inventory"), true);
});

test("navigation items filter strictly according to user permissions", async () => {
  const { navigation } = await import("../lib/navigation");

  const readOnlyStockUser: DashboardUser = {
    id: 3,
    username: "stock_viewer",
    email: "stock@example.com",
    is_staff: true,
    is_superuser: false,
    permissions: ["inventory.view_stock"],
  };

  const allowedForStockUser = navigation.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(readOnlyStockUser, item.permission);
  });

  const allowedHrefs = allowedForStockUser.map((i) => i.href);
  assert.ok(allowedHrefs.includes("/workspace/stocks"));
  assert.ok(!allowedHrefs.includes("/workspace/quotes"));
  assert.ok(!allowedHrefs.includes("/workspace/inventory"));
  assert.ok(!allowedHrefs.includes("/workspace/brands"));
  assert.ok(!allowedHrefs.includes("/workspace/model-generations"));
  assert.ok(!allowedHrefs.includes("/workspace/body-styles"));

  const readOnlyBodyStyleUser: DashboardUser = {
    id: 16,
    username: "bodystyle_viewer",
    email: "bodystyle@example.com",
    is_staff: true,
    is_superuser: false,
    permissions: ["inventory.view_bodystyle"],
  };

  const allowedForBodyStyleUser = navigation.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(readOnlyBodyStyleUser, item.permission);
  }).map((i) => i.href);

  assert.ok(allowedForBodyStyleUser.includes("/workspace/body-styles"));
  assert.ok(!allowedForBodyStyleUser.includes("/workspace/stocks"));
  assert.ok(!allowedForBodyStyleUser.includes("/workspace/inventory"));
  assert.ok(!allowedForBodyStyleUser.includes("/workspace/brands"));

  const readOnlyQuoteUser: DashboardUser = {
    id: 4,
    username: "quote_viewer",
    email: "quotes@example.com",
    is_staff: true,
    is_superuser: false,
    permissions: ["inventory.view_inventoryquote"],
  };

  const allowedForQuoteUser = navigation.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(readOnlyQuoteUser, item.permission);
  }).map((i) => i.href);

  assert.ok(allowedForQuoteUser.includes("/workspace/quotes"));
  assert.ok(!allowedForQuoteUser.includes("/workspace/stocks"));
  assert.ok(!allowedForQuoteUser.includes("/workspace/inventory"));
  assert.ok(!allowedForQuoteUser.includes("/workspace/sell-cars"));

  const readOnlySellCarUser: DashboardUser = {
    id: 5,
    username: "sellcar_viewer",
    email: "sellcar@example.com",
    is_staff: true,
    is_superuser: false,
    permissions: ["home.view_sellcar"],
  };

  const allowedForSellCarUser = navigation.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(readOnlySellCarUser, item.permission);
  }).map((i) => i.href);

  assert.ok(allowedForSellCarUser.includes("/workspace/sell-cars"));
  assert.ok(!allowedForSellCarUser.includes("/workspace/stocks"));
  assert.ok(!allowedForSellCarUser.includes("/workspace/quotes"));
  assert.ok(!allowedForSellCarUser.includes("/workspace/inventory"));
  assert.ok(!allowedForSellCarUser.includes("/workspace/inbox/contact"));
  assert.ok(!allowedForSellCarUser.includes("/workspace/inbox/subscribers"));

  const readOnlyContactUser: DashboardUser = {
    id: 6,
    username: "contact_viewer",
    email: "contact@example.com",
    is_staff: true,
    is_superuser: false,
    permissions: ["home.view_contactmessage"],
  };

  const allowedForContactUser = navigation.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(readOnlyContactUser, item.permission);
  }).map((i) => i.href);

  assert.ok(allowedForContactUser.includes("/workspace/inbox/contact"));
  assert.ok(!allowedForContactUser.includes("/workspace/inbox/subscribers"));
  assert.ok(!allowedForContactUser.includes("/workspace/quotes"));

  const readOnlySubscriberUser: DashboardUser = {
    id: 7,
    username: "subscriber_viewer",
    email: "sub@example.com",
    is_staff: true,
    is_superuser: false,
    permissions: ["home.view_subscriber"],
  };

  const allowedForSubUser = navigation.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(readOnlySubscriberUser, item.permission);
  }).map((i) => i.href);

  assert.ok(allowedForSubUser.includes("/workspace/inbox/subscribers"));
  assert.ok(!allowedForSubUser.includes("/workspace/inbox/contact"));
  assert.ok(!allowedForSubUser.includes("/workspace/quotes"));

  const readOnlySliderUser: DashboardUser = {
    id: 8,
    username: "slider_viewer",
    email: "slider@example.com",
    is_staff: true,
    is_superuser: false,
    permissions: ["home.view_slider"],
  };

  const allowedForSliderUser = navigation.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(readOnlySliderUser, item.permission);
  }).map((i) => i.href);

  assert.ok(allowedForSliderUser.includes("/workspace/content/sliders"));
  assert.ok(!allowedForSliderUser.includes("/workspace/content/social-media"));
  assert.ok(!allowedForSliderUser.includes("/workspace/inventory"));

  const readOnlySocialMediaUser: DashboardUser = {
    id: 9,
    username: "sm_viewer",
    email: "sm@example.com",
    is_staff: true,
    is_superuser: false,
    permissions: ["home.view_socialmedia"],
  };

  const allowedForSmUser = navigation.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(readOnlySocialMediaUser, item.permission);
  }).map((i) => i.href);

  assert.ok(allowedForSmUser.includes("/workspace/content/social-media"));
  assert.ok(!allowedForSmUser.includes("/workspace/content/sliders"));
  assert.ok(!allowedForSmUser.includes("/workspace/inventory"));

  const readOnlySocialFeaturesUser: DashboardUser = {
    id: 10,
    username: "peopletalk_viewer",
    email: "peopletalk@example.com",
    is_staff: true,
    is_superuser: false,
    permissions: ["home.view_peopletalkaboutus"],
  };

  const allowedForFeaturesUser = navigation.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(readOnlySocialFeaturesUser, item.permission);
  }).map((i) => i.href);

  assert.ok(allowedForFeaturesUser.includes("/workspace/content/social-features"));
  assert.ok(!allowedForFeaturesUser.includes("/workspace/content/sales-representatives"));
  assert.ok(!allowedForFeaturesUser.includes("/workspace/content/sliders"));

  const readOnlySalesRepUser: DashboardUser = {
    id: 11,
    username: "salesrep_viewer",
    email: "salesrep@example.com",
    is_staff: true,
    is_superuser: false,
    permissions: ["home.view_salesrepresentative"],
  };

  const allowedForRepUser = navigation.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(readOnlySalesRepUser, item.permission);
  }).map((i) => i.href);

  assert.ok(allowedForRepUser.includes("/workspace/content/sales-representatives"));
  assert.ok(!allowedForRepUser.includes("/workspace/content/social-features"));
  assert.ok(!allowedForRepUser.includes("/workspace/inventory"));

  // Read-only Page SEO user
  const readOnlyPageSEOUser: DashboardUser = {
    id: 12,
    username: "pageseo_viewer",
    email: "pageseo@example.com",
    is_staff: true,
    is_superuser: false,
    permissions: ["seo_config.view_seoconfig"],
  };

  const allowedForPageSEOUser = navigation.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(readOnlyPageSEOUser, item.permission);
  }).map((i) => i.href);

  assert.ok(allowedForPageSEOUser.includes("/workspace/seo/pages"));
  assert.ok(!allowedForPageSEOUser.includes("/workspace/seo/categories"));
  assert.ok(!allowedForPageSEOUser.includes("/workspace/inventory"));

  // Read-only Category SEO user
  const readOnlyCategorySEOUser: DashboardUser = {
    id: 13,
    username: "catseo_viewer",
    email: "catseo@example.com",
    is_staff: true,
    is_superuser: false,
    permissions: ["seo_config.view_categorypageseo"],
  };

  const allowedForCategorySEOUser = navigation.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(readOnlyCategorySEOUser, item.permission);
  }).map((i) => i.href);

  assert.ok(allowedForCategorySEOUser.includes("/workspace/seo/categories"));
  assert.ok(!allowedForCategorySEOUser.includes("/workspace/seo/pages"));
  assert.ok(!allowedForCategorySEOUser.includes("/workspace/inventory"));

  // Read-only User Management user
  const readOnlyUserMgr: DashboardUser = {
    id: 14,
    username: "user_viewer",
    email: "user_viewer@example.com",
    is_staff: true,
    is_superuser: false,
    permissions: ["auth.view_user"],
  };

  const allowedForUserMgr = navigation.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(readOnlyUserMgr, item.permission);
  }).map((i) => i.href);

  assert.ok(allowedForUserMgr.includes("/workspace/users"));
  assert.ok(!allowedForUserMgr.includes("/workspace/groups"));
  assert.ok(!allowedForUserMgr.includes("/workspace/inventory"));

  // Read-only Group Management user
  const readOnlyGroupMgr: DashboardUser = {
    id: 15,
    username: "group_viewer",
    email: "group_viewer@example.com",
    is_staff: true,
    is_superuser: false,
    permissions: ["auth.view_group"],
  };

  const allowedForGroupMgr = navigation.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(readOnlyGroupMgr, item.permission);
  }).map((i) => i.href);

  assert.ok(allowedForGroupMgr.includes("/workspace/groups"));
  assert.ok(!allowedForGroupMgr.includes("/workspace/users"));
  assert.ok(!allowedForGroupMgr.includes("/workspace/inventory"));

  // Superuser sees all navigation items
  const superUser: DashboardUser = {
    id: 2,
    username: "admin",
    email: "admin@example.com",
    is_staff: true,
    is_superuser: true,
    permissions: [],
  };

  const allowedForAdmin = navigation.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(superUser, item.permission);
  });
  assert.equal(allowedForAdmin.length, navigation.length);
});

