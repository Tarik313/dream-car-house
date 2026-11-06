"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  Switch,
  FormField,
  Badge,
  Tabs,
  Dropdown,
  Tooltip,
  Dialog,
  Drawer,
  ToastProvider,
  useToast,
  Pagination,
  FilterBar,
  Upload,
  DataTable,
  type ColumnDef,
} from "@/components/ui";

interface SampleVehicle {
  id: number;
  title: string;
  brand: string;
  model: string;
  year: number;
  mileage: string;
  price: string;
  status: "Available" | "Sold" | "Reserved";
}

const SAMPLE_VEHICLES: readonly SampleVehicle[] = [
  {
    id: 1,
    title: "Mercedes-Benz G63 AMG Magno Edition",
    brand: "Mercedes-Benz",
    model: "G-Class",
    year: 2024,
    mileage: "1,200 km",
    price: "৳ 42,000,000",
    status: "Available",
  },
  {
    id: 2,
    title: "Range Rover Autobiography LWB 4.4L",
    brand: "Land Rover",
    model: "Range Rover",
    year: 2023,
    mileage: "8,500 km",
    price: "৳ 38,500,000",
    status: "Reserved",
  },
  {
    id: 3,
    title: "Porsche Cayenne Turbo GT V8",
    brand: "Porsche",
    model: "Cayenne",
    year: 2024,
    mileage: "2,400 km",
    price: "৳ 35,000,000",
    status: "Available",
  },
  {
    id: 4,
    title: "BMW 740Li M Sport Pure Excellence",
    brand: "BMW",
    model: "7 Series",
    year: 2022,
    mileage: "14,000 km",
    price: "৳ 24,000,000",
    status: "Sold",
  },
  {
    id: 5,
    title: "Toyota Land Cruiser LC300 ZX Twin-Turbo",
    brand: "Toyota",
    model: "Land Cruiser",
    year: 2023,
    mileage: "6,000 km",
    price: "৳ 28,500,000",
    status: "Available",
  },
];

