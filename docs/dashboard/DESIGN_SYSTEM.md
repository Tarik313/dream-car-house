# Dashboard design system

The design tokens strictly follow the Meta-inspired specifications: compact spacing, 4px radii, zero decorative container borders or drop shadows, 224px expanded / 56px collapsed sidebar, mobile overlay drawer, and ~52px topbar. Branding matches the project's Beg Autos identity with no ISSL or Meta branding.

## Design Tokens

| Token | Value | Use |
|---|---|---|
| `page` | `#f0f2f5` | Workspace canvas background |
| `surface` | `#ffffff` | Sidebar, topbar, cards, table cells |
| `text` | `#24272c` | Main body copy |
| `muted` | `#62666c` | Secondary copy, descriptions |
| `accent` | `#ff7101` | Brand orange; primary button and active indicator |
| `accent-text` | `#9c4300` | High-contrast links and focus outlines |
| `accent-soft` | `#fff1e6` | Active navigation, table row selection |
| `hover` | `#e9ecf0` | Hover states, table row hover, control borders |
| `danger` | `#a4262c` | Error alerts, danger badges, delete buttons |
| `radius` | `4px` | Strict 4px radius across all inputs, buttons, tables, dialogs |
| `spacing` | 4 / 8 / 12 / 16 / 24px | Compact spacing hierarchy (`--space-1` to `--space-6`) |
| `typography` | Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif | Clean, system fallback typography |

---

## Reusable UI Component System (`dashboard/components/ui/`)

All components are strictly typed, accessible, and share design tokens without page-specific duplicates:

1. **Button (`Button.tsx`)**: Primary (brand orange), secondary (`--hover`), danger, and ghost variants; loading spinner with `aria-busy`; accessible disabled state; left/right icon slots.
2. **FormField (`FormField.tsx`)**: Wraps controls with accessible `label`, optional `required` asterisk, description (`id-desc`), and live error message (`id-error`) with `role="alert"`.
3. **Input (`Input.tsx`) & Textarea (`Textarea.tsx`)**: Controlled and uncontrolled inputs with addon group slots, focus outlines, and error states.
4. **Select (`Select.tsx`)**: Accessible native select with custom styling and chevron indicator.
5. **Checkbox (`Checkbox.tsx`) & Switch (`Switch.tsx`)**: Accessible toggle controls with label/description layouts, indeterminate support, and keyboard focus outlines.
6. **Badge (`Badge.tsx`)**: Compact status badges (`neutral`, `accent`, `success`, `warning`, `danger`).
7. **Tabs (`Tabs.tsx`)**: Accessible tablist with `ArrowLeft`/`ArrowRight`/`Home`/`End` keyboard navigation and badge support.
8. **Dropdown (`Dropdown.tsx`)**: Accessible popup menu with `role="menu"`, outside click detection, and `Escape` dismissal.
9. **Tooltip (`Tooltip.tsx`)**: Hover and keyboard focus-within tooltip with accessible `role="tooltip"`.
10. **Dialog (`Dialog.tsx`)**: Native modal dialog with backdrop, `Escape` key handler, focus trap, and automatic focus restoration to the trigger button upon close.
11. **Drawer (`Drawer.tsx`)**: Slide-out overlay drawer (`left` or `right`), mobile responsive (fits 100dvh), with focus trapping and backdrop dismissal.
12. **Toast (`Toast.tsx`)**: Transient notification system (`ToastProvider` and `useToast()` hook) supporting `success`, `error`, `warning`, and `info`.
13. **Pagination (`Pagination.tsx`)**: Server-driven URL synchronization (`?page=...&page_size=...`) with previous/next controls and rows-per-page selector.
14. **FilterBar (`FilterBar.tsx`)**: URL query search and filter dropdowns. **Automatically resets `page=1`** whenever filters or search terms change to prevent empty paginated queries.
15. **Upload (`Upload.tsx`)**: Drag-and-drop file upload with format and file size validation, keyboard activation, and file removal list.

---

## Composable DataTable (`DataTable.tsx`)

A zero-heavy-dependency composable table supporting server-rendered initial rows and rich client interactions:
- **Sticky Header**: `position: sticky; top: 0; z-index: 2` with `--page` background.
- **Sticky Identifying Column**: Identifying/Name column is pinned left (`position: sticky; left: 40px; z-index: 2`) with opaque background and border separator. **It cannot be hidden or reordered away.**
- **Sticky Checkbox Column**: Positioned at `left: 0; width: 40px; z-index: 3` with opaque background.
- **Header/Identifying Intersection**: Top-left corner th cells receive `z-index: 3` ensuring underlying scrolled content never bleeds through or overlaps controls.
- **Horizontal Scrolling Containment**: Scrolling belongs exclusively inside `.ui-datatable-container` (`overflow-x: auto`), never breaking the viewport or expanding the page.
- **Selection Semantics**: Explicit row selection scope (`selectedIds`). Sorting or filtering changes automatically clear selections to prevent desynchronized batch operations.
- **Server Sorting**: URL parameter synchronization (`?ordering=field` or `?ordering=-field`) with sort indicators (`▲`, `▼`, `⇅`).
- **Column Visibility**: Dropdown toggle allowing toggling optional columns while strictly keeping the identifying column visible and pinned.
- **Permission-Aware Actions**: Batch action buttons filter against `userPermissions` before rendering.

---

## Responsive & Viewport Verification

- **360px (Mobile)**: Page layout is constrained to `100vw`. Sidebar transitions to overlay modal drawer with backdrop. FilterBar wraps neatly. Table scrolls horizontally within its own container without pushing page bounds.
- **768px (Tablet)**: Sidebar collapses to 56px icon mode or expands to 224px. Table retains sticky identifying column.
- **1440px (Desktop)**: Full 1200px max-width container, expanded sidebar, wide table display with no layout shifting.
- **Accessibility & Reduced Motion**: Visible focus indicator (`outline: 2px solid var(--accent-text)` with offset), native dialog focus traps, and transitions that respect reduced motion.
