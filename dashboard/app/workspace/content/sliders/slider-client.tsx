"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DataTable, type ColumnDef } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Drawer } from "@/components/ui/Drawer";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import {
  Trash2,
  Edit,
  Plus,
  Clapperboard,
  Globe,
  Radio,
  AlertTriangle,
  ExternalLink,
  Video,
  Play,
  Layers,
  Link as LinkIcon,
  Calendar,
  Image as ImageIcon,
  Sun,
  Moon,
  ArrowDown,
} from "lucide-react";
import {
  createSliderAction,
  updateSliderAction,
  deleteSliderAction,
} from "@/app/actions/inventory";
import type { SliderItem, HeroCtaButton } from "@/lib/types";

const DEFAULT_CTA_BUTTONS: HeroCtaButton[] = [
  { label: "Brand New", action: "link", destination: "/inventory?type=BRAND_NEW" },
  { label: "Pre-Owned", action: "link", destination: "/inventory?type=PRE_OWNED" },
];

export function SliderClient({
  initialSliders,
  totalRows,
  currentPage,
  pageSize,
  q,
  userPermissions = [],
}: {
  initialSliders: SliderItem[];
  totalRows: number;
  currentPage: number;
  pageSize: number;
  q: string;
  userPermissions?: string[];
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const canAdd =
    userPermissions.includes("*") ||
    userPermissions.includes("home.add_slider");
  const canChange =
    userPermissions.includes("*") ||
    userPermissions.includes("home.change_slider");
  const canDelete =
    userPermissions.includes("*") ||
    userPermissions.includes("home.delete_slider");

  // Drawers and dialogs
  const [activeSlider, setActiveSlider] = useState<SliderItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Form State - Create
  const [createMediaType, setCreateMediaType] = useState<"video" | "image">("video");
  const [createHeading, setCreateHeading] = useState("");
  const [createPoster, setCreatePoster] = useState("/assets/dch-day-showroom.webp");
  const [createPosterNight, setCreatePosterNight] = useState("/assets/dch-night-showroom.webp");
  const [createProvider, setCreateProvider] = useState<"youtube" | "vimeo" | "direct">("direct");
  const [createSource, setCreateSource] = useState("/videos/hero-bg.mp4");
  const [createStartTime, setCreateStartTime] = useState(45);
  const [createVideoTitle, setCreateVideoTitle] = useState("DREAM CAR HOUSE Flagship Cinema");
  const [createShowScrollCue, setCreateShowScrollCue] = useState(true);
  const [createScrollLabel, setCreateScrollLabel] = useState("Scroll to Current Inventory");
  const [createScrollTarget, setCreateScrollTarget] = useState("#carousel-section");
  const [createIsPublished, setCreateIsPublished] = useState(true);
  const [createCtaButtons, setCreateCtaButtons] = useState<HeroCtaButton[]>(DEFAULT_CTA_BUTTONS);
  const [createFile, setCreateFile] = useState<File | null>(null);
  const [createFileDay, setCreateFileDay] = useState<File | null>(null);

  // Form State - Edit
  const [editMediaType, setEditMediaType] = useState<"video" | "image">("video");
  const [editHeading, setEditHeading] = useState("");
  const [editPoster, setEditPoster] = useState("");
  const [editPosterNight, setEditPosterNight] = useState("");
  const [editProvider, setEditProvider] = useState<"youtube" | "vimeo" | "direct">("youtube");
  const [editSource, setEditSource] = useState("");
  const [editStartTime, setEditStartTime] = useState(0);
  const [editVideoTitle, setEditVideoTitle] = useState("");
  const [editShowScrollCue, setEditShowScrollCue] = useState(true);
  const [editScrollLabel, setEditScrollLabel] = useState("");
  const [editScrollTarget, setEditScrollTarget] = useState("");
  const [editIsPublished, setEditIsPublished] = useState(true);
  const [editCtaButtons, setEditCtaButtons] = useState<HeroCtaButton[]>([]);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editFileDay, setEditFileDay] = useState<File | null>(null);
  const [clearImage, setClearImage] = useState(false);
  const [clearImageDay, setClearImageDay] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function updateParams(newParams: Record<string, string | number | undefined>) {
    const url = new URL(window.location.href);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === undefined || v === "") {
        url.searchParams.delete(k);
      } else {
        url.searchParams.set(k, String(v));
      }
    });
    if (!("page" in newParams)) {
      url.searchParams.delete("page");
    }
    router.push(url.pathname + url.search);
  }

  function handleOpenDetail(slider: SliderItem) {
    setActiveSlider(slider);
    setDetailOpen(true);
  }

  function handleOpenCreate() {
    setCreateMediaType("video");
    setCreateHeading("The Pinnacle of Luxury Automobiles");
    setCreatePoster("/assets/dch-day-showroom.webp");
    setCreatePosterNight("/assets/dch-night-showroom.webp");
    setCreateProvider("direct");
    setCreateSource("/videos/hero-bg.mp4");
    setCreateStartTime(45);
    setCreateVideoTitle("DREAM CAR HOUSE Flagship Cinema");
    setCreateShowScrollCue(true);
    setCreateScrollLabel("Scroll to Current Inventory");
    setCreateScrollTarget("#carousel-section");
    setCreateIsPublished(true);
    setCreateCtaButtons(JSON.parse(JSON.stringify(DEFAULT_CTA_BUTTONS)));
    setCreateFile(null);
    setCreateFileDay(null);
    setErrors({});
    setCreateOpen(true);
  }

  function handleOpenEdit(slider: SliderItem) {
    setActiveSlider(slider);
    setEditMediaType(slider.media_type === "image" ? "image" : "video");
    setEditHeading(slider.heading || "");
    setEditPoster(slider.poster || "/assets/dch-day-showroom.webp");
    setEditPosterNight(slider.poster_night || "/assets/dch-night-showroom.webp");
    setEditProvider(slider.video_provider || "youtube");
    setEditSource(slider.video_source || "7cxfVWs4YGw");
    setEditStartTime(slider.video_start_time ?? 45);
    setEditVideoTitle(slider.video_title || "DREAM CAR HOUSE Flagship Cinema");
    setEditShowScrollCue(Boolean(slider.scroll_link_label));
    setEditScrollLabel(slider.scroll_link_label || "Scroll to Current Inventory");
    setEditScrollTarget(slider.scroll_link_target || "#carousel-section");
    setEditIsPublished(slider.is_published ?? true);
    setEditCtaButtons(
      slider.cta_buttons && slider.cta_buttons.length > 0
        ? JSON.parse(JSON.stringify(slider.cta_buttons))
        : JSON.parse(JSON.stringify(DEFAULT_CTA_BUTTONS))
    );
    setEditFile(null);
    setEditFileDay(null);
    setClearImage(false);
    setClearImageDay(false);
    setErrors({});
    setEditOpen(true);
  }

  function handleOpenDelete(slider: SliderItem) {
    setActiveSlider(slider);
    setDeleteDialogOpen(true);
  }

  // CTA list modifiers for create
  function addCreateCta() {
    setCreateCtaButtons([...createCtaButtons, { label: "New Action", action: "link", destination: "/" }]);
  }
  function updateCreateCta(index: number, patch: Partial<HeroCtaButton>) {
    const next = [...createCtaButtons];
    next[index] = { ...next[index], ...patch } as HeroCtaButton;
    setCreateCtaButtons(next);
  }
  function removeCreateCta(index: number) {
    setCreateCtaButtons(createCtaButtons.filter((_, i) => i !== index));
  }

  // CTA list modifiers for edit
  function addEditCta() {
    setEditCtaButtons([...editCtaButtons, { label: "New Action", action: "link", destination: "/" }]);
  }
  function updateEditCta(index: number, patch: Partial<HeroCtaButton>) {
    const next = [...editCtaButtons];
    next[index] = { ...next[index], ...patch } as HeroCtaButton;
    setEditCtaButtons(next);
  }
  function removeEditCta(index: number) {
    setEditCtaButtons(editCtaButtons.filter((_, i) => i !== index));
  }

  async function handleSaveCreate(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!createHeading.trim()) newErrors.heading = "Heading is required.";
    if (createMediaType === "video" && !createSource.trim()) {
      newErrors.video_source = "Video ID or URL is required in Cinema Video mode.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    const formData = new FormData();
    formData.append("heading", createHeading.trim());
    formData.append("media_type", createMediaType);
    formData.append("poster", createPoster.trim());
    formData.append("poster_night", createPosterNight.trim() || "/assets/dch-night-showroom.webp");
    formData.append("video_provider", createProvider);
    formData.append("video_source", createSource.trim() || "7cxfVWs4YGw");
    formData.append("video_start_time", String(createStartTime));
    formData.append("video_title", createVideoTitle.trim());
    formData.append("scroll_link_label", createShowScrollCue ? createScrollLabel.trim() : "");
    formData.append("scroll_link_target", createShowScrollCue ? createScrollTarget.trim() : "");
    formData.append("is_published", String(createIsPublished));
    formData.append("cta_buttons", JSON.stringify(createCtaButtons));
    if (createFileDay) {
      formData.append("image_day", createFileDay);
    }
    if (createFile) {
      formData.append("image", createFile);
    }

    const res = await createSliderAction(formData);
    setSubmitting(false);

    if (!res.ok) {
      showToast({ type: "error", title: "Creation Failed", message: res.error.message || "Failed to create slider banner." });
    } else {
      showToast({ type: "success", title: "Saved", message: "Slider hero banner created successfully." });
      setCreateOpen(false);
      router.refresh();
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeSlider) return;

    if (!editHeading.trim()) {
      setErrors({ heading: "Heading is required." });
      return;
    }
    if (editMediaType === "video" && !editSource.trim()) {
      setErrors({ video_source: "Video ID or URL is required in Cinema Video mode." });
      return;
    }

    setSubmitting(true);
    setErrors({});

    const formData = new FormData();
    formData.append("heading", editHeading.trim());
    formData.append("media_type", editMediaType);
    formData.append("poster", editPoster.trim());
    formData.append("poster_night", editPosterNight.trim() || "/assets/dch-night-showroom.webp");
    formData.append("video_provider", editProvider);
    formData.append("video_source", editSource.trim() || "7cxfVWs4YGw");
    formData.append("video_start_time", String(editStartTime));
    formData.append("video_title", editVideoTitle.trim());
    formData.append("scroll_link_label", editShowScrollCue ? editScrollLabel.trim() : "");
    formData.append("scroll_link_target", editShowScrollCue ? editScrollTarget.trim() : "");
    formData.append("is_published", String(editIsPublished));
    formData.append("cta_buttons", JSON.stringify(editCtaButtons));
    if (editFileDay) {
      formData.append("image_day", editFileDay);
    }
    if (clearImageDay) {
      formData.append("clear_image_day", "true");
    }
    if (editFile) {
      formData.append("image", editFile);
    }
    if (clearImage) {
      formData.append("clear_image", "true");
    }

    const res = await updateSliderAction(activeSlider.id, formData);
    setSubmitting(false);

    if (!res.ok) {
      showToast({ type: "error", title: "Update Failed", message: res.error.message || "Failed to update slider." });
    } else {
      showToast({ type: "success", title: "Updated", message: `Slider #${activeSlider.id} updated successfully.` });
      setEditOpen(false);
      setActiveSlider(res.data);
      router.refresh();
    }
  }

  async function handleConfirmDelete() {
    if (!activeSlider) return;

    setSubmitting(true);
    const res = await deleteSliderAction(activeSlider.id);
    setSubmitting(false);

    if (!res.ok) {
      showToast({ type: "error", title: "Delete Failed", message: res.error.message || "Failed to delete slider item." });
    } else {
      showToast({ type: "success", title: "Deleted", message: `Slider #${activeSlider.id} deleted successfully.` });
      setDeleteDialogOpen(false);
      setActiveSlider(null);
      router.refresh();
    }
  }

  const columns: ColumnDef<SliderItem>[] = [
    {
      id: "id",
      header: "ID",
      cell: (slider) => (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--font-size-xs)" }}>
          #{slider.id}
        </span>
      ),
    },
    {
      id: "heading",
      header: "Hero Headline (H1)",
      cell: (slider) => (
        <div>
          <button
            type="button"
            onClick={() => handleOpenDetail(slider)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              font: "inherit",
              fontWeight: 600,
              color: "var(--text)",
              cursor: "pointer",
              textAlign: "left",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            {slider.heading}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
            {slider.media_type === "image" ? (
              <span
                style={{
                  fontSize: "10px",
                  padding: "1px 6px",
                  borderRadius: "3px",
                  background: "rgba(234, 179, 8, 0.12)",
                  color: "#eab308",
                  border: "1px solid rgba(234, 179, 8, 0.25)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontWeight: 600,
                }}
              >
                <ImageIcon size={10} /> Photos (Day/Night)
              </span>
            ) : (
              <span
                style={{
                  fontSize: "10px",
                  padding: "1px 6px",
                  borderRadius: "3px",
                  background: "rgba(59, 130, 246, 0.12)",
                  color: "#60a5fa",
                  border: "1px solid rgba(59, 130, 246, 0.25)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontWeight: 600,
                }}
              >
                <Video size={10} /> Cinema Video ({slider.video_provider || "youtube"})
              </span>
            )}
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              {slider.media_type === "image"
                ? `Day: ${slider.image_day ? "Custom Photo" : "Showroom"} • Night: ${slider.image ? "Custom Photo" : "Showroom"}`
                : `Source: ${slider.video_source || "7cxfVWs4YGw"} (${slider.video_start_time ?? 45}s)`}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Public Selection",
      cell: (slider) =>
        slider.is_public_active ? (
          <span
            className="badge"
            style={{
              background: "var(--success-bg, rgba(46, 125, 50, 0.15))",
              color: "var(--success, #2e7d32)",
              border: "1px solid var(--success-border, rgba(46, 125, 50, 0.3))",
              padding: "2px 8px",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--font-size-xs)",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontWeight: 600,
            }}
          >
            <Radio size={12} /> Live on Homepage
          </span>
        ) : (
          <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
            Archived / Inactive
          </span>
        ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (slider) => (
        <div style={{ display: "flex", gap: "var(--space-1)", justifyContent: "flex-end" }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleOpenDetail(slider)}
            aria-label={`View slider ${slider.heading}`}
          >
            Detail
          </Button>
          {canChange && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleOpenEdit(slider)}
              aria-label={`Edit slider ${slider.heading}`}
            >
              <Edit size={12} /> Edit
            </Button>
          )}
          {canDelete && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleOpenDelete(slider)}
              aria-label={`Delete slider ${slider.heading}`}
            >
              <Trash2 size={12} /> Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {/* Content Tabs Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "var(--space-2)",
          flexWrap: "wrap",
          gap: "var(--space-2)",
        }}
      >
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Link
            href="/workspace/content/sliders"
            className="button button--primary"
            style={{
              fontSize: "var(--font-size-sm)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Clapperboard size={14} /> Hero Video & Slider
          </Link>
          <Link
            href="/workspace/content/social-features"
            className="button button--ghost"
            style={{
              fontSize: "var(--font-size-sm)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Globe size={14} /> Social Features
          </Link>
        </div>

        {canAdd && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            aria-label="New Hero Slider Banner"
          >
            <Plus size={16} /> New Hero Banner
          </Button>
        )}
      </div>

      {/* Info notice about selection rule */}
      <div
        style={{
          padding: "var(--space-3)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          fontSize: "var(--font-size-xs)",
          color: "var(--text-muted)",
        }}
      >
        <strong>Homepage Hero Cinema Engine:</strong> The public website homepage SSR runtime fetches the latest published hero configuration. You can configure headline heading, video provider (YouTube/Vimeo/Direct), start time, poster backdrop, interactive action buttons (Internal Links or Appointment Modal trigger), and scroll anchor link.
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        searchPlaceholder="Search hero headline..."
      />

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={initialSliders}
        totalRows={totalRows}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={(page) => updateParams({ page })}
      />

      {/* Detail Slide-over Drawer */}
      <Drawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={activeSlider ? `Hero Slider #${activeSlider.id}` : "Slider Details"}
      >
        {activeSlider && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "var(--space-3)",
                padding: "var(--space-3)",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <div>
                <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                  Heading (H1)
                </span>
                <p style={{ margin: "2px 0 0 0", fontWeight: 600, fontSize: "var(--font-size-md)" }}>
                  {activeSlider.heading}
                </p>
              </div>

              <div>
                <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                  Public Status
                </span>
                <p style={{ margin: "4px 0 0 0" }}>
                  {activeSlider.is_public_active ? (
                    <span
                      className="badge"
                      style={{
                        background: "var(--success-bg, rgba(46, 125, 50, 0.15))",
                        color: "var(--success, #2e7d32)",
                        border: "1px solid var(--success-border, rgba(46, 125, 50, 0.3))",
                        padding: "2px 8px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "var(--font-size-xs)",
                        fontWeight: 600,
                      }}
                    >
                      Active on Public Website
                    </span>
                  ) : (
                    <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                      Inactive (superseded by newer record)
                    </span>
                  )}
                </p>
              </div>

              <div>
                <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                  Showcase Display Mode
                </span>
                <p style={{ margin: "4px 0 0 0", fontSize: "var(--font-size-sm)", display: "flex", alignItems: "center", gap: "6px" }}>
                  {activeSlider.media_type === "image" ? (
                    <span
                      style={{
                        background: "rgba(234, 179, 8, 0.15)",
                        color: "#eab308",
                        border: "1px solid rgba(234, 179, 8, 0.3)",
                        padding: "3px 10px",
                        borderRadius: "4px",
                        fontSize: "var(--font-size-xs)",
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <ImageIcon size={13} /> Showroom Photos (Day & Night Mode)
                    </span>
                  ) : (
                    <span
                      style={{
                        background: "rgba(59, 130, 246, 0.15)",
                        color: "#60a5fa",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        padding: "3px 10px",
                        borderRadius: "4px",
                        fontSize: "var(--font-size-xs)",
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Video size={13} /> Cinema Video ({activeSlider.video_provider || "youtube"})
                    </span>
                  )}
                </p>
              </div>

              {activeSlider.media_type === "image" ? (
                <div>
                  <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                    Day & Night Showroom Photography
                  </span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "6px" }}>
                    <div style={{ padding: "8px", border: "1px solid var(--border)", borderRadius: "4px", background: "rgba(255,255,255,0.02)" }}>
                      <div style={{ fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", color: "#f59e0b" }}>
                        <Sun size={12} /> Day Mode Photo
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {activeSlider.image_day || activeSlider.poster || "/assets/dch-day-showroom.webp"}
                      </div>
                    </div>
                    <div style={{ padding: "8px", border: "1px solid var(--border)", borderRadius: "4px", background: "rgba(255,255,255,0.02)" }}>
                      <div style={{ fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", color: "#818cf8" }}>
                        <Moon size={12} /> Night Mode Photo
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {activeSlider.image || activeSlider.poster_night || "/assets/dch-night-showroom.webp"}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                      Video Configuration
                    </span>
                    <p style={{ margin: "4px 0 0 0", fontSize: "var(--font-size-sm)" }}>
                      <strong>Provider:</strong> {activeSlider.video_provider || "youtube"} | <strong>Source:</strong> {activeSlider.video_source || "7cxfVWs4YGw"} | <strong>Start:</strong> {activeSlider.video_start_time ?? 45}s
                    </p>
                    <p style={{ margin: "2px 0 0 0", fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>
                      Accessible Title: {activeSlider.video_title || "DREAM CAR HOUSE Flagship Cinema"}
                    </p>
                  </div>

                  <div>
                    <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                      Poster Backdrop
                    </span>
                    <p style={{ margin: "4px 0 0 0", fontSize: "var(--font-size-sm)" }}>
                      <code>{activeSlider.poster || "/assets/dch-day-showroom.webp"}</code>
                    </p>
                  </div>
                </>
              )}

              <div>
                <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                  CTA Action Buttons ({activeSlider.cta_buttons?.length || 0})
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
                  {activeSlider.cta_buttons?.map((btn, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "6px 10px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "var(--font-size-xs)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>
                        <strong>{btn.label}</strong> ({btn.action})
                      </span>
                      <span className="muted">{btn.action === "link" ? btn.destination : "Triggers Modal"}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                  Scroll Down Indicator
                </span>
                <p style={{ margin: "4px 0 0 0", fontSize: "var(--font-size-sm)" }}>
                  {activeSlider.scroll_link_label ? (
                    <>
                      Label: &ldquo;{activeSlider.scroll_link_label}&rdquo; → Anchor: <code>{activeSlider.scroll_link_target || "#carousel-section"}</code>
                    </>
                  ) : (
                    <span className="muted">Disabled / Hidden on Hero Showcase</span>
                  )}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
              {canChange && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setDetailOpen(false);
                    handleOpenEdit(activeSlider);
                  }}
                >
                  <Edit size={12} style={{ marginRight: "4px" }} /> Edit Hero Banner
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setDetailOpen(false);
                    handleOpenDelete(activeSlider);
                  }}
                >
                  <Trash2 size={12} style={{ marginRight: "4px" }} /> Delete
                </Button>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Create Drawer */}
      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New Hero Video & Slider Banner"
      >
        <form onSubmit={handleSaveCreate} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <FormField label="Hero Headline (H1)" required error={errors.heading}>
            <Input
              value={createHeading}
              onChange={(e) => setCreateHeading(e.target.value)}
              placeholder="e.g. The Pinnacle of Luxury Automobiles"
              required
              maxLength={255}
              disabled={submitting}
            />
          </FormField>

          {/* Hero Showcase Mode Selector */}
          <FormField label="Hero Showcase Mode (Video vs Photography)" required>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "4px" }}>
              <button
                type="button"
                onClick={() => setCreateMediaType("video")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: createMediaType === "video" ? "2px solid #3b82f6" : "1px solid var(--border)",
                  background: createMediaType === "video" ? "rgba(59, 130, 246, 0.12)" : "rgba(255, 255, 255, 0.02)",
                  color: createMediaType === "video" ? "#60a5fa" : "var(--text-muted)",
                  cursor: "pointer",
                  textAlign: "left",
                  fontWeight: createMediaType === "video" ? 600 : 400,
                  transition: "all 0.2s ease",
                }}
              >
                <Video size={18} style={{ color: createMediaType === "video" ? "#3b82f6" : "inherit", flexShrink: 0 }} />
                <div>
                  <div style={{ color: "var(--text)", fontWeight: 600, fontSize: "13px" }}>Cinema Video</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    YouTube, Vimeo, or looping video
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCreateMediaType("image")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: createMediaType === "image" ? "2px solid #eab308" : "1px solid var(--border)",
                  background: createMediaType === "image" ? "rgba(234, 179, 8, 0.12)" : "rgba(255, 255, 255, 0.02)",
                  color: createMediaType === "image" ? "#fde047" : "var(--text-muted)",
                  cursor: "pointer",
                  textAlign: "left",
                  fontWeight: createMediaType === "image" ? 600 : 400,
                  transition: "all 0.2s ease",
                }}
              >
                <ImageIcon size={18} style={{ color: createMediaType === "image" ? "#eab308" : "inherit", flexShrink: 0 }} />
                <div>
                  <div style={{ color: "var(--text)", fontWeight: 600, fontSize: "13px" }}>Showroom Photos</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    Day Mode & Night Mode photos
                  </div>
                </div>
              </button>
            </div>
          </FormField>

          {/* Mode 1: Cinema Video Config */}
          {createMediaType === "video" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                padding: "14px",
                background: "rgba(59, 130, 246, 0.04)",
                border: "1px solid rgba(59, 130, 246, 0.25)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Video size={16} style={{ color: "#3b82f6" }} />
                <span style={{ fontWeight: 600, fontSize: "13px" }}>Cinema Video Configuration</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                <FormField label="Video Provider" required>
                  <select
                    value={createProvider}
                    onChange={(e) => setCreateProvider(e.target.value as "youtube" | "vimeo" | "direct")}
                    className="input"
                    disabled={submitting}
                  >
                    <option value="youtube">YouTube Embed (Cinema)</option>
                    <option value="vimeo">Vimeo Embed</option>
                    <option value="direct">Direct Video File / URL</option>
                  </select>
                </FormField>

                <FormField label="Video Start Time (Seconds)">
                  <Input
                    type="number"
                    min={0}
                    value={createStartTime}
                    onChange={(e) => setCreateStartTime(Number(e.target.value))}
                    disabled={submitting}
                  />
                </FormField>
              </div>

              <FormField label="Video Source (Video ID or Full URL)" required error={errors.video_source}>
                <Input
                  value={createSource}
                  onChange={(e) => setCreateSource(e.target.value)}
                  placeholder="e.g. 7cxfVWs4YGw or https://..."
                  required
                  disabled={submitting}
                />
              </FormField>

              {createProvider === "direct" && (
                <FormField
                  label="Upload Direct MP4 Video File"
                  description="Recommended: 1080p H.264 MP4 loop without audio"
                >
                  <input
                    type="file"
                    onChange={(e) => setCreateFile(e.target.files?.[0] || null)}
                    accept="video/mp4,video/webm"
                    className="input"
                    disabled={submitting}
                  />
                </FormField>
              )}

              <FormField label="Accessible Video Title">
                <Input
                  value={createVideoTitle}
                  onChange={(e) => setCreateVideoTitle(e.target.value)}
                  placeholder="e.g. DREAM CAR HOUSE Flagship Cinema"
                  disabled={submitting}
                />
              </FormField>

              <FormField
                label="Poster Backdrop URL (Before video plays)"
                description="Default: /assets/dch-day-showroom.webp"
              >
                <Input
                  value={createPoster}
                  onChange={(e) => setCreatePoster(e.target.value)}
                  placeholder="/assets/dch-day-showroom.webp"
                  disabled={submitting}
                />
              </FormField>
            </div>
          )}

          {/* Mode 2: Showroom Photography (Day & Night) */}
          {createMediaType === "image" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                padding: "14px",
                background: "rgba(234, 179, 8, 0.04)",
                border: "1px solid rgba(234, 179, 8, 0.25)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ImageIcon size={16} style={{ color: "#eab308" }} />
                <span style={{ fontWeight: 600, fontSize: "13px" }}>Showroom Photography (Day & Night Mode)</span>
              </div>

              {/* Day Mode Image Box */}
              <div style={{ padding: "12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <Sun size={15} style={{ color: "#f59e0b" }} />
                  <span style={{ fontWeight: 600, fontSize: "12px" }}>Day Mode Showroom Photo</span>
                  <span style={{ fontSize: "11px", color: "var(--muted)", marginLeft: "auto" }}>Light Mode background</span>
                </div>

                <FormField
                  label="Upload Day Mode Photo (.webp, .jpg, .png)"
                  description="Recommended size: 1920x1080 (16:9). Defaults to Day showroom if empty."
                >
                  <input
                    type="file"
                    onChange={(e) => setCreateFileDay(e.target.files?.[0] || null)}
                    accept="image/jpeg,image/png,image/webp"
                    className="input"
                    disabled={submitting}
                  />
                </FormField>

                <FormField
                  label="Or Day Photo Asset Path / URL"
                  description="Fallback path if no file is uploaded. Default: /assets/dch-day-showroom.webp"
                >
                  <Input
                    value={createPoster}
                    onChange={(e) => setCreatePoster(e.target.value)}
                    placeholder="/assets/dch-day-showroom.webp"
                    disabled={submitting}
                  />
                </FormField>
              </div>

              {/* Night Mode Image Box */}
              <div style={{ padding: "12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <Moon size={15} style={{ color: "#818cf8" }} />
                  <span style={{ fontWeight: 600, fontSize: "12px" }}>Night Mode Showroom Photo</span>
                  <span style={{ fontSize: "11px", color: "var(--muted)", marginLeft: "auto" }}>Dark Mode background</span>
                </div>

                <FormField
                  label="Upload Night Mode Photo (.webp, .jpg, .png)"
                  description="Recommended size: 1920x1080 (16:9). Default: /assets/dch-night-showroom.webp"
                >
                  <input
                    type="file"
                    onChange={(e) => setCreateFile(e.target.files?.[0] || null)}
                    accept="image/jpeg,image/png,image/webp"
                    className="input"
                    disabled={submitting}
                  />
                </FormField>

                <FormField
                  label="Or Night Photo Asset Path / URL"
                  description="Fallback path if no file is uploaded. Default: /assets/dch-night-showroom.webp"
                >
                  <Input
                    value={createPosterNight}
                    onChange={(e) => setCreatePosterNight(e.target.value)}
                    placeholder="/assets/dch-night-showroom.webp"
                    disabled={submitting}
                  />
                </FormField>
              </div>
            </div>
          )}

          {/* Scroll Down Indicator */}
          <div
            style={{
              padding: "12px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
              <input
                type="checkbox"
                checked={createShowScrollCue}
                onChange={(e) => setCreateShowScrollCue(e.target.checked)}
                disabled={submitting}
                style={{ accentColor: "var(--primary)" }}
              />
              <ArrowDown size={14} style={{ color: "var(--primary)" }} />
              <span>Show Animated Scroll Indicator on Homepage</span>
            </label>
            <div style={{ fontSize: "11px", color: "var(--muted)", marginLeft: "22px" }}>
              Displays the luxury floating &ldquo;Scroll to Current Inventory ↓&rdquo; pill at the bottom of the hero showcase.
            </div>

            {createShowScrollCue && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)", marginTop: "4px" }}>
                <FormField label="Scroll Link Label" description="Text shown inside pill button">
                  <Input
                    value={createScrollLabel}
                    onChange={(e) => setCreateScrollLabel(e.target.value)}
                    placeholder="Scroll to Current Inventory"
                    disabled={submitting}
                  />
                </FormField>

                <FormField label="Scroll Target Anchor" description="Section ID to smoothly scroll to">
                  <Input
                    value={createScrollTarget}
                    onChange={(e) => setCreateScrollTarget(e.target.value)}
                    placeholder="#carousel-section"
                    disabled={submitting}
                  />
                </FormField>
              </div>
            )}
          </div>

          {/* CTA Buttons Array Editor */}
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "var(--space-3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: "var(--font-size-sm)" }}>CTA Action Buttons</span>
                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--muted)" }}>Interactive action pills on top of the hero banner</div>
              </div>
              <Button type="button" size="sm" variant="secondary" onClick={addCreateCta} disabled={submitting}>
                <Plus size={12} /> Add CTA Button
              </Button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {createCtaButtons.map((btn, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    padding: "10px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <Input
                        placeholder="Button Label (e.g. Schedule Private Viewing)"
                        value={btn.label}
                        onChange={(e) => updateCreateCta(i, { label: e.target.value })}
                        disabled={submitting}
                        style={{ width: "100%" }}
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCreateCta(i)}
                      disabled={submitting}
                      style={{ color: "var(--danger)", padding: "6px" }}
                      title="Delete CTA Button"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "8px" }}>
                    <select
                      className="input"
                      value={btn.action}
                      onChange={(e) => updateCreateCta(i, { action: e.target.value as "link" | "appointment_modal" })}
                      disabled={submitting}
                    >
                      <option value="link">Action: Page Link</option>
                      <option value="appointment_modal">Action: Appointment Modal</option>
                    </select>
                    <Input
                      placeholder={btn.action === "link" ? "URL e.g. /inventory or #carousel-section" : "N/A (Opens VIP Appointment Modal)"}
                      value={btn.destination}
                      onChange={(e) => updateCreateCta(i, { destination: e.target.value })}
                      disabled={submitting || btn.action !== "link"}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end", marginTop: "var(--space-2)" }}>
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Publishing..." : "Publish Hero Banner"}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Edit Drawer */}
      <Drawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={activeSlider ? `Edit Hero Banner #${activeSlider.id}` : "Edit Hero Banner"}
      >
        {activeSlider && (
          <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <FormField label="Hero Headline (H1)" required error={errors.heading}>
              <Input
                value={editHeading}
                onChange={(e) => setEditHeading(e.target.value)}
                required
                maxLength={255}
                disabled={submitting}
              />
            </FormField>

            {/* Hero Showcase Mode Selector */}
            <FormField label="Hero Showcase Mode (Video vs Photography)" required>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "4px" }}>
                <button
                  type="button"
                  onClick={() => setEditMediaType("video")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 14px",
                    borderRadius: "var(--radius-sm)",
                    border: editMediaType === "video" ? "2px solid #3b82f6" : "1px solid var(--border)",
                    background: editMediaType === "video" ? "rgba(59, 130, 246, 0.12)" : "rgba(255, 255, 255, 0.02)",
                    color: editMediaType === "video" ? "#60a5fa" : "var(--text-muted)",
                    cursor: "pointer",
                    textAlign: "left",
                    fontWeight: editMediaType === "video" ? 600 : 400,
                    transition: "all 0.2s ease",
                  }}
                >
                  <Video size={18} style={{ color: editMediaType === "video" ? "#3b82f6" : "inherit", flexShrink: 0 }} />
                  <div>
                    <div style={{ color: "var(--text)", fontWeight: 600, fontSize: "13px" }}>Cinema Video</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                      YouTube, Vimeo, or looping video
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setEditMediaType("image")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 14px",
                    borderRadius: "var(--radius-sm)",
                    border: editMediaType === "image" ? "2px solid #eab308" : "1px solid var(--border)",
                    background: editMediaType === "image" ? "rgba(234, 179, 8, 0.12)" : "rgba(255, 255, 255, 0.02)",
                    color: editMediaType === "image" ? "#fde047" : "var(--text-muted)",
                    cursor: "pointer",
                    textAlign: "left",
                    fontWeight: editMediaType === "image" ? 600 : 400,
                    transition: "all 0.2s ease",
                  }}
                >
                  <ImageIcon size={18} style={{ color: editMediaType === "image" ? "#eab308" : "inherit", flexShrink: 0 }} />
                  <div>
                    <div style={{ color: "var(--text)", fontWeight: 600, fontSize: "13px" }}>Showroom Photos</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                      Day Mode & Night Mode photos
                    </div>
                  </div>
                </button>
              </div>
            </FormField>

            {/* Mode 1: Cinema Video Config */}
            {editMediaType === "video" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  padding: "14px",
                  background: "rgba(59, 130, 246, 0.04)",
                  border: "1px solid rgba(59, 130, 246, 0.25)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Video size={16} style={{ color: "#3b82f6" }} />
                  <span style={{ fontWeight: 600, fontSize: "13px" }}>Cinema Video Configuration</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                  <FormField label="Video Provider" required>
                    <select
                      value={editProvider}
                      onChange={(e) => setEditProvider(e.target.value as "youtube" | "vimeo" | "direct")}
                      className="input"
                      disabled={submitting}
                    >
                      <option value="youtube">YouTube Embed (Cinema)</option>
                      <option value="vimeo">Vimeo Embed</option>
                      <option value="direct">Direct Video File / URL</option>
                    </select>
                  </FormField>

                  <FormField label="Video Start Time (Seconds)">
                    <Input
                      type="number"
                      min={0}
                      value={editStartTime}
                      onChange={(e) => setEditStartTime(Number(e.target.value))}
                      disabled={submitting}
                    />
                  </FormField>
                </div>

                <FormField label="Video Source (Video ID or Full URL)" required error={errors.video_source}>
                  <Input
                    value={editSource}
                    onChange={(e) => setEditSource(e.target.value)}
                    placeholder="e.g. 7cxfVWs4YGw or https://..."
                    required
                    disabled={submitting}
                  />
                </FormField>

                {editProvider === "direct" && (
                  <FormField
                    label="Upload Direct MP4 Video File"
                    description="Recommended: 1080p H.264 MP4 loop without audio"
                  >
                    <input
                      type="file"
                      onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                      accept="video/mp4,video/webm"
                      className="input"
                      disabled={submitting}
                    />
                  </FormField>
                )}

                <FormField label="Accessible Video Title">
                  <Input
                    value={editVideoTitle}
                    onChange={(e) => setEditVideoTitle(e.target.value)}
                    placeholder="e.g. DREAM CAR HOUSE Flagship Cinema"
                    disabled={submitting}
                  />
                </FormField>

                <FormField
                  label="Poster Backdrop URL (Before video plays)"
                  description="Default: /assets/dch-day-showroom.webp"
                >
                  <Input
                    value={editPoster}
                    onChange={(e) => setEditPoster(e.target.value)}
                    placeholder="/assets/dch-day-showroom.webp"
                    disabled={submitting}
                  />
                </FormField>
              </div>
            )}

            {/* Mode 2: Showroom Photography (Day & Night) */}
            {editMediaType === "image" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  padding: "14px",
                  background: "rgba(234, 179, 8, 0.04)",
                  border: "1px solid rgba(234, 179, 8, 0.25)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ImageIcon size={16} style={{ color: "#eab308" }} />
                  <span style={{ fontWeight: 600, fontSize: "13px" }}>Showroom Photography (Day & Night Mode)</span>
                </div>

                {/* Day Mode Image Box */}
                <div style={{ padding: "12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                    <Sun size={15} style={{ color: "#f59e0b" }} />
                    <span style={{ fontWeight: 600, fontSize: "12px" }}>Day Mode Showroom Photo</span>
                    <span style={{ fontSize: "11px", color: "var(--muted)", marginLeft: "auto" }}>Light Mode background</span>
                  </div>

                  {activeSlider?.image_day && !clearImageDay && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", padding: "8px", background: "rgba(255,255,255,0.03)", borderRadius: "4px" }}>
                      <img
                        src={activeSlider.image_day}
                        alt="Current Day Photo"
                        style={{ width: "80px", height: "45px", objectFit: "cover", borderRadius: "3px", border: "1px solid var(--border)" }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text)" }}>Current Uploaded Day Photo</div>
                        <div style={{ fontSize: "10px", color: "var(--muted)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                          {activeSlider.image_day}
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setClearImageDay(true)}
                        style={{ color: "var(--danger)", fontSize: "11px" }}
                      >
                        Remove
                      </Button>
                    </div>
                  )}

                  {clearImageDay && (
                    <div style={{ fontSize: "11px", color: "var(--warning)", marginBottom: "8px" }}>
                      Day Photo marked for removal (will fall back to default Day Showroom).{" "}
                      <button
                        type="button"
                        onClick={() => setClearImageDay(false)}
                        style={{ textDecoration: "underline", background: "none", border: "none", color: "inherit", cursor: "pointer" }}
                      >
                        Undo
                      </button>
                    </div>
                  )}

                  <FormField
                    label="Upload New Day Mode Photo (.webp, .jpg, .png)"
                    description="Recommended size: 1920x1080 (16:9). Leave empty to keep current."
                  >
                    <input
                      type="file"
                      onChange={(e) => {
                        setEditFileDay(e.target.files?.[0] || null);
                        if (e.target.files?.[0]) setClearImageDay(false);
                      }}
                      accept="image/jpeg,image/png,image/webp"
                      className="input"
                      disabled={submitting}
                    />
                  </FormField>

                  <FormField
                    label="Or Day Photo Asset Path / URL"
                    description="Fallback path if no file is uploaded. Default: /assets/dch-day-showroom.webp"
                  >
                    <Input
                      value={editPoster}
                      onChange={(e) => setEditPoster(e.target.value)}
                      placeholder="/assets/dch-day-showroom.webp"
                      disabled={submitting}
                    />
                  </FormField>
                </div>

                {/* Night Mode Image Box */}
                <div style={{ padding: "12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                    <Moon size={15} style={{ color: "#818cf8" }} />
                    <span style={{ fontWeight: 600, fontSize: "12px" }}>Night Mode Showroom Photo</span>
                    <span style={{ fontSize: "11px", color: "var(--muted)", marginLeft: "auto" }}>Dark Mode background</span>
                  </div>

                  {activeSlider?.image && !clearImage && !/\.(mp4|webm|mov|m4v)$/i.test(activeSlider.image) && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", padding: "8px", background: "rgba(255,255,255,0.03)", borderRadius: "4px" }}>
                      <img
                        src={activeSlider.image}
                        alt="Current Night Photo"
                        style={{ width: "80px", height: "45px", objectFit: "cover", borderRadius: "3px", border: "1px solid var(--border)" }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text)" }}>Current Uploaded Night Photo</div>
                        <div style={{ fontSize: "10px", color: "var(--muted)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                          {activeSlider.image}
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setClearImage(true)}
                        style={{ color: "var(--danger)", fontSize: "11px" }}
                      >
                        Remove
                      </Button>
                    </div>
                  )}

                  {clearImage && (
                    <div style={{ fontSize: "11px", color: "var(--warning)", marginBottom: "8px" }}>
                      Night Photo marked for removal (will fall back to default Night Showroom).{" "}
                      <button
                        type="button"
                        onClick={() => setClearImage(false)}
                        style={{ textDecoration: "underline", background: "none", border: "none", color: "inherit", cursor: "pointer" }}
                      >
                        Undo
                      </button>
                    </div>
                  )}

                  <FormField
                    label="Upload New Night Mode Photo (.webp, .jpg, .png)"
                    description="Recommended size: 1920x1080 (16:9). Default: /assets/dch-night-showroom.webp"
                  >
                    <input
                      type="file"
                      onChange={(e) => {
                        setEditFile(e.target.files?.[0] || null);
                        if (e.target.files?.[0]) setClearImage(false);
                      }}
                      accept="image/jpeg,image/png,image/webp"
                      className="input"
                      disabled={submitting}
                    />
                  </FormField>

                  <FormField
                    label="Or Night Photo Asset Path / URL"
                    description="Fallback path if no file is uploaded. Default: /assets/dch-night-showroom.webp"
                  >
                    <Input
                      value={editPosterNight}
                      onChange={(e) => setEditPosterNight(e.target.value)}
                      placeholder="/assets/dch-night-showroom.webp"
                      disabled={submitting}
                    />
                  </FormField>
                </div>
              </div>
            )}

            {/* Scroll Down Indicator */}
            <div
              style={{
                padding: "12px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
                <input
                  type="checkbox"
                  checked={editShowScrollCue}
                  onChange={(e) => setEditShowScrollCue(e.target.checked)}
                  disabled={submitting}
                  style={{ accentColor: "var(--primary)" }}
                />
                <ArrowDown size={14} style={{ color: "var(--primary)" }} />
                <span>Show Animated Scroll Indicator on Homepage</span>
              </label>
              <div style={{ fontSize: "11px", color: "var(--muted)", marginLeft: "22px" }}>
                Displays the luxury floating &ldquo;Scroll to Current Inventory ↓&rdquo; pill at the bottom of the hero showcase.
              </div>

            {editShowScrollCue && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)", marginTop: "4px" }}>
                <FormField label="Scroll Link Label" description="Text shown inside pill button">
                  <Input
                    value={editScrollLabel}
                    onChange={(e) => setEditScrollLabel(e.target.value)}
                    placeholder="Scroll to Current Inventory"
                    disabled={submitting}
                  />
                </FormField>

                <FormField label="Scroll Target Anchor" description="Section ID to smoothly scroll to">
                  <Input
                    value={editScrollTarget}
                    onChange={(e) => setEditScrollTarget(e.target.value)}
                    placeholder="#carousel-section"
                    disabled={submitting}
                  />
                </FormField>
              </div>
            )}
            </div>

            {/* CTA Buttons Array Editor */}
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "var(--space-3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: "var(--font-size-sm)" }}>CTA Action Buttons</span>
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--muted)" }}>Interactive action pills on top of the hero banner</div>
                </div>
                <Button type="button" size="sm" variant="secondary" onClick={addEditCta} disabled={submitting}>
                  <Plus size={12} /> Add CTA Button
                </Button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                {editCtaButtons.map((btn, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      padding: "10px",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <div style={{ flex: 1 }}>
                        <Input
                          placeholder="Button Label (e.g. Schedule Private Viewing)"
                          value={btn.label}
                          onChange={(e) => updateEditCta(i, { label: e.target.value })}
                          disabled={submitting}
                          style={{ width: "100%" }}
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeEditCta(i)}
                        disabled={submitting}
                        style={{ color: "var(--danger)", padding: "6px" }}
                        title="Delete CTA Button"
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "8px" }}>
                      <select
                        className="input"
                        value={btn.action}
                        onChange={(e) => updateEditCta(i, { action: e.target.value as "link" | "appointment_modal" })}
                        disabled={submitting}
                      >
                        <option value="link">Action: Page Link</option>
                        <option value="appointment_modal">Action: Appointment Modal</option>
                      </select>
                      <Input
                        placeholder={btn.action === "link" ? "URL e.g. /inventory or #carousel-section" : "N/A (Opens VIP Appointment Modal)"}
                        value={btn.destination}
                        onChange={(e) => updateEditCta(i, { destination: e.target.value })}
                        disabled={submitting || btn.action !== "link"}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end", marginTop: "var(--space-2)" }}>
              <Button type="button" variant="ghost" onClick={() => setEditOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Confirm Slider Deletion"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "flex-start" }}>
            <AlertTriangle size={20} style={{ color: "var(--danger)", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <p style={{ margin: "0 0 var(--space-2) 0", fontWeight: 500 }}>
                Are you sure you want to delete this slider item?
              </p>
              <p className="muted" style={{ margin: 0, fontSize: "var(--font-size-sm)" }}>
                Heading: <strong>{activeSlider?.heading}</strong>
              </p>
              {activeSlider?.is_public_active && (
                <p style={{ margin: "var(--space-2) 0 0 0", color: "var(--danger)", fontSize: "var(--font-size-xs)", fontWeight: 500 }}>
                  ⚠️ This is currently the active public homepage banner! Deleting it will fall back to the preceding record, or empty if none exist.
                </p>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end", marginTop: "var(--space-2)" }}>
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={submitting}
            >
              {submitting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