function PreviewContent() {
  const { showToast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(true);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [activeTab, setActiveTab] = useState("table");

  const columns: ColumnDef<SampleVehicle>[] = [
    {
      id: "title",
      header: "Vehicle Name",
      isIdentifying: true,
      sortable: true,
      width: "280px",
      cell: (row) => <span>{row.title}</span>,
    },
    {
      id: "brand",
      header: "Brand",
      sortable: true,
      cell: (row) => <span>{row.brand}</span>,
    },
    {
      id: "year",
      header: "Year",
      sortable: true,
      cell: (row) => <span>{row.year}</span>,
    },
    {
      id: "mileage",
      header: "Mileage",
      cell: (row) => <span>{row.mileage}</span>,
    },
    {
      id: "price",
      header: "Price",
      sortable: true,
      cell: (row) => <strong>{row.price}</strong>,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <Badge
          variant={
            row.status === "Available"
              ? "success"
              : row.status === "Reserved"
              ? "warning"
              : "neutral"
          }
        >
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Tab Navigation */}
      <Tabs
        items={[
          { id: "table", label: "DataTable & Filters", badge: <Badge variant="accent">Core</Badge> },
          { id: "forms", label: "Form Controls" },
          { id: "overlays", label: "Modals & Feedback" },
        ]}
        activeId={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "table" && (
        <section aria-label="DataTable demonstration" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <h2>Sticky Composable DataTable</h2>
            <p className="muted">
              Features sticky headers, sticky identifying column with checkbox offset, server sort indicators, and permission-aware actions.
            </p>
          </div>

          <FilterBar
            searchPlaceholder="Search vehicles by brand or model…"
            filters={[
              {
                param: "status",
                label: "Status",
                placeholder: "All statuses",
                options: [
                  { value: "available", label: "Available" },
                  { value: "reserved", label: "Reserved" },
                  { value: "sold", label: "Sold" },
                ],
              },
            ]}
          />

          <DataTable
            columns={columns}
            data={SAMPLE_VEHICLES}
            userPermissions={["inventory.change_inventory", "inventory.delete_inventory"]}
            actions={[
              {
                id: "export",
                label: "Export Selected",
                onClick: (rows) =>
                  showToast({
                    type: "info",
                    title: "Export Triggered",
                    message: `Exporting ${rows.length} vehicle(s).`,
                  }),
              },
              {
                id: "delete",
                label: "Delete Selected",
                danger: true,
                permission: "inventory.delete_inventory",
                onClick: (rows) =>
                  showToast({
                    type: "error",
                    title: "Delete Action",
                    message: `Marked ${rows.length} vehicle(s) for deletion.`,
                  }),
              },
            ]}
          />

          <Pagination currentPage={1} totalPages={3} totalRows={15} pageSize={5} />
        </section>
      )}

      {activeTab === "forms" && (
        <section aria-label="Form controls demonstration" className="form-card" style={{ maxWidth: "600px" }}>
          <h2>Form Controls & Validation</h2>
          <p className="muted" style={{ marginBottom: "var(--space-4)" }}>
            Compact 4px radii controls adhering strictly to project design tokens.
          </p>

          <FormField id="vehicle-title" label="Vehicle Title" required description="Appears in main inventory listings.">
            <Input id="vehicle-title" placeholder="e.g. Mercedes-Benz G63 AMG" />
          </FormField>

          <FormField id="vehicle-brand" label="Brand" required>
            <Select
              id="vehicle-brand"
              placeholder="Select brand…"
              options={[
                { value: "mercedes", label: "Mercedes-Benz" },
                { value: "bmw", label: "BMW" },
                { value: "porsche", label: "Porsche" },
              ]}
            />
          </FormField>

          <FormField id="vehicle-notes" label="Inspection Notes">
            <Textarea id="vehicle-notes" placeholder="Enter condition and grading details…" />
          </FormField>

          <div style={{ display: "flex", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
            <Checkbox
              id="feature-cb"
              label="Feature on homepage"
              checked={checkboxChecked}
              onChange={(e) => setCheckboxChecked(e.target.checked)}
            />
            <Switch
              id="publish-sw"
              label="Published"
              checked={switchChecked}
              onChange={(e) => setSwitchChecked(e.target.checked)}
            />
          </div>

          <FormField id="media-upload" label="Upload Vehicle Images">
            <Upload accept="image/jpeg,image/png,image/webp" multiple maxSizeBytes={5 * 1024 * 1024} />
          </FormField>
        </section>
      )}

      {activeTab === "overlays" && (
        <section aria-label="Overlays and feedback demonstration" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <h2>Dialogs, Drawers & Feedback</h2>
          <p className="muted">
            Accessible dialogs with focus-trapping, backdrop handling, and transient toast feedback.
          </p>

          <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
            <Button variant="primary" onClick={() => setDialogOpen(true)}>
              Open Confirmation Dialog
            </Button>
            <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
              Open Side Drawer
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                showToast({
                  type: "success",
                  title: "Inventory Saved",
                  message: "Record has been updated successfully.",
                })
              }
            >
              Show Success Toast
            </Button>
            <Button
              variant="danger"
              onClick={() =>
                showToast({
                  type: "error",
                  title: "Action Denied",
                  message: "You do not hold permission for this operation.",
                })
              }
            >
              Show Error Toast
            </Button>
            <Tooltip content="Tooltip assistive hint">
              <Button variant="ghost">Hover or Focus for Tooltip</Button>
            </Tooltip>
            <Dropdown
              trigger={<Button variant="ghost">Actions Dropdown ▾</Button>}
              items={[
                { id: "edit", label: "Edit Record", onClick: () => showToast({ type: "info", title: "Edit clicked" }) },
                { id: "del", label: "Delete Record", danger: true, onClick: () => showToast({ type: "error", title: "Delete clicked" }) },
              ]}
            />
          </div>

          {/* Dialog */}
          <Dialog
            isOpen={dialogOpen}
            onClose={() => setDialogOpen(false)}
            title="Confirm Vehicle Archive"
            description="Are you sure you want to archive this vehicle record? It will be removed from public listings."
            actions={
              <>
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setDialogOpen(false);
                    showToast({ type: "warning", title: "Vehicle Archived" });
                  }}
                >
                  Confirm Archive
                </Button>
              </>
            }
          >
            <p>Archived vehicles retain their canonical URL history and slugs in the database.</p>
          </Dialog>

          {/* Drawer */}
          <Drawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            title="Filter Vehicle Attributes"
            description="Refine inventory records across custom specifications."
            actions={
              <Button variant="primary" onClick={() => setDrawerOpen(false)}>
                Apply Filters
              </Button>
            }
          >
            <FormField id="drawer-fuel" label="Fuel Type">
              <Select
                id="drawer-fuel"
                placeholder="All fuel types"
                options={[
                  { value: "octane", label: "Octane" },
                  { value: "hybrid", label: "Hybrid" },
                  { value: "electric", label: "Electric" },
                ]}
              />
            </FormField>
          </Drawer>
        </section>
      )}
    </div>
  );
}

export function ComponentPreview() {
  return (
    <ToastProvider>
      <PreviewContent />
    </ToastProvider>
  );
}
