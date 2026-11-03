"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Film,
  Plus,
  Image as ImageIcon,
  Video,
  Volume2,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import type { ShowroomStoryItem } from "@/lib/types";
import {
  createStoryAction,
  updateStoryAction,
  deleteStoryAction,
  toggleStoryStatusAction,
} from "@/app/actions/stories";

interface StoriesClientProps {
  initialStories: ShowroomStoryItem[];
  userPermissions?: string[];
}

export function StoriesClient({
  initialStories,
  userPermissions = [],
}: StoriesClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const canChange =
    userPermissions.includes("*") ||
    userPermissions.includes("home.change_showroomstory") ||
    userPermissions.includes("home.add_showroomstory");

  const [stories, setStories] = useState<ShowroomStoryItem[]>(initialStories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<ShowroomStoryItem | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formMediaType, setFormMediaType] = useState<"image" | "video">("image");
  const [formTitle, setFormTitle] = useState("");
  const [formTag, setFormTag] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formPriceNote, setFormPriceNote] = useState("");
  const [formBrand, setFormBrand] = useState("");
  const [formCtaText, setFormCtaText] = useState("Inspect Vehicle");
  const [formCtaLink, setFormCtaLink] = useState("/inventory");
  const [formWhatsapp, setFormWhatsapp] = useState("");
  const [formAccentColor, setFormAccentColor] = useState("#38bdf8");
  const [formOrder, setFormOrder] = useState<number>(1);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formRemoteUrl, setFormRemoteUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const openCreateModal = () => {
    setEditingStory(null);
    setFormMediaType("image");
    setFormTitle("");
    setFormTag("NEW ARRIVAL • KAKRAIL SHOWROOM");
    setFormSubtitle("");
    setFormPriceNote("Available in Showroom");
    setFormBrand("");
    setFormCtaText("Inspect Vehicle");
    setFormCtaLink("/inventory");
    setFormWhatsapp("Hello Dream Car House, I want to inquire about this vehicle from your Showroom Story.");
    setFormAccentColor("#38bdf8");
    setFormOrder(stories.length + 1);
    setFormIsActive(true);
    setFormRemoteUrl("");
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (story: ShowroomStoryItem) => {
    setEditingStory(story);
    setFormMediaType(story.media_type);
    setFormTitle(story.title);
    setFormTag(story.tag);
    setFormSubtitle(story.subtitle || "");
    setFormPriceNote(story.price_note || "");
    setFormBrand(story.brand || "");
    setFormCtaText(story.cta_text || "Inspect Vehicle");
    setFormCtaLink(story.cta_link || "/inventory");
    setFormWhatsapp(story.whatsapp_message || "");
    setFormAccentColor(story.accent_color || "#38bdf8");
    setFormOrder(story.order);
    setFormIsActive(story.is_active);
    setFormRemoteUrl(story.media_url || "");
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (story: ShowroomStoryItem) => {
    const nextState = !story.is_active;
    const res = await toggleStoryStatusAction(story.id, nextState);
    if (res.ok) {
      setStories((prev) =>
        prev.map((s) => (s.id === story.id ? { ...s, is_active: nextState } : s))
      );
      showToast({
        type: "success",
        title: "Status Updated",
        message: `Story is now ${nextState ? "Live" : "Inactive"}.`,
      });
      router.refresh();
    } else {
      showToast({
        type: "error",
        title: "Update Failed",
        message: res.error?.message || "Could not update status.",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this showroom story?")) return;
    const res = await deleteStoryAction(id);
    if (res.ok) {
      setStories((prev) => prev.filter((s) => s.id !== id));
      showToast({
        type: "success",
        title: "Story Deleted",
        message: "Showroom story removed permanently.",
      });
      router.refresh();
    } else {
      showToast({
        type: "error",
        title: "Delete Failed",
        message: res.error?.message || "Could not delete story.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast({
        type: "error",
        title: "Validation Error",
        message: "Story Title is required.",
      });
      return;
    }

    setLoading(true);
    const fd = new FormData();
    fd.append("title", formTitle);
    fd.append("tag", formTag);
    fd.append("subtitle", formSubtitle);
    fd.append("price_note", formPriceNote);
    fd.append("brand", formBrand);
    fd.append("media_type", formMediaType);
    fd.append("cta_text", formCtaText);
    fd.append("cta_link", formCtaLink);
    fd.append("whatsapp_message", formWhatsapp);
    fd.append("accent_color", formAccentColor);
    fd.append("order", String(formOrder));
    fd.append("is_active", String(formIsActive));
    fd.append("media_url", formRemoteUrl);

    if (selectedFile) {
      fd.append("media_file", selectedFile);
    }

    try {
      if (editingStory) {
        const res = await updateStoryAction(editingStory.id, fd);
        if (res.ok) {
          const updated = res.data;
          setStories((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
          showToast({
            type: "success",
            title: "Story Updated",
            message: "Showroom story saved successfully.",
          });
          setIsModalOpen(false);
          router.refresh();
        } else {
          showToast({
            type: "error",
            title: "Save Failed",
            message: !res.ok ? res.error?.message || "Failed to update story." : "",
          });
        }
      } else {
        const res = await createStoryAction(fd);
        if (res.ok) {
          const created = res.data;
          setStories((prev) => [...prev, created]);
          showToast({
            type: "success",
            title: "Story Created",
            message: "New showroom story published.",
          });
          setIsModalOpen(false);
          router.refresh();
        } else {
          showToast({
            type: "error",
            title: "Creation Failed",
            message: !res.ok ? res.error?.message || "Failed to create story." : "",
          });
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast({
        type: "error",
        title: "Network Error",
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "1.5rem" }}>
      {/* 1. Luxury Creator Guidelines Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(24, 24, 27, 0.95), rgba(9, 9, 11, 0.98))",
          border: "1px solid rgba(255, 215, 0, 0.25)",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "2rem",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <Sparkles size={20} color="#eab308" />
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fef08a", margin: 0 }}>
            VIP Showroom Stories & Video Reel Guidelines
          </h2>
          <Badge tone="warning">9:16 Vertical Portrait</Badge>
        </div>
        <p style={{ color: "#a1a1aa", fontSize: "0.9rem", lineHeight: 1.6, margin: "0 0 1rem 0" }}>
          Showroom stories are highlighted directly in the public header steering wheel icon. They provide a high-touch cinematic viewing experience for luxury buyers. Please adhere to the specifications below:
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1rem",
            background: "rgba(0,0,0,0.4)",
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Card 1: Ratio & Dimensions */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#38bdf8", fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.35rem" }}>
              <Layers size={16} />
              <span>Aspect Ratio & Resolution</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "#d4d4d8", fontSize: "0.82rem", lineHeight: 1.5 }}>
              <li><strong>Optimal Ratio:</strong> 9:16 (Vertical Portrait)</li>
              <li><strong>Resolution:</strong> 1080 x 1920 pixels (Full HD)</li>
              <li>Matches mobile & desktop story viewers</li>
            </ul>
          </div>

          {/* Card 2: Image Specifications */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#4ade80", fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.35rem" }}>
              <ImageIcon size={16} />
              <span>Image Specifications</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "#d4d4d8", fontSize: "0.82rem", lineHeight: 1.5 }}>
              <li><strong>Formats:</strong> JPG, JPEG, PNG, WebP</li>
              <li><strong>Max Size:</strong> 5 MB per image</li>
              <li>Clean, high-contrast showroom lighting recommended</li>
            </ul>
          </div>

          {/* Card 3: Video Specifications & Audio UX */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#f43f5e", fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.35rem" }}>
              <Video size={16} />
              <span>Video Reels & Native Audio</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "#d4d4d8", fontSize: "0.82rem", lineHeight: 1.5 }}>
              <li><strong>Formats:</strong> MP4 (H.264), WebM</li>
              <li><strong>Recommended Duration:</strong> 5 – 15 seconds</li>
              <li><strong>Max Size:</strong> 25 MB per video</li>
              <li><strong>Audio Behavior:</strong> Starts muted by default; visitors can tap the unmute button to hear real engine roar.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2. Controls & Story Management Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", margin: 0 }}>
            Showroom Stories ({stories.length})
          </h1>
          <p style={{ color: "#71717a", fontSize: "0.85rem", margin: "0.25rem 0 0 0" }}>
            Active stories rotate dynamically in the public showroom player.
          </p>
        </div>
        <Button onClick={openCreateModal} disabled={!canChange} variant="primary">
          <Plus size={16} style={{ marginRight: "0.5rem" }} />
          Create New Story
        </Button>
      </div>

      {/* 3. Stories Grid Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {stories.map((story) => {
          const mediaSrc = story.resolved_media_url || story.media_url || story.media_file || "";
          return (
            <div
              key={story.id}
              style={{
                background: "rgba(24, 24, 27, 0.8)",
                border: `1px solid ${story.is_active ? "rgba(255,255,255,0.12)" : "rgba(239, 68, 68, 0.3)"}`,
                borderRadius: "10px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              {/* Top Media Preview (9:16 Portrait style cropped) */}
              <div
                style={{
                  height: "220px",
                  background: "#000",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {story.media_type === "video" ? (
                  <video
                    src={mediaSrc}
                    muted
                    loop
                    playsInline
                    autoPlay
                    style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
                  />
                ) : (
                  <img
                    src={mediaSrc}
                    alt={story.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=600&q=80";
                    }}
                  />
                )}

                {/* Floating Media Type Badge */}
                <div style={{ position: "absolute", top: "10px", left: "10px", display: "flex", gap: "6px" }}>
                  <span
                    style={{
                      background: "rgba(0,0,0,0.8)",
                      backdropFilter: "blur(4px)",
                      color: story.media_type === "video" ? "#f43f5e" : "#38bdf8",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {story.media_type === "video" ? <Video size={12} /> : <ImageIcon size={12} />}
                    {story.media_type.toUpperCase()}
                  </span>
                  <span
                    style={{
                      background: "rgba(0,0,0,0.8)",
                      color: "#fbbf24",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                    }}
                  >
                    #{story.order}
                  </span>
                </div>

                {/* Status Badge */}
                <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                  <button
                    onClick={() => handleToggleStatus(story)}
                    style={{
                      background: story.is_active ? "rgba(34, 197, 94, 0.9)" : "rgba(239, 68, 68, 0.9)",
                      color: "#fff",
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {story.is_active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {story.is_active ? "ACTIVE" : "INACTIVE"}
                  </button>
                </div>
              </div>

              {/* Story Content Details */}
              <div style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: story.accent_color || "#38bdf8",
                    marginBottom: "0.25rem",
                  }}
                >
                  {story.tag || "SHOWROOM STORY"}
                </span>

                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", margin: "0 0 0.5rem 0" }}>
                  {story.title}
                </h3>

                {story.subtitle && (
                  <p
                    style={{
                      color: "#a1a1aa",
                      fontSize: "0.8rem",
                      lineHeight: 1.4,
                      margin: "0 0 0.75rem 0",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {story.subtitle}
                  </p>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontSize: "0.75rem", color: "#e4e4e7" }}>
                    {story.price_note || story.brand || "Dream Car House"}
                  </span>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Button
                      onClick={() => openEditModal(story)}
                      disabled={!canChange}
                      variant="secondary"
                      size="sm"
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      onClick={() => handleDelete(story.id)}
                      disabled={!canChange}
                      variant="danger"
                      size="sm"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Create / Edit Dialog Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStory ? "Edit Showroom Story" : "Create VIP Showroom Story"}
        description="Upload a 9:16 portrait image or MP4 video reel for the public header story player."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Media Type & Upload Section */}
          <div
            style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              padding: "1rem",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "0.35rem" }}>
                  Media Type
                </label>
                <select
                  value={formMediaType}
                  onChange={(e) => setFormMediaType(e.target.value as "image" | "video")}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    borderRadius: "6px",
                    background: "#18181b",
                    color: "#fff",
                    border: "1px solid #3f3f46",
                  }}
                >
                  <option value="image">Image (Portrait 9:16)</option>
                  <option value="video">Video Reel (Portrait 9:16 MP4/WebM)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "0.35rem" }}>
                  Accent Highlight Color (Hex)
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="color"
                    value={formAccentColor}
                    onChange={(e) => setFormAccentColor(e.target.value)}
                    style={{ width: "42px", height: "38px", border: "none", background: "transparent", cursor: "pointer" }}
                  />
                  <Input
                    value={formAccentColor}
                    onChange={(e) => setFormAccentColor(e.target.value)}
                    placeholder="#38bdf8"
                  />
                </div>
              </div>
            </div>

            {/* File Upload with size guidelines */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "0.35rem" }}>
                Upload Media File ({formMediaType === "video" ? "MP4/WebM up to 25MB" : "JPG/PNG/WebP up to 5MB"})
              </label>
              <input
                type="file"
                accept={formMediaType === "video" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp"}
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "6px",
                  background: "#18181b",
                  color: "#fff",
                  border: "1px dashed #52525b",
                }}
              />
              <span style={{ fontSize: "0.75rem", color: "#71717a", display: "block", marginTop: "4px" }}>
                📐 Recommended: 1080x1920 (9:16 ratio). {formMediaType === "video" && "Video plays muted initially for executive comfort."}
              </span>
            </div>

            {/* Remote Fallback URL */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "0.35rem" }}>
                Or Remote CDN / Video URL (Optional fallback)
              </label>
              <Input
                value={formRemoteUrl}
                onChange={(e) => setFormRemoteUrl(e.target.value)}
                placeholder="https://... (e.g. Unsplash or Cloud Storage video URL)"
              />
            </div>
          </div>

          {/* Text Fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "0.35rem" }}>
                Vehicle / Story Title *
              </label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. 2025 Mercedes-Benz G 580 EQ"
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "0.35rem" }}>
                Story Tag / Header Eyebrow
              </label>
              <Input
                value={formTag}
                onChange={(e) => setFormTag(e.target.value)}
                placeholder="e.g. NEW ARRIVAL • KAKRAIL SHOWROOM"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "0.35rem" }}>
                Brand Name
              </label>
              <Input
                value={formBrand}
                onChange={(e) => setFormBrand(e.target.value)}
                placeholder="e.g. Mercedes-Benz, Lexus, BMW"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "0.35rem" }}>
                Price Note / Availability
              </label>
              <Input
                value={formPriceNote}
                onChange={(e) => setFormPriceNote(e.target.value)}
                placeholder="e.g. Available in Showroom / Call for Price"
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "0.35rem" }}>
              Story Subtitle / Key Specs
            </label>
            <Textarea
              value={formSubtitle}
              onChange={(e) => setFormSubtitle(e.target.value)}
              placeholder="e.g. 1,164 Nm Torque • 4 Individual Electric Motors • Bespoke Nappa Leather"
              rows={2}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "0.35rem" }}>
                CTA Button Text
              </label>
              <Input
                value={formCtaText}
                onChange={(e) => setFormCtaText(e.target.value)}
                placeholder="Inspect Vehicle"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "0.35rem" }}>
                CTA Destination URL
              </label>
              <Input
                value={formCtaLink}
                onChange={(e) => setFormCtaLink(e.target.value)}
                placeholder="/inventory"
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "0.35rem" }}>
              WhatsApp Inquiry Pre-fill Message
            </label>
            <Input
              value={formWhatsapp}
              onChange={(e) => setFormWhatsapp(e.target.value)}
              placeholder="Hello Dream Car House, I want to inquire about this vehicle..."
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "0.35rem" }}>
                Display Order
              </label>
              <Input
                type="number"
                value={formOrder}
                onChange={(e) => setFormOrder(Number(e.target.value))}
                min={1}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", paddingTop: "1.2rem" }}>
              <input
                type="checkbox"
                id="is_active_checkbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                style={{ width: "18px", height: "18px" }}
              />
              <label htmlFor="is_active_checkbox" style={{ fontSize: "0.9rem", color: "#fff", cursor: "pointer" }}>
                Publish Immediately (Active)
              </label>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
            <Button type="button" onClick={() => setIsModalOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} variant="primary">
              {loading ? "Saving..." : editingStory ? "Update Story" : "Create Story"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
