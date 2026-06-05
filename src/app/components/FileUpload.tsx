"use client";

import { useState, useRef, useCallback } from "react";

interface FileUploadProps {
  onUploadComplete: (status: string) => void;
  onFileSelect?: (file: File | null) => void;
  onProgressUpdate?: (progress: { overall: number }) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in MB
  label?: string;
  required?: boolean;
  placeholder?: string;
  uploadEndpoint: string; // Make the endpoint configurable
  autoUpload?: boolean; // Whether to upload immediately or wait for form submission
}

export default function FileUpload({
  onUploadComplete,
  onFileSelect,
  onProgressUpdate,
  acceptedFileTypes = [".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg"],
  maxFileSize = 4, // 4MB default
  label = "Upload File",
  required = false,
  placeholder = "Drag and drop a file here, or click to browse",
  uploadEndpoint,
  autoUpload = false,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        return `File size must be less than ${maxFileSize}MB`;
      }

      // Check file type
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
      if (!acceptedFileTypes.includes(fileExtension)) {
        return `File type not supported. Accepted types: ${acceptedFileTypes.join(", ")}`;
      }

      return null;
    },
    [maxFileSize, acceptedFileTypes],
  );

  const validateAndProcessFile = async (file: File): Promise<void> => {
    // Just validate the file and mark it as ready
    // No actual upload happens here - that will be done later to Supabase
    return Promise.resolve();
  };

  const handleUpload = useCallback(
    async (file?: File) => {
      const fileToUpload = file || selectedFile;
      if (!fileToUpload) return;

      setIsUploading(true);
      setError("");

      try {
        // Notify parent of upload start
        onProgressUpdate?.({ overall: 0 });

        await validateAndProcessFile(fileToUpload);
        // No actual upload happens here - just validation
        // Call onUploadComplete with a status to indicate success
        onUploadComplete("file_ready");

        // Reset after successful upload
        setTimeout(() => {
          setSelectedFile(null);
          setIsUploading(false);
        }, 1000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
        setIsUploading(false);
        // Notify parent of error
        onProgressUpdate?.({ overall: 0 });
      }
    },
    [selectedFile, onUploadComplete, onProgressUpdate],
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      setError("");
      const validationError = validateFile(file);

      if (validationError) {
        setError(validationError);
        return;
      }

      setSelectedFile(file);
      onFileSelect?.(file);

      // Auto-upload if enabled
      if (autoUpload) {
        handleUpload(file);
      }
    },
    [validateFile, onFileSelect, autoUpload, handleUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect],
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError("");
    onFileSelect?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-text">
        {label} {required && <span className="text-accent">*</span>}
      </label>

      <div
        className={`relative rounded-xl border border-dashed p-8 text-center transition ${
          isDragOver
            ? "border-accent bg-accent-soft"
            : selectedFile
              ? "border-hairline bg-surface"
              : "border-hairline bg-surface hover:border-accent/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!selectedFile && (
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFileTypes.join(",")}
            onChange={handleFileInputChange}
            className="absolute inset-0 cursor-pointer opacity-0"
            disabled={isUploading}
          />
        )}

        {!selectedFile && !isUploading && (
          <div className="pointer-events-none flex flex-col items-center gap-2">
            <span className="text-2xl">📁</span>
            <p className="text-sm text-text">{placeholder}</p>
            <p className="text-xs text-text-muted">
              Accepted formats: {acceptedFileTypes.join(", ")} (max {maxFileSize}MB)
            </p>
          </div>
        )}

        {selectedFile && !isUploading && (
          <div className="flex items-center gap-4 text-left">
            <span className="text-2xl">📄</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text">{selectedFile.name}</p>
              <p className="text-xs text-text-muted">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                clearFile();
              }}
              aria-label="Remove file"
              className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
            >
              ✕
            </button>
          </div>
        )}

        {isUploading && (
          <div className="flex items-center justify-center gap-3 text-sm text-text-muted">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-text-muted/40 border-t-accent" />
            Uploading file...
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-error">{error}</p>}
    </div>
  );
}
