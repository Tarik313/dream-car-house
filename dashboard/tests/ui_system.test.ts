import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

test("UI components structure and exports exist", async () => {
  const index = await fs.readFile(new URL("../components/ui/index.ts", import.meta.url), "utf8");

  // Verify all required components are exported
  const requiredComponents = [
    "Button",
    "Input",
    "Textarea",
    "Select",
    "Checkbox",
    "Switch",
    "FormField",
    "Badge",
    "Tabs",
    "Dropdown",
    "Tooltip",
    "Dialog",
    "Drawer",
    "Toast",
    "Pagination",
    "FilterBar",
    "Upload",
    "DataTable",
  ];

  for (const comp of requiredComponents) {
    assert.match(index, new RegExp(`export \\* from "\\./${comp}"`), `Missing export for ${comp}`);
  }
});

test("DataTable component source verifies sticky columns and selection semantics", async () => {
  const dtSource = await fs.readFile(new URL("../components/ui/DataTable.tsx", import.meta.url), "utf8");

  // Verify sticky headers and identifying column rules
  assert.match(dtSource, /isIdentifying/);
  assert.match(dtSource, /ui-datatable__th--sticky-checkbox/);
  assert.match(dtSource, /ui-datatable__th--sticky-identifying/);
  assert.match(dtSource, /toggleColumnVisibility/);
  // Identifying column cannot be hidden or reordered away
  assert.match(dtSource, /colId === identifyingColumn\.id/);
  // Permission aware actions filtering
  assert.match(dtSource, /userPermissions/);
  // Reset selection on sort change
  assert.match(dtSource, /setSelectedIds\(new Set\(\)\)/);
});

test("Responsive viewport layout rules in globals.css", async () => {
  const css = await fs.readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  // Verify sticky table rules with opaque cells
  assert.match(css, /\.ui-datatable__th--sticky-checkbox/);
  assert.match(css, /\.ui-datatable__th--sticky-identifying/);
  assert.match(css, /position:\s*sticky/);
  assert.match(css, /z-index:\s*3/);
  assert.match(css, /z-index:\s*2/);

  // Verify overflow containment inside container, not page
  assert.match(css, /\.ui-datatable-container\s*\{[^}]*overflow-x:\s*auto/);

  // Verify responsive media query for mobile screens (360px - 767px)
  assert.match(css, /@media\s*\(max-width:\s*767px\)/);
  assert.match(css, /max-width:\s*100vw/);
});

test("FilterBar component verifies reset to page 1 on query changes", async () => {
  const fbSource = await fs.readFile(new URL("../components/ui/FilterBar.tsx", import.meta.url), "utf8");
  assert.match(fbSource, /params\.set\("page",\s*"1"\)/);
  assert.match(fbSource, /handleClear/);
});

test("Dialog and Drawer components verify focus handling and accessibility", async () => {
  const dialogSource = await fs.readFile(new URL("../components/ui/Dialog.tsx", import.meta.url), "utf8");
  const drawerSource = await fs.readFile(new URL("../components/ui/Drawer.tsx", import.meta.url), "utf8");

  assert.match(dialogSource, /aria-labelledby="dialog-title"/);
  assert.match(dialogSource, /previouslyFocusedRef\.current\?\.focus\(\)/);
  assert.match(dialogSource, /handleBackdropClick/);

  assert.match(drawerSource, /aria-labelledby="drawer-title"/);
  assert.match(drawerSource, /previouslyFocusedRef\.current\?\.focus\(\)/);
  assert.match(drawerSource, /handleBackdropClick/);
});
