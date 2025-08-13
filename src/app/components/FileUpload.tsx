"use client";

import { useState, useRef, useCallback } from "react";
import styles from "./FileUpload.module.css";

interface FileUploadProps {
  onUploadComplete: (driveLink: string) => void;
  onFileSelect?: (file: File | null) => void;
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
  acceptedFileTypes = [".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg"],
  maxFileSize = 10, // 10MB default
  label = "Upload File",
  required = false,
  placeholder = "Drag and drop a file here, or click to browse",
  uploadEndpoint,
  autoUpload = false,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [driveLink, setDriveLink] = useState<string>("");
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
    [validateFile, onFileSelect, autoUpload],
  );

  const uploadToGoogleDrive = async (file: File): Promise<string> => {
    // Convert file to base64
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(",")[1];
        resolve(base64Data);
      };
      reader.readAsDataURL(file);
    });

    // Upload to the specified endpoint
    const response = await fetch(uploadEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileData: base64,
      }),
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const result = await response.json();
    return result.driveLink;
  };

  const handleUpload = async (file?: File) => {
    const fileToUpload = file || selectedFile;
    if (!fileToUpload) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError("");

    try {
      // Simulate progress (in real implementation, you'd track actual progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const link = await uploadToGoogleDrive(fileToUpload);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setDriveLink(link);
      onUploadComplete(link);

      // Reset after successful upload
      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);
    } catch (err) {
      setError("Upload failed. Please try again.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

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
    setDriveLink("");
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
          <div className={styles.uploadProgress}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <p className={styles.progressText}>Uploading... {uploadProgress}%</p>
          </div>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {driveLink && (
        <div className={styles.success}>
          <p className={styles.successText}>✅ File uploaded successfully!</p>
          <a href={driveLink} target="_blank" rel="noopener noreferrer" className={styles.driveLink}>
            View in Google Drive
          </a>
        </div>
      )}
    </div>
  );
} 