"use client";

import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, XCircle, Loader2, File as FileIcon } from 'lucide-react';

interface SensorFileUploaderProps {
  sensorType: string;
  presignedUrl: string;
  onUploadSuccess: (sensorType: string) => void;
  onUploadError: (sensorType: string, error: string) => void;
}

export default function SensorFileUploader({
  sensorType,
  presignedUrl,
  onUploadSuccess,
  onUploadError,
}: SensorFileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setStatus('idle');
    }
  };

  const uploadFile = async () => {
    if (!file || !presignedUrl) return;

    setIsUploading(true);
    setStatus('uploading');
    setUploadProgress(0);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', presignedUrl, true);
      
      let contentType = file.type;
      if (!contentType) {
          contentType = 'application/octet-stream';
      }
      xhr.setRequestHeader('Content-Type', contentType);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setStatus('success');
          onUploadSuccess(sensorType);
        } else {
          setStatus('error');
          onUploadError(sensorType, `Upload failed with status ${xhr.status}`);
        }
        setIsUploading(false);
      };

      xhr.onerror = () => {
        setStatus('error');
        onUploadError(sensorType, 'Network error occurred during upload.');
        setIsUploading(false);
      };

      xhr.send(file);
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      onUploadError(sensorType, err.message || 'Upload failed.');
      setIsUploading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 capitalize flex items-center gap-2">
          <FileIcon className="w-5 h-5 text-gray-500" />
          {sensorType} Sensor Data
        </h3>
        {status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
        {status === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
      </div>

      {!file ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 font-medium">Click to browse or drag and drop</p>
          <p className="text-xs text-gray-400 mt-1">Supports RAW, LAS, E57, etc.</p>
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 truncate max-w-[70%]">{file.name}</span>
            <span className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
          </div>

          {status === 'uploading' && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            {status === 'uploading' ? (
              <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Uploading {uploadProgress}%
              </span>
            ) : status === 'success' ? (
              <span className="text-xs text-green-600 font-medium">Upload Complete</span>
            ) : status === 'error' ? (
              <span className="text-xs text-red-600 font-medium">Upload Failed</span>
            ) : (
              <span className="text-xs text-gray-500">Ready to upload</span>
            )}

            {status !== 'success' && status !== 'uploading' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setFile(null)}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-200 bg-white"
                >
                  Change
                </button>
                <button
                  onClick={uploadFile}
                  className="text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition-colors"
                >
                  Upload
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
