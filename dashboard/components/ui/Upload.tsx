"use client";

import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import { UploadCloud, X } from "lucide-react";
import { Button } from "./Button";

export interface UploadProps {
  id?: string;
  name?: string;
  required?: boolean;
  accept?: string;
  multiple?: boolean;
  maxSizeBytes?: number;
  onFilesSelected?: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
}

export function Upload({
  id = "ui-file-upload",
  name,
  required = false,
  accept,
  multiple = false,
  maxSizeBytes = 10 * 1024 * 1024, // 10MB default
  onFilesSelected,
  disabled,
  className = "",
}: UploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function validateAndSelect(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const validFiles: File[] = [];
    const names: string[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]!;
      if (maxSizeBytes && file.size > maxSizeBytes) {
        setError(`File "${file.name}" exceeds the maximum size limit (${Math.round(maxSizeBytes / (1024 * 1024))}MB).`);
        return;
      }
      validFiles.push(file);
      names.push(file.name);
    }

    setSelectedNames(names);
    onFilesSelected?.(validFiles);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    validateAndSelect(e.target.files);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    if (!disabled) {
      validateAndSelect(e.dataTransfer.files);
    }
  }

  return (
    <div className={`ui-upload-container ${className}`.trim()}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`ui-upload-dropzone ${isDragOver ? "ui-upload-dropzone--dragover" : ""} ${disabled ? "ui-upload-dropzone--disabled" : ""}`}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        aria-label="Upload files by dragging or clicking"
      >
        <input
          ref={inputRef}
          id={id}
          name={name}
          required={required}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleInputChange}
          className="ui-upload-input"
          aria-hidden="true"
        />

        <div className="ui-upload-content">
          <span className="ui-upload-icon" aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <UploadCloud size={32} style={{ color: "var(--accent)" }} />
          </span>
          <p className="ui-upload-prompt">
            <strong>Click to upload</strong> or drag and drop
          </p>
          <p className="ui-upload-hint">
            {accept ? `Supported formats: ${accept}` : "All supported file types"} (up to {Math.round(maxSizeBytes / (1024 * 1024))}MB)
          </p>
        </div>
      </div>

      {error && (
        <p role="alert" className="ui-upload-error">
          {error}
        </p>
      )}

      {selectedNames.length > 0 && (
        <ul className="ui-upload-list" aria-label="Selected files">
          {selectedNames.map((name, idx) => (
            <li key={idx} className="ui-upload-item">
              <span className="ui-upload-filename">{name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNames((prev) => prev.filter((_, i) => i !== idx));
                }}
                aria-label={`Remove file ${name}`}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "4px" }}
              >
                <X size={14} />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
