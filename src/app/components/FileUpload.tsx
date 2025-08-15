"use client";

import { useState, useRef, useCallback } from "react";
import styles from "./FileUpload.module.css";

interface FileUploadProps {
  onUploadComplete: (driveLink: string) => void;
  onFileSelect?: (file: File | null) => void;
  onProgressUpdate?: (progress: { overall: number; chunk?: { current: number; total: number } }) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in MB
  label?: string;
  required?: boolean;
  placeholder?: string;
  uploadEndpoint: string; // Make the endpoint configurable
  autoUpload?: boolean; // Whether to upload immediately or wait for form submission
}

// Chunk size: 4MB to stay well under Vercel's limits
const CHUNK_SIZE = 4 * 1024 * 1024;

export default function FileUpload({
  onUploadComplete,
  onFileSelect,
  onProgressUpdate,
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

  const generateUploadId = useCallback(() => {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const uploadChunk = useCallback(async (
    chunk: Blob,
    chunkIndex: number,
    totalChunks: number,
    uploadId: string,
    fileName: string,
    fileType: string,
    folderName: string = 'Default'
  ): Promise<void> => {
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('uploadId', uploadId);
    formData.append('fileName', fileName);
    formData.append('fileType', fileType);
    formData.append('folderName', folderName);

    const response = await fetch(uploadEndpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload chunk ${chunkIndex + 1}/${totalChunks}`);
    }

    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }
  }, [uploadEndpoint]);

  const completeChunkedUpload = useCallback(async (
    uploadId: string,
    fileName: string,
    fileType: string,
    folderName: string = 'Default'
  ): Promise<string> => {
    const response = await fetch(uploadEndpoint, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'complete',
        uploadId,
        fileName,
        fileType,
        folderName,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to complete upload');
    }

    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }

    return result.driveLink;
  }, [uploadEndpoint]);

  const uploadToGoogleDrive = async (file: File): Promise<string> => {
    // For files larger than chunk size, use chunked upload
    if (file.size > CHUNK_SIZE) {
      return await uploadLargeFile(file);
    }

    // For smaller files, use the original method
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('fileType', file.type);

    const response = await fetch(uploadEndpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const result = await response.json();
    return result.driveLink;
  };

  const uploadLargeFile = async (file: File): Promise<string> => {
    const chunks = Math.ceil(file.size / CHUNK_SIZE);
    const uploadId = generateUploadId();
    
    // Notify parent of chunk progress start
    onProgressUpdate?.({ overall: 0, chunk: { current: 0, total: chunks } });
    
    try {
      // Upload chunks sequentially
      for (let i = 0; i < chunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        
        await uploadChunk(chunk, i, chunks, uploadId, file.name, file.type);
        
        // Update progress for parent
        const overallProgress = ((i + 1) / chunks) * 90; // Reserve last 10% for completion
        onProgressUpdate?.({ 
          overall: overallProgress, 
          chunk: { current: i + 1, total: chunks } 
        });
      }
      
      // Complete the upload
      const driveLink = await completeChunkedUpload(uploadId, file.name, file.type);
      
      // Notify parent of completion
      onProgressUpdate?.({ overall: 100, chunk: { current: chunks, total: chunks } });
      
      return driveLink;
    } catch (error) {
      throw new Error(`Chunked upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpload = useCallback(async (file?: File) => {
    const fileToUpload = file || selectedFile;
    if (!fileToUpload) return;

    setIsUploading(true);
    setError("");

    try {
      // Notify parent of upload start
      onProgressUpdate?.({ overall: 0 });
      
      const link = await uploadToGoogleDrive(fileToUpload);
      setDriveLink(link);
      onUploadComplete(link);

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
  }, [selectedFile, onUploadComplete, uploadToGoogleDrive, onProgressUpdate]);

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
          <div className={styles.uploadStatus}>
            <p className={styles.uploadingText}>Uploading file...</p>
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