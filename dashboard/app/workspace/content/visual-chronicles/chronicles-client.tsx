"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import type { VisualChroniclesSectionItem, VisualChroniclesItemData, VisualChroniclesSpec } from "@/lib/types";
import {
  updateVisualChroniclesSectionAction,
  updateVisualChroniclesItemAction,
  createVisualChroniclesItemAction,
  deleteVisualChroniclesItemAction,
} from "@/app/actions/chronicles_sanctuary";

interface ChroniclesClientProps {
  initialData: VisualChroniclesSectionItem;
  userPermissions: string[];
}

export function ChroniclesClient({ initialData, userPermissions }: ChroniclesClientProps) {
  const canChange =
    userPermissions.includes("*") ||
    userPermissions.includes("home.change_visualchroniclessection") ||
    userPermissions.includes("admin") ||
    userPermissions.length === 0; // fallback if superuser

  const [section, setSection] = useState<VisualChroniclesSectionItem>(initialData);
  const [editingItem, setEditingItem] = useState<VisualChroniclesItemData | null>(null);
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Section fields
  const [heading, setHeading] = useState(section.heading || "");
  const [subtitle, setSubtitle] = useState(section.subtitle || "");
  const [statsNumber, setStatsNumber] = useState(section.stats_number || "19+");
  const [statsLabel, setStatsLabel] = useState(section.stats_label || "Curated Masterpieces");
  const [archiveTag, setArchiveTag] = useState(section.archive_tag || "19+ SHOWROOM ARCHIVE EDITIONS");
  const [archiveDesc, setArchiveDesc] = useState(section.archive_description || "");
  const [archiveCtaLabel, setArchiveCtaLabel] = useState(section.archive_cta_label || "See All Gallery & Media");
  const [archiveCtaUrl, setArchiveCtaUrl] = useState(section.archive_cta_url || "/gallery");
  const [isActive, setIsActive] = useState(section.is_active);

  // Save section settings
  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canChange) return;

    setStatusMsg(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("heading", heading);
      formData.set("subtitle", subtitle);
      formData.set("stats_number", statsNumber);
      formData.set("stats_label", statsLabel);
      formData.set("archive_tag", archiveTag);
      formData.set("archive_description", archiveDesc);
      formData.set("archive_cta_label", archiveCtaLabel);
      formData.set("archive_cta_url", archiveCtaUrl);
      formData.set("is_active", isActive ? "true" : "false");

      const res = await updateVisualChroniclesSectionAction(formData);
      if (res.ok) {
        setSection(res.data);
        setStatusMsg({ type: "success", text: "Visual Chronicles section updated successfully!" });
      } else {
        setStatusMsg({ type: "error", text: res.error.message || "Failed to update section." });
      }
    });
  };

  // Reorder items
  const handleMoveOrder = (item: VisualChroniclesItemData, direction: "up" | "down") => {
    if (!canChange) return;
    const items = [...section.items].sort((a, b) => a.order - b.order);
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx === -1) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const currentItem = items[idx];
    const targetItem = items[targetIdx];
    if (!currentItem || !targetItem) return;

    const currentOrder = currentItem.order;
    const targetOrder = targetItem.order;

    startTransition(async () => {
      const fdCurrent = new FormData();
      fdCurrent.set("order", String(targetOrder));
      const fdTarget = new FormData();
      fdTarget.set("order", String(currentOrder));

      await Promise.all([
        updateVisualChroniclesItemAction(currentItem.id, fdCurrent),
        updateVisualChroniclesItemAction(targetItem.id, fdTarget),
      ]);

      const updatedItems = items.map((i) => {
        if (i.id === currentItem.id) return { ...i, order: targetOrder };
        if (i.id === targetItem.id) return { ...i, order: currentOrder };
        return i;
      });
      setSection({ ...section, items: updatedItems });
      setStatusMsg({ type: "success", text: "Item order updated." });
    });
  };

  // Delete item
  const handleDeleteItem = (id: number) => {
    if (!canChange || !confirm("Are you sure you want to remove this mosaic tile?")) return;

    startTransition(async () => {
      const res = await deleteVisualChroniclesItemAction(id);
      if (res.ok) {
        setSection({
          ...section,
          items: section.items.filter((i) => i.id !== id),
        });
        setStatusMsg({ type: "success", text: "Mosaic tile deleted." });
      } else {
        setStatusMsg({ type: "error", text: "Failed to delete tile." });
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "1200px" }}>
      {statusMsg && (
        <div
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "6px",
            backgroundColor: statusMsg.type === "success" ? "#14532d" : "#7f1d1d",
            color: statusMsg.type === "success" ? "#86efac" : "#fca5a5",
            fontSize: "0.9rem",
          }}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Section Header & Global Archive Form */}
      <div style={{ background: "#18181b", padding: "1.5rem", borderRadius: "8px", border: "1px solid #27272a" }}>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 600, color: "#f4f4f5", marginBottom: "1.25rem" }}>
          Section Header & Archive Configuration
        </h3>

        <form onSubmit={handleSaveSection} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Section Title / Heading</label>
            <input
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="appt-input"
              style={{ background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem" }}
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Stats Number & Label (Badge)</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                value={statsNumber}
                onChange={(e) => setStatsNumber(e.target.value)}
                placeholder="19+"
                style={{ width: "30%", background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem" }}
              />
              <input
                type="text"
                value={statsLabel}
                onChange={(e) => setStatsLabel(e.target.value)}
                placeholder="Curated Masterpieces"
                style={{ width: "70%", background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem" }}
              />
            </div>
          </div>

          <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Subtitle / Editorial Introduction</label>
            <textarea
              rows={2}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              style={{ background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem", borderRadius: "4px" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Footer Live Tag</label>
            <input
              type="text"
              value={archiveTag}
              onChange={(e) => setArchiveTag(e.target.value)}
              placeholder="19+ SHOWROOM ARCHIVE EDITIONS"
              style={{ background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Footer CTA Label & URL</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                value={archiveCtaLabel}
                onChange={(e) => setArchiveCtaLabel(e.target.value)}
                placeholder="See All Gallery & Media"
                style={{ width: "60%", background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem" }}
              />
              <input
                type="text"
                value={archiveCtaUrl}
                onChange={(e) => setArchiveCtaUrl(e.target.value)}
                placeholder="/gallery"
                style={{ width: "40%", background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem" }}
              />
            </div>
          </div>

          <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Footer Description</label>
            <input
              type="text"
              value={archiveDesc}
              onChange={(e) => setArchiveDesc(e.target.value)}
              placeholder="Explore high-definition exterior profiles, handcrafted cockpits..."
              style={{ background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem" }}
            />
          </div>

          <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#f4f4f5", fontSize: "0.9rem" }}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Section Published & Active
            </label>

            <button
              type="submit"
              disabled={isPending || !canChange}
              style={{
                backgroundColor: "#2563eb",
                color: "#ffffff",
                padding: "0.5rem 1.25rem",
                borderRadius: "6px",
                border: "none",
                fontWeight: 600,
                cursor: "pointer",
                opacity: isPending ? 0.6 : 1,
              }}
            >
              {isPending ? "Saving..." : "Save Section Settings"}
            </button>
          </div>
        </form>
      </div>

      {/* Mosaic Tiles List & Reordering */}
      <div style={{ background: "#18181b", padding: "1.5rem", borderRadius: "8px", border: "1px solid #27272a" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 600, color: "#f4f4f5", margin: 0 }}>
              Mosaic Atelier Flip Tiles ({section.items.length})
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#a1a1aa", margin: "0.25rem 0 0 0" }}>
              Manage front image, badge, 3D flip card description, specs grid, and CTA destinations.
            </p>
          </div>
          <button
            onClick={() => {
              setIsCreatingItem(true);
              setEditingItem(null);
            }}
            style={{
              backgroundColor: "#16a34a",
              color: "#ffffff",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + Add New Tile
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[...section.items]
            .sort((a, b) => a.order - b.order)
            .map((item, idx) => {
              const imgSrc = item.front_image_url || item.front_image;
              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.25rem",
                    padding: "1rem",
                    backgroundColor: "#09090b",
                    border: "1px solid #27272a",
                    borderRadius: "6px",
                  }}
                >
                  {/* Order column */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                    <button
                      onClick={() => handleMoveOrder(item, "up")}
                      disabled={idx === 0 || isPending}
                      style={{ background: "transparent", border: "1px solid #3f3f46", color: "#a1a1aa", borderRadius: "3px", cursor: "pointer", padding: "2px 6px" }}
                      title="Move Up"
                    >
                      ▲
                    </button>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f4f4f5" }}>#{item.order}</span>
                    <button
                      onClick={() => handleMoveOrder(item, "down")}
                      disabled={idx === section.items.length - 1 || isPending}
                      style={{ background: "transparent", border: "1px solid #3f3f46", color: "#a1a1aa", borderRadius: "3px", cursor: "pointer", padding: "2px 6px" }}
                      title="Move Down"
                    >
                      ▼
                    </button>
                  </div>

                  {/* Image Thumbnail */}
                  <div style={{ width: "90px", height: "65px", position: "relative", backgroundColor: "#27272a", borderRadius: "4px", overflow: "hidden", flexShrink: 0 }}>
                    {imgSrc ? (
                      <Image src={imgSrc} alt={item.front_alt || item.title} fill style={{ objectFit: "cover" }} />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#71717a", fontSize: "0.75rem" }}>
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Tile Summary */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          backgroundColor:
                            item.card_type === "hero" ? "#3b82f6" : item.card_type === "portrait" ? "#a855f7" : "#06b6d4",
                          color: "#ffffff",
                          textTransform: "uppercase",
                        }}
                      >
                        {item.card_type}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>Index: {item.back_number}</span>
                      <span style={{ fontSize: "0.75rem", color: "#d97706" }}>• {item.front_badge}</span>
                    </div>
                    <h4 style={{ fontSize: "1rem", fontWeight: 600, color: "#ffffff", margin: 0 }}>{item.title}</h4>
                    <p style={{ fontSize: "0.82rem", color: "#a1a1aa", margin: "0.2rem 0 0 0", maxWidth: "600px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.description}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsCreatingItem(false);
                      }}
                      style={{
                        backgroundColor: "#3f3f46",
                        color: "#f4f4f5",
                        border: "none",
                        borderRadius: "4px",
                        padding: "0.4rem 0.8rem",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                      }}
                    >
                      Edit Tile
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      style={{
                        backgroundColor: "#7f1d1d",
                        color: "#fca5a5",
                        border: "none",
                        borderRadius: "4px",
                        padding: "0.4rem 0.8rem",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Edit / Create Tile Modal Form */}
      {(editingItem || isCreatingItem) && (
        <TileFormModal
          item={editingItem}
          isCreating={isCreatingItem}
          onClose={() => {
            setEditingItem(null);
            setIsCreatingItem(false);
          }}
          onSaved={(savedItem) => {
            if (isCreatingItem) {
              setSection({ ...section, items: [...section.items, savedItem] });
            } else {
              setSection({
                ...section,
                items: section.items.map((i) => (i.id === savedItem.id ? savedItem : i)),
              });
            }
            setEditingItem(null);
            setIsCreatingItem(false);
            setStatusMsg({ type: "success", text: "Mosaic tile saved successfully!" });
          }}
        />
      )}
    </div>
  );
}

// ----------------- Tile Form Modal -----------------
function TileFormModal({
  item,
  isCreating,
  onClose,
  onSaved,
}: {
  item: VisualChroniclesItemData | null;
  isCreating: boolean;
  onClose: () => void;
  onSaved: (item: VisualChroniclesItemData) => void;
}) {
  const [cardType, setCardType] = useState<string>(item?.card_type || "tri");
  const [order, setOrder] = useState<number>(item?.order || 1);
  const [frontBadge, setFrontBadge] = useState<string>(item?.front_badge || "SHOWROOM SPOTLIGHT");
  const [frontAlt, setFrontAlt] = useState<string>(item?.front_alt || "");
  const [frontImageUrl, setFrontImageUrl] = useState<string>(item?.front_image_url || "");
  const [backPill, setBackPill] = useState<string>(item?.back_pill || "EXCLUSIVE COMMISSION");
  const [backNumber, setBackNumber] = useState<string>(item?.back_number || "01");
  const [title, setTitle] = useState<string>(item?.title || "");
  const [description, setDescription] = useState<string>(item?.description || "");
  const [ctaLabel, setCtaLabel] = useState<string>(item?.cta_label || "View Spotlight");
  const [ctaUrl, setCtaUrl] = useState<string>(item?.cta_url || "/inventory");
  const [isActive, setIsActive] = useState<boolean>(item?.is_active ?? true);
  const [file, setFile] = useState<File | null>(null);

  // Specs editing: array of { label, value }
  const [specs, setSpecs] = useState<VisualChroniclesSpec[]>(
    item?.specs && item.specs.length > 0
      ? item.specs
      : [
          { label: "Engine", value: "" },
          { label: "Drivetrain", value: "" },
        ]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSpecChange = (idx: number, field: "label" | "value", val: string) => {
    const updated = [...specs];
    const target = updated[idx];
    if (target) {
      target[field] = val;
      setSpecs(updated);
    }
  };

  const handleAddSpec = () => {
    setSpecs([...specs, { label: "", value: "" }]);
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecs(specs.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.set("card_type", cardType);
    formData.set("order", String(order));
    formData.set("front_badge", frontBadge);
    formData.set("front_alt", frontAlt);
    formData.set("front_image_url", frontImageUrl);
    formData.set("back_pill", backPill);
    formData.set("back_number", backNumber);
    formData.set("title", title);
    formData.set("description", description);
    formData.set("cta_label", ctaLabel);
    formData.set("cta_url", ctaUrl);
    formData.set("is_active", isActive ? "true" : "false");
    formData.set("specs", JSON.stringify(specs.filter((s) => s.label.trim() || s.value.trim())));

    if (file) {
      formData.set("front_image", file);
    }

    try {
      if (isCreating) {
        const res = await createVisualChroniclesItemAction(formData);
        if (res.ok) {
          onSaved(res.data);
        } else {
          setError(res.error.message || "Failed to create tile.");
        }
      } else if (item) {
        const res = await updateVisualChroniclesItemAction(item.id, formData);
        if (res.ok) {
          onSaved(res.data);
        } else {
          setError(res.error.message || "Failed to update tile.");
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving tile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem",
      }}
    >
      <div
        style={{
          backgroundColor: "#18181b",
          border: "1px solid #3f3f46",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "700px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "1.5rem",
          color: "#f4f4f5",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>
            {isCreating ? "Add Mosaic Atelier Tile" : `Edit Tile #${order}: ${title}`}
          </h3>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "#a1a1aa", fontSize: "1.5rem", cursor: "pointer" }}
          >
            &times;
          </button>
        </div>

        {error && (
          <div style={{ padding: "0.5rem 1rem", backgroundColor: "#7f1d1d", color: "#fca5a5", borderRadius: "4px", marginBottom: "1rem", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Card Grid Variant</label>
            <select
              value={cardType}
              onChange={(e) => setCardType(e.target.value)}
              style={{ width: "100%", background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem", borderRadius: "4px" }}
            >
              <option value="hero">Hero (Col 1-7 Widescreen)</option>
              <option value="portrait">Portrait (Col 8-12 Vertical GT)</option>
              <option value="tri">Tri Card (1/3 Bottom Row)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Display Order</label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              style={{ width: "100%", background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem", borderRadius: "4px" }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Front Floating Badge</label>
            <input
              type="text"
              value={frontBadge}
              onChange={(e) => setFrontBadge(e.target.value)}
              placeholder="e.g. SHOWROOM FLAGSHIP SPOTLIGHT"
              style={{ width: "100%", background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem", borderRadius: "4px" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Back Header Pill & Number</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                value={backPill}
                onChange={(e) => setBackPill(e.target.value)}
                placeholder="FIRST-CLASS COMMISSION"
                style={{ width: "70%", background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem", borderRadius: "4px" }}
              />
              <input
                type="text"
                value={backNumber}
                onChange={(e) => setBackNumber(e.target.value)}
                placeholder="01"
                style={{ width: "30%", background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem", borderRadius: "4px" }}
              />
            </div>
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Car Title / Heading</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mercedes-Maybach S 680 Bi-Turbo V12"
              style={{ width: "100%", background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem", borderRadius: "4px" }}
              required
            />
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Back Card Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Obsidian Black over Silk Nappa leather. Exclusive rear executive lounge..."
              style={{ width: "100%", background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem", borderRadius: "4px" }}
              required
            />
          </div>

          {/* Front Image Upload or URL */}
          <div style={{ gridColumn: "span 2" }}>
            <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Front Photo (Upload file or provide Image URL)</label>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                style={{ width: "50%", background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.4rem", borderRadius: "4px" }}
              />
              <input
                type="url"
                value={frontImageUrl}
                onChange={(e) => setFrontImageUrl(e.target.value)}
                placeholder="Or paste https://..."
                style={{ width: "50%", background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem", borderRadius: "4px" }}
              />
            </div>
          </div>

          {/* Specs Editor */}
          <div style={{ gridColumn: "span 2" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>Specifications / Feature Tags</label>
              <button
                type="button"
                onClick={handleAddSpec}
                style={{ background: "#27272a", border: "1px solid #3f3f46", color: "#f4f4f5", borderRadius: "4px", padding: "2px 8px", fontSize: "0.75rem", cursor: "pointer" }}
              >
                + Add Spec
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {specs.map((spec, sIdx) => (
                <div key={sIdx} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input
                    type="text"
                    value={spec.label}
                    onChange={(e) => handleSpecChange(sIdx, "label", e.target.value)}
                    placeholder="Label (e.g. Engine)"
                    style={{ width: "40%", background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.4rem", borderRadius: "4px" }}
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(sIdx, "value", e.target.value)}
                    placeholder="Value (e.g. 6.0L V12)"
                    style={{ width: "50%", background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.4rem", borderRadius: "4px" }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(sIdx)}
                    style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "1rem" }}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>CTA Button Label</label>
            <input
              type="text"
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              placeholder="Explore Available Inventory"
              style={{ width: "100%", background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem", borderRadius: "4px" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>CTA Destination URL</label>
            <input
              type="text"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              placeholder="/inventory or /gallery"
              style={{ width: "100%", background: "#09090b", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "0.5rem", borderRadius: "4px" }}
            />
          </div>

          <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#f4f4f5", fontSize: "0.85rem" }}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active on public website
            </label>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={onClose}
                style={{ background: "transparent", border: "1px solid #3f3f46", color: "#a1a1aa", padding: "0.5rem 1rem", borderRadius: "4px", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ backgroundColor: "#2563eb", color: "#ffffff", border: "none", padding: "0.5rem 1.25rem", borderRadius: "4px", fontWeight: 600, cursor: "pointer" }}
              >
                {isSubmitting ? "Saving Tile..." : "Save Tile"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
