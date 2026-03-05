"use client";

import React, { useState, useRef } from 'react';
import { UploadCloud, X, Check, AlertCircle, Loader2, Image as ImageIcon, File as FileIcon, RefreshCw } from 'lucide-react';

interface ImageUploaderProps {
    onUploadSuccess: (url: string) => void;
    label?: string;
    defaultValue?: string;
    module?: string;
    description?: string;
    className?: string;
    accept?: string;
    fileType?: 'image' | 'video' | 'document' | 'voice' | 'any';
    maxSizeMB?: number;
}

// Kept SmartUploader alias for legacy compatibility
export const SmartUploader = ImageUploader;

export function ImageUploader({
    onUploadSuccess,
    label = "Upload Media",
    defaultValue = "",
    module = "general",
    description = "PNG, JPG, WebP (Max 5MB)",
    className = "",
    accept = "image/jpeg, image/png, image/webp",
    fileType = "image",
    maxSizeMB = 5
}: ImageUploaderProps) {
    const [preview, setPreview] = useState(defaultValue);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputId = useRef(`file-upload-${Math.random().toString(36).substr(2, 9)}`);

    const processFile = async (file: File) => {
        // Validation Phase
        setError("");
        setSuccess(false);

        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`File size exceeds limit (${maxSizeMB}MB)`);
            return;
        }

        if (fileType === 'image' && !file.type.startsWith('image/')) {
            setError("Unsupported file type. Please upload an image.");
            return;
        }

        // Upload Phase
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("module", module);

        try {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/api/media/upload", true);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    setProgress(percentComplete);
                }
            };

            xhr.onload = () => {
                try {
                    const response = JSON.parse(xhr.responseText || "{}");

                    if (xhr.status >= 200 && xhr.status < 300 && (response.success || response.url)) {
                        setPreview(response.url);
                        setSuccess(true);
                        onUploadSuccess(response.url);
                    } else {
                        setError(response.error || "Failed to process upload on server.");
                        console.error("Upload Server Error:", response);
                    }
                } catch (e) {
                    setError("Invalid server response format.");
                } finally {
                    setUploading(false);
                    setProgress(0);
                }
            };

            xhr.onerror = () => {
                setError("Network error. Please check your connection.");
                setUploading(false);
                setProgress(0);
            };

            xhr.send(formData);

        } catch (err) {
            setError("Unexpected upload error occurred.");
            setUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    const clearPreview = () => {
        setPreview("");
        onUploadSuccess("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const triggerFileSelect = () => {
        if (!uploading) fileInputRef.current?.click();
    };

    return (
        <div className={`space-y-2 relative ${className}`}>
            {label && (
                <label className="text-sm font-semibold text-gray-700 block">
                    {label}
                </label>
            )}

            <div
                className={`relative group border-2 border-dashed rounded-lg transition-all duration-300 p-4 flex flex-col items-center justify-center min-h-[160px] 
                    ${isDragging ? 'border-blue-500 bg-blue-50/50' : ''} 
                    ${error ? 'border-red-400 bg-red-50' : ''}
                    ${success && !preview ? 'border-green-400 bg-green-50' : ''}
                    ${!error && !isDragging && !success ? 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >

                {preview ? (
                    <div className="w-full flex flex-col items-center">
                        <div className="relative w-full max-h-[200px] flex justify-center items-center bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                            {fileType === 'video' ? (
                                <video src={preview} controls className="max-h-[200px] max-w-full object-contain" />
                            ) : fileType === 'voice' ? (
                                <audio src={preview} controls className="w-full mt-4" />
                            ) : fileType === 'document' ? (
                                <div className="text-blue-500 flex flex-col items-center py-6">
                                    <FileIcon size={40} className="mb-2" />
                                    <span className="text-sm font-medium truncate max-w-[200px]">{preview.split('/').pop()}</span>
                                </div>
                            ) : (
                                <img src={preview} alt="Upload Preview" className="max-h-[200px] max-w-full object-contain" />
                            )}
                        </div>

                        {/* Replace / Delete Actions Below Image */}
                        <div className="flex gap-4 mt-3">
                            <button
                                type="button"
                                onClick={triggerFileSelect}
                                className="flex items-center text-xs font-semibold text-gray-600 hover:text-blue-600 transition-colors"
                            >
                                <RefreshCw size={14} className="mr-1" /> Replace
                            </button>
                            <button
                                type="button"
                                onClick={clearPreview}
                                className="flex items-center text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                            >
                                <X size={14} className="mr-1" /> Remove
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center cursor-pointer" onClick={triggerFileSelect}>
                        {uploading ? (
                            <div className="flex flex-col items-center">
                                <Loader2 size={32} className="text-blue-500 animate-spin mb-3" />
                                <span className="text-sm font-medium text-gray-700">Uploading {progress}%</span>
                                <div className="w-32 h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                                    <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                        ) : (
                            <>
                                <UploadCloud size={32} className="text-gray-400 mb-3 group-hover:text-blue-500 transition-colors" />
                                <span className="text-sm font-medium text-gray-700">Drag image or click to upload</span>
                                <span className="text-xs text-gray-500 mt-1">{description}</span>
                            </>
                        )}
                    </div>
                )}

                <input
                    id={inputId.current}
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={handleFileChange}
                    disabled={uploading}
                />
            </div>

            {error && (
                <div className="flex items-center gap-1.5 text-red-600 text-xs font-medium mt-1">
                    <AlertCircle size={14} /> {error}
                </div>
            )}
        </div>
    );
}
