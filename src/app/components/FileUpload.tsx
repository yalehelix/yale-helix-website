"use client";

import { useState, useRef, useCallback } from "react";
import styles from "./FileUpload.module.css";

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



  const handleUpload = useCallback(async (file?: File) => {
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
  }, [selectedFile, onUploadComplete, validateAndProcessFile, onProgressUpdate]);

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
    <div className={styles.uploadContainer}>
      <label className={styles.label}>
        {label} {required && <span className={styles.required}>*</span>}
      </label>

      <div
        className={`${styles.uploadArea} ${isDragOver ? styles.dragOver : ""} ${selectedFile ? styles.hasFile : ""}`}
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
            className={styles.fileInput}
            disabled={isUploading}
          />
        )}

        {!selectedFile && !isUploading && (
          <div className={styles.uploadContent}>
            <div className={styles.uploadIcon}>📁</div>
            <p className={styles.uploadText}>{placeholder}</p>
            <p className={styles.uploadHint}>
              Accepted formats: {acceptedFileTypes.join(", ")} (Max {maxFileSize}MB)
            </p>
          </div>
        )}

        {selectedFile && !isUploading && (
          <div className={styles.fileInfo}>
            <div className={styles.fileIcon}>📄</div>
            <div className={styles.fileDetails}>
              <p className={styles.fileName}>{selectedFile.name}</p>
              <p className={styles.fileSize}>{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                clearFile();
              }}
              className={styles.removeButton}
            >
              ✕
            </button>
          </div>
        )}

        {isUploading && (
          <div className={styles.uploadStatus}>
            <p className={styles.uploadingText}>Uploading file...</p>
          </div>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
} 