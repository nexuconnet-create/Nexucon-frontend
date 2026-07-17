"use client";

import React, { useCallback, useRef, useState } from "react";
import { UploadCloud, X, File as FileIcon } from "lucide-react";

interface FileUploadDropzoneProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function FileUploadDropzone({
  onFileSelect,
  accept = ".jpeg,.jpg,.png,.pdf",
  maxSizeMB = 5,
}: FileUploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError(null);
    
    // Check extension
    const fileExtension = "." + file.name.split('.').pop()?.toLowerCase();
    const acceptedExtensions = accept.split(',').map(ext => ext.trim().toLowerCase());
    
    // Since accept can be mime types like 'image/*' or extensions like '.png',
    // here we do a basic check. If accept contains the extension, it's valid.
    // For a robust implementation, standard HTML input handle this via the 'accept' attribute,
    // but we need to check manual drops.
    const isValidExtension = acceptedExtensions.some(ext => {
      if (ext.startsWith('.')) {
        return fileExtension === ext;
      }
      return file.type.match(ext.replace('*', '.*'));
    });

    if (!isValidExtension) {
      setError(`Invalid file type. Accepted: ${accept}`);
      return false;
    }

    // Check size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${maxSizeMB}MB.`);
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
    // Reset input value to allow selecting the same file again if removed
    if (e.target) {
      e.target.value = "";
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [accept, maxSizeMB, onFileSelect]);

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setError(null);
    onFileSelect(null);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
          isDragActive
            ? "border-[#022C4F] bg-blue-50"
            : selectedFile
            ? "border-green-500 bg-green-50"
            : error
            ? "border-red-400 bg-red-50"
            : "border-[#022C4F] hover:bg-gray-50"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex items-center justify-between w-full max-w-sm px-4 py-2 bg-white rounded-md shadow-sm border border-green-200">
            <div className="flex items-center gap-3 overflow-hidden">
              <FileIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="flex flex-col truncate">
                <span className="text-sm font-semibold text-gray-800 truncate">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-1.5 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            {error ? (
              <span className="text-sm font-medium text-red-500 mb-1">{error}</span>
            ) : (
              <span className="text-sm font-medium text-gray-900 mb-1">
                Drag and Drop Files here or <span className="text-[#022C4F] underline">Choose File</span>
              </span>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Supported formats: {accept.replace(/\./g, '').replace(/,/g, ', ')} (Max: {maxSizeMB}MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
