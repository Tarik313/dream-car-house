"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Upload } from "@/components/ui/Upload";
import { Tabs } from "@/components/ui/Tabs";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";
import {
  createInventoryAction,
  updateInventoryAction,
  uploadInventoryGalleryImageAction,
  deleteInventoryGalleryImageAction,
  batchUpdateGalleryImagesAction,
} from "@/app/actions/inventory";
import { ArrowUp, ArrowDown, Trash2, ArrowLeft, Save } from "lucide-react";
import type {
  InventoryDetailItem,
  BrandItem,
  ModelGenerationItem,
  BodyStyleItem,
  ShowroomBranchItem,
  InventoryGalleryImage,
} from "@/lib/types";

export function InventoryFormClient({
  initialCar,
  brands,
  allModels,
  bodyStyles,
  branches = [],
}: {
  initialCar?: InventoryDetailItem;
  brands: BrandItem[];
  allModels: ModelGenerationItem[];
  bodyStyles: BodyStyleItem[];
  branches?: ShowroomBranchItem[];
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const isEdit = !!initialCar;
  const [activeTab, setActiveTab] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Cascading Brand -> Model relationship state
  const [selectedBrandId, setSelectedBrandId] = useState<string>(
    initialCar?.brand ? String(initialCar.brand) : brands[0]?.id ? String(brands[0].id) : ""
  );

  const [selectedModelId, setSelectedModelId] = useState<string>(
    initialCar?.model ? String(initialCar.model) : ""
  );

  // Showroom Branch association state
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    initialCar?.branch ? String(initialCar.branch) : ""
  );

  // Pricing & presentation state
  const [isCallForPrice, setIsCallForPrice] = useState<boolean>(
    initialCar?.is_call_for_price ?? false
  );
  const [registrationNumber, setRegistrationNumber] = useState<string>(
    initialCar?.registration_number ?? ""
  );

  const [isFeatured, setIsFeatured] = useState<boolean>(initialCar?.is_featured ?? false);

  const [schemaText, setSchemaText] = useState(
    initialCar?.schema_override ? JSON.stringify(initialCar.schema_override, null, 2) : ""
  );

  // Gallery state for edit mode
  const [galleryImages, setGalleryImages] = useState<InventoryGalleryImage[]>(
    initialCar?.inventory_images || []
  );
  const [pendingDeletions, setPendingDeletions] = useState<number[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [gallerySaving, setGallerySaving] = useState(false);

  // Filter model choices dynamically by selectedBrandId
  const filteredModels = useMemo(() => {
    if (!selectedBrandId) return [];
    return allModels.filter((m) => String(m.brand) === selectedBrandId);
  }, [allModels, selectedBrandId]);

  const handleBrandChange = (brandId: string) => {
    setSelectedBrandId(brandId);
    // If current selectedModelId does not belong to new brand, reset model
    const stillValid = allModels.some(
      (m) => String(m.id) === selectedModelId && String(m.brand) === brandId
    );
    if (!stillValid) {
      setSelectedModelId("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    formData.set("is_featured", isFeatured ? "true" : "false");
    formData.set("is_call_for_price", isCallForPrice ? "true" : "false");
    formData.set("registration_number", registrationNumber.trim());
    formData.set("brand", selectedBrandId);
    formData.set("branch", selectedBranchId || "");
    formData.set("model", selectedModelId || "");

    const featImg = formData.get("feature_image");
    if (featImg instanceof File && featImg.size === 0) {
      formData.delete("feature_image");
    }

    // Validate JSON-LD override
    if (schemaText.trim()) {
      try {
        JSON.parse(schemaText);
        formData.set("schema_override", schemaText.trim());
      } catch {
        setSubmitting(false);
        setFieldErrors({ schema_override: "Invalid JSON-LD schema syntax." });
        showToast("Invalid JSON syntax in Schema Override.", "error");
        return;
      }
    } else {
      formData.set("schema_override", "");
    }

    let res;
    if (isEdit && initialCar) {
      res = await updateInventoryAction(initialCar.id, formData);
    } else {
      res = await createInventoryAction(formData);
    }
    setSubmitting(false);

    if (res.ok) {
      showToast(isEdit ? "Vehicle updated successfully." : "Vehicle created successfully.", "success");
      if (!isEdit && res.data?.id) {
        router.push(`/workspace/inventory/${res.data.id}`);
      } else {
        router.refresh();
      }
    } else {
      if (res.error.fieldErrors) {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(res.error.fieldErrors)) {
          flat[k] = Array.isArray(v) ? (v[0] ?? "") : String(v);
        }
        setFieldErrors(flat);
      }
      showToast(res.error.message || "Failed to save vehicle.", "error");
    }
  };

  const handleUploadGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!initialCar || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.set("image", file);

    setGalleryUploading(true);
    const res = await uploadInventoryGalleryImageAction(initialCar.id, formData);
    setGalleryUploading(false);

    if (res.ok) {
      showToast("Gallery image uploaded.", "success");
      setGalleryImages((prev) => [...prev, res.data]);
    } else {
      showToast(res.error.message || "Failed to upload gallery image.", "error");
    }
    // reset input
    e.target.value = "";
  };

  const handleMoveGalleryImage = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= galleryImages.length) return;
    const itemA = galleryImages[index];
    const itemB = galleryImages[targetIndex];
    if (!itemA || !itemB) return;
    const next = [...galleryImages];
    next[index] = itemB;
    next[targetIndex] = itemA;
    const reordered = next.map((img, idx) => ({ ...img, order: idx + 1 }));
    setGalleryImages(reordered);
  };

  const handleUpdateGalleryField = (
    id: number,
    field: "order" | "alt_text" | "caption" | "tag",
    val: string | number
  ) => {
    setGalleryImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, [field]: val } : img))
    );
  };

  const handleStageGalleryDelete = (imageId: number) => {
    setGalleryImages((prev) => prev.filter((img) => img.id !== imageId));
    setPendingDeletions((prev) => (prev.includes(imageId) ? prev : [...prev, imageId]));
  };

  const handleSaveGalleryBatch = async () => {
    if (!initialCar) return;
    setGallerySaving(true);
    const updates = galleryImages.map((img, idx) => ({
      id: img.id,
      order: typeof img.order === "number" ? img.order : idx + 1,
      alt_text: img.alt_text || "",
      caption: img.caption || "",
      tag: img.tag || "",
    }));

    const res = await batchUpdateGalleryImagesAction(initialCar.id, updates, pendingDeletions);
    setGallerySaving(false);
    if (res.ok) {
      showToast("Gallery saved successfully.", "success");
      setPendingDeletions([]);
      router.refresh();
    } else {
      showToast(res.error.message || "Failed to update gallery.", "error");
    }
  };

  const brandOptions = brands.map((b) => ({ label: b.name, value: String(b.id) }));
  const branchOptions = [
    { label: "-- Unassigned (Global / Main) --", value: "" },
    ...branches.map((b) => ({ label: `${b.name} (${b.branch_id || b.short_name || b.id})`, value: String(b.id) })),
  ];
  const modelOptions = [
    { label: "-- Select Model Generation --", value: "" },
    ...filteredModels.map((m) => ({ label: m.model, value: String(m.id) })),
  ];
  const bodyStyleOptions = [
    { label: "-- Select Body Style --", value: "" },
    ...bodyStyles.map((s) => ({ label: s.body, value: String(s.id) })),
  ];

  const fuelTypeOptions = useMemo(() => {
    const standardOptions = [
      { label: "PETROL", value: "PETROL" },
      { label: "OCTANE", value: "OCTANE" },
      { label: "DIESEL", value: "DIESEL" },
      { label: "HYBRID", value: "HYBRID" },
      { label: "ELECTRIC", value: "ELECTRIC" },
      { label: "PETROL+HYBRID", value: "PETROL+HYBRID" },
      { label: "DIESEL+HYBRID", value: "DIESEL+HYBRID" },
      { label: "OCTANE+HYBRID", value: "OCTANE+HYBRID" },
      { label: "CNG+HYBRID", value: "CNG+HYBRID" },
      { label: "LPG+HYBRID", value: "LPG+HYBRID" },
      { label: "PETROL+PLUG-IN HYBRID", value: "PETROL+PLUG-IN HYBRID" },
      { label: "DIESEL+PLUG-IN HYBRID", value: "DIESEL+PLUG-IN HYBRID" },
      { label: "OCTANE+PLUG-IN HYBRID", value: "OCTANE+PLUG-IN HYBRID" },
      { label: "CNG+PLUG-IN HYBRID", value: "CNG+PLUG-IN HYBRID" },
      { label: "LPG+PLUG-IN HYBRID", value: "LPG+PLUG-IN HYBRID" },
      { label: "CNG", value: "CNG" },
      { label: "LPG", value: "LPG" },
      { label: "ETHANOL", value: "ETHANOL" },
      { label: "HYDROGEN", value: "HYDROGEN" },
      { label: "BIO-DIESEL", value: "BIO-DIESEL" },
      { label: "FLEX-FUEL", value: "FLEX-FUEL" },
      { label: "OTHERS", value: "OTHERS" },
    ];
    if (initialCar?.fuel_type && !standardOptions.some((o) => o.value === initialCar.fuel_type)) {
      return [{ label: initialCar.fuel_type, value: initialCar.fuel_type }, ...standardOptions];
    }
    return standardOptions;
  }, [initialCar?.fuel_type]);

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/workspace/inventory" className="button button--secondary" style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}>
          <ArrowLeft size={16} /> Back to Inventory
        </Link>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create Vehicle"}
        </Button>
      </div>

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "general", label: "General" },
          { id: "specs", label: "Specifications" },
          { id: "pricing", label: "Pricing & Availability" },
          { id: "media", label: "Media & Gallery" },
          { id: "description", label: "Description" },
          { id: "seo", label: "SEO Settings" },
        ]}
      />

      {/* 1. General Tab */}
      <div style={{ display: activeTab === "general" ? "flex" : "none", flexDirection: "column", gap: "var(--space-4)", background: "var(--surface)", padding: "var(--space-4)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
          <FormField label="Vehicle Heading / Name" required error={fieldErrors.name}>
            <Input name="name" defaultValue={initialCar?.name || ""} required placeholder="e.g. 2023 Toyota Land Cruiser ZX" />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <FormField label="Brand" required error={fieldErrors.brand}>
              <Select
                name="brand_select"
                options={brandOptions}
                value={selectedBrandId}
                onChange={(e) => handleBrandChange(e.target.value)}
                required
              />
            </FormField>

            <FormField
              label="Model Generation"
              error={fieldErrors.model}
              description={`Filtered to ${filteredModels.length} models for selected brand`}
            >
              <Select
                name="model_select"
                options={modelOptions}
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
              />
            </FormField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <FormField label="Model Name (Override/Custom)" error={fieldErrors.model_name} description="Auto-populated from generation if left blank">
              <Input name="model_name" defaultValue={initialCar?.model_name || ""} placeholder="e.g. LC300 ZX" />
            </FormField>

            <FormField label="Car Type" error={fieldErrors.car_type}>
              <Select
                name="car_type"
                options={[
                  { label: "Reconditioned", value: "RECONDITIONED" },
                  { label: "Brand New", value: "BRAND_NEW" },
                  { label: "Pre-Owned", value: "PRE_OWNED" },
                ]}
                defaultValue={initialCar?.car_type || "RECONDITIONED"}
              />
            </FormField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <FormField label="Reg. Year" error={fieldErrors.year}>
              <Input name="year" type="number" defaultValue={initialCar?.year ? String(initialCar.year) : ""} placeholder="e.g. 2023" />
            </FormField>

            <FormField label="Condition" required error={fieldErrors.condition}>
              <Select
                name="condition"
                options={[
                  { label: "USED", value: "USED" },
                  { label: "NEW", value: "NEW" },
                ]}
                defaultValue={initialCar?.condition || "USED"}
                required
              />
            </FormField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <FormField label="Body Style" error={fieldErrors.body_style}>
              <Select
                name="body_style"
                options={bodyStyleOptions}
                defaultValue={initialCar?.body_style ? String(initialCar.body_style) : ""}
              />
            </FormField>

            <FormField
              label="Showroom Branch"
              error={fieldErrors.branch}
              description="Assigned showroom location (e.g. Kakrail, Gulshan)."
            >
              <Select
                name="branch_select"
                options={branchOptions}
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
              />
            </FormField>
          </div>

          <input
            type="hidden"
            name="inventory_type"
            value={initialCar?.inventory_type || "LUXURY"}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", paddingTop: "var(--space-2)" }}>
            <Switch
              label="Feature on Homepage / Showcase"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
          </div>
        </div>

      {/* 2. Specifications Tab */}
      <div style={{ display: activeTab === "specs" ? "flex" : "none", flexDirection: "column", gap: "var(--space-4)", background: "var(--surface)", padding: "var(--space-4)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <FormField label="Engine Capacity (cc)" error={fieldErrors.engine_capacity}>
              <Input name="engine_capacity" defaultValue={initialCar?.engine_capacity || ""} maxLength={100} placeholder="e.g. 3500 cc Twin Turbo V6" />
            </FormField>

            <FormField label="Mileage" error={fieldErrors.mileage}>
              <Input name="mileage" defaultValue={initialCar?.mileage || ""} maxLength={20} placeholder="e.g. 12000" />
            </FormField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <FormField label="Fuel Type" required error={fieldErrors.fuel_type}>
              <Select
                name="fuel_type"
                options={fuelTypeOptions}
                defaultValue={initialCar?.fuel_type || "PETROL"}
                required
              />
            </FormField>

            <FormField label="Transmission" required error={fieldErrors.transmission}>
              <Select
                name="transmission"
                options={[
                  { label: "AUTOMATIC", value: "AUTOMATIC" },
                  { label: "MANUAL", value: "MANUAL" },
                ]}
                defaultValue={initialCar?.transmission || "AUTOMATIC"}
                required
              />
            </FormField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-4)" }}>
            <FormField label="Color / Exterior" error={fieldErrors.color}>
              <Input name="color" defaultValue={initialCar?.color || ""} maxLength={30} placeholder="e.g. Pearl White" />
            </FormField>

            <FormField label="Drive Train / Type" error={fieldErrors.drive_type}>
              <Input name="drive_type" defaultValue={initialCar?.drive_type || ""} maxLength={150} placeholder="e.g. 4WD, AWD, FWD" />
            </FormField>

            <FormField label="Wheel Base" error={fieldErrors.wheel_base}>
              <Input name="wheel_base" defaultValue={initialCar?.wheel_base || ""} maxLength={20} placeholder="e.g. 2850mm" />
            </FormField>
          </div>
        </div>

      {/* 3. Pricing & Availability Tab */}
      <div style={{ display: activeTab === "pricing" ? "flex" : "none", flexDirection: "column", gap: "var(--space-4)", background: "var(--surface)", padding: "var(--space-4)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
          <FormField label="Price (BDT)" error={fieldErrors.price} description="Decimal numeric value preserved separately (e.g. 28000000.00)">
            <Input name="price" defaultValue={initialCar?.price ? String(initialCar.price) : ""} placeholder="e.g. 28000000.00" />
          </FormField>

          <input
            type="hidden"
            name="slightly_negotiable"
            value={initialCar?.slightly_negotiable || "NO"}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", padding: "var(--space-3)", background: "var(--surface-raised, rgba(255,255,255,0.03))", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
            <Switch
              label="Call for Price / VIP Valuation Display Mode"
              checked={isCallForPrice}
              onChange={(e) => setIsCallForPrice(e.target.checked)}
            />
            <p className="muted" style={{ fontSize: "var(--font-size-xs)", margin: 0 }}>
              When enabled, public listing cards and vehicle detail pages show &quot;Call for Price&quot; or &quot;Price Upon Request • VIP Consultation&quot;. The exact numeric price entered above is safely stored in the database for financial tracking.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <FormField label="Registration Number / Paper Details" error={fieldErrors.registration_number} description="Chassis, auction grade, or Bangladesh paper registration info">
              <Input
                name="registration_number"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                maxLength={100}
                placeholder="e.g. DHAKA-METRO-GA-12-3456"
              />
            </FormField>

            <FormField
              label="Availability in Showroom"
              required
              error={fieldErrors.registered}
              description="Inventory state (Available, Sold, Booked, Pre-Order). Sold cars auto-adjust robots meta."
            >
              <Select
                name="registered"
                options={[
                  { label: "Available", value: "Available" },
                  { label: "Sold", value: "Sold" },
                  { label: "Booked", value: "Booked" },
                  { label: "Pre-Order", value: "Pre-Order" },
                ]}
                defaultValue={initialCar?.registered || "Available"}
                required
              />
            </FormField>
          </div>

          <FormField
            label="Publication Status"
            required
            error={fieldErrors.status}
            description="Visibility state (Published, Unpublished, Archived, Unlisted). Distinct from availability!"
          >
            <Select
              name="status"
              options={[
                { label: "Published (Visible on site)", value: "PUBLISHED" },
                { label: "Unpublished (Draft)", value: "UNPUBLISHED" },
                { label: "Archived (Hidden from list)", value: "ARCHIVED" },
                { label: "Unlisted (Link only)", value: "UNLISTED" },
              ]}
              defaultValue={initialCar?.status || "PUBLISHED"}
              required
            />
          </FormField>
        </div>

      {/* 4. Media & Gallery Tab */}
      <div style={{ display: activeTab === "media" ? "flex" : "none", flexDirection: "column", gap: "var(--space-4)", background: "var(--surface)", padding: "var(--space-4)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
          <FormField label="Feature Primary Image" error={fieldErrors.feature_image} description="Leave blank to keep existing image">
            {initialCar?.feature_image && (
              <div style={{ marginBottom: "var(--space-2)" }}>
                <img src={initialCar.feature_image} alt={initialCar.name} style={{ maxHeight: "120px", objectFit: "cover", borderRadius: "4px" }} />
              </div>
            )}
            <Upload name="feature_image" accept="image/*" />
          </FormField>

          <FormField label="Youtube Video URL" error={fieldErrors.youtube}>
            <Input name="youtube" defaultValue={initialCar?.youtube || ""} placeholder="https://www.youtube.com/watch?v=..." />
          </FormField>

          {isEdit && (
            <div style={{ marginTop: "var(--space-4)", borderTop: "1px solid var(--border)", paddingTop: "var(--space-4)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)", flexWrap: "wrap", gap: "var(--space-2)" }}>
                <div>
                  <h4 style={{ margin: 0 }}>Gallery Images ({galleryImages.length})</h4>
                  {pendingDeletions.length > 0 && (
                    <span style={{ fontSize: "var(--font-size-xs)", color: "var(--danger)" }}>
                      ({pendingDeletions.length} marked for deletion on save)
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                  <Button
                    type="button"
                    variant="primary"
                    disabled={gallerySaving}
                    onClick={handleSaveGalleryBatch}
                    style={{ fontSize: "var(--font-size-xs)", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    <Save size={14} />
                    {gallerySaving ? "Saving..." : "Save Gallery Order & Details"}
                  </Button>
                  <label className="button button--secondary" style={{ cursor: "pointer", fontSize: "var(--font-size-xs)" }}>
                    {galleryUploading ? "Uploading..." : "+ Add Gallery Image"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadGalleryImage}
                      disabled={galleryUploading}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              </div>

              {galleryImages.length === 0 ? (
                <p className="muted" style={{ fontSize: "var(--font-size-sm)" }}>No gallery photos uploaded yet.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "var(--space-3)" }}>
                  {galleryImages.map((img, index) => (
                    <div
                      key={img.id}
                      style={{
                        position: "relative",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                        overflow: "hidden",
                        background: "var(--background)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        padding: "8px",
                      }}
                    >
                      <div style={{ position: "relative", width: "100%", height: "120px", borderRadius: "4px", overflow: "hidden", background: "#000" }}>
                        <img
                          src={img.image}
                          alt={img.alt_text || "Vehicle gallery image"}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <button
                          type="button"
                          onClick={() => handleStageGalleryDelete(img.id)}
                          aria-label="Remove gallery image"
                          style={{
                            position: "absolute",
                            top: "4px",
                            right: "4px",
                            background: "rgba(0,0,0,0.7)",
                            border: "1px solid var(--border)",
                            borderRadius: "4px",
                            color: "var(--danger)",
                            cursor: "pointer",
                            padding: "4px",
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", fontWeight: "bold" }}>#{index + 1} (Order: {img.order})</span>
                        <div style={{ display: "flex", gap: "2px" }}>
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveGalleryImage(index, "up")}
                            style={{
                              background: "transparent",
                              border: "1px solid var(--border)",
                              borderRadius: "3px",
                              color: "var(--foreground)",
                              cursor: index === 0 ? "not-allowed" : "pointer",
                              padding: "2px 4px",
                              opacity: index === 0 ? 0.3 : 1,
                            }}
                            title="Move up"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            disabled={index === galleryImages.length - 1}
                            onClick={() => handleMoveGalleryImage(index, "down")}
                            style={{
                              background: "transparent",
                              border: "1px solid var(--border)",
                              borderRadius: "3px",
                              color: "var(--foreground)",
                              cursor: index === galleryImages.length - 1 ? "not-allowed" : "pointer",
                              padding: "2px 4px",
                              opacity: index === galleryImages.length - 1 ? 0.3 : 1,
                            }}
                            title="Move down"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "10px", color: "var(--text-muted)" }}>Perspective Tag</label>
                        <select
                          value={img.tag || ""}
                          onChange={(e) => handleUpdateGalleryField(img.id, "tag", e.target.value)}
                          style={{
                            fontSize: "11px",
                            padding: "3px 6px",
                            background: "var(--surface)",
                            color: "var(--foreground)",
                            border: "1px solid var(--border)",
                            borderRadius: "4px",
                          }}
                        >
                          <option value="">No Tag</option>
                          <option value="EXTERIOR">EXTERIOR</option>
                          <option value="PROFILE">PROFILE</option>
                          <option value="COCKPIT">COCKPIT</option>
                          <option value="INTERIOR">INTERIOR</option>
                          <option value="WHEELS">WHEELS</option>
                          <option value="REAR">REAR</option>
                          <option value="ENGINE">ENGINE</option>
                          <option value="TRUNK">TRUNK</option>
                          <option value="OTHER">OTHER</option>
                        </select>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "10px", color: "var(--text-muted)" }}>Alt Text / Caption</label>
                        <input
                          type="text"
                          value={img.alt_text || ""}
                          onChange={(e) => handleUpdateGalleryField(img.id, "alt_text", e.target.value)}
                          placeholder="Accessible description"
                          style={{
                            fontSize: "11px",
                            padding: "3px 6px",
                            background: "var(--surface)",
                            color: "var(--foreground)",
                            border: "1px solid var(--border)",
                            borderRadius: "4px",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      {/* 5. Description Tab */}
      <div style={{ display: activeTab === "description" ? "flex" : "none", flexDirection: "column", gap: "var(--space-4)", background: "var(--surface)", padding: "var(--space-4)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
        <FormField label="Vehicle Description (HTML)" error={fieldErrors.description} description="Detailed specifications, features, accessories and options">
          <Textarea name="description" defaultValue={initialCar?.description || ""} rows={12} />
        </FormField>
      </div>

      {/* 6. SEO Settings Tab */}
      <div style={{ display: activeTab === "seo" ? "flex" : "none", flexDirection: "column", gap: "var(--space-4)", background: "var(--surface)", padding: "var(--space-4)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
          <FormField label="H1 Title" error={fieldErrors.h1_title} description="Heading on vehicle page; falls back to Name if blank">
            <Input name="h1_title" defaultValue={initialCar?.h1_title || ""} maxLength={200} placeholder="e.g. 2023 Toyota Land Cruiser ZX 3.5L Turbo" />
          </FormField>

          <FormField label="Target Primary Keyword" error={fieldErrors.target_keyword}>
            <Input name="target_keyword" defaultValue={initialCar?.target_keyword || ""} maxLength={120} placeholder="e.g. toyota land cruiser zx price bd" />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <FormField label="Meta Title" error={fieldErrors.meta_title} description="Auto-generated if left blank (max 70 chars)">
              <Input name="meta_title" defaultValue={initialCar?.meta_title || ""} maxLength={70} />
            </FormField>

            <FormField label="URL Slug" error={fieldErrors.slug} description="Auto-generated if left blank; immutable past redirect rules apply">
              <Input name="slug" defaultValue={initialCar?.slug || ""} placeholder="auto-generated-from-details" />
            </FormField>
          </div>

          <FormField label="Meta Description" error={fieldErrors.meta_description} description="Auto-generated if left blank (max 500 chars)">
            <Textarea name="meta_description" defaultValue={initialCar?.meta_description || ""} rows={3} maxLength={500} />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <FormField label="Canonical URL" error={fieldErrors.canonical_url} description="Auto-generated based on authoritative base domain">
              <Input name="canonical_url" defaultValue={initialCar?.canonical_url || ""} maxLength={500} />
            </FormField>

            <FormField label="Search Engine Indexing" error={fieldErrors.indexing}>
              <Select
                name="indexing"
                options={[
                  { label: "Index & follow", value: "index, follow" },
                  { label: "Index & nofollow", value: "index, nofollow" },
                  { label: "Noindex & nofollow", value: "noindex, nofollow" },
                ]}
                defaultValue={initialCar?.indexing || "index, follow"}
              />
            </FormField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <FormField label="Featured Image Alt Text" error={fieldErrors.featured_image_alt}>
              <Input name="featured_image_alt" defaultValue={initialCar?.featured_image_alt || ""} maxLength={200} />
            </FormField>

            <FormField label="Previous Slug (for 301 redirect)" error={fieldErrors.previous_slug} description="Auto-populated when slug changes">
              <Input name="previous_slug" defaultValue={initialCar?.previous_slug || ""} readOnly />
            </FormField>
          </div>

          <FormField label="Schema.org JSON-LD Override" error={fieldErrors.schema_override} description="Optional custom JSON-LD schema dictionary">
            <Textarea
              value={schemaText}
              onChange={(e) => setSchemaText(e.target.value)}
              rows={8}
              style={{ fontFamily: "monospace", fontSize: "var(--font-size-xs)" }}
              placeholder='{ "@context": "https://schema.org", "@type": "Car" }'
            />
          </FormField>
        </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create Vehicle"}
        </Button>
      </div>
    </form>
  );
}
