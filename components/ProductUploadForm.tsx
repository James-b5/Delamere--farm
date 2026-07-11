'use client';

import React, { useState, useRef } from 'react';
import { authenticatedFetch } from '@/lib/fetch-helper';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Upload, X, ImageIcon, Link2Icon, Video, FileText, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useConfirm } from '@/components/ConfirmProvider';

const schema = z.object({
  name: z.string().min(2, 'Product name is required (min 2 characters)'),
  description: z.string().min(10, 'Description is required (min 10 characters)'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  stock: z.coerce.number().int().nonnegative('Stock must be a non-negative integer'),
  category: z.string().min(1, 'Please select a category'),
  breed: z.string().optional(),
  healthStatus: z.string().optional(),
  ageOrWeight: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ProductUploadForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const videoUrlInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const dragOverRef = useRef<HTMLDivElement>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<{ file: File; url: string }[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<{ file: File; name: string; url?: string }[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<{ file: File; name: string }[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [videoInput, setVideoInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'images' | 'videos' | 'documents'>('images');
  const [activeTab, setActiveTab] = useState<'images' | 'videos' | 'documents'>('images');

  const confirm = useConfirm();

  const CATEGORIES = ['Cattle', 'Poultry', 'Goats', 'Sheep', 'Pigs', 'Equipment', 'Feed', 'Services', 'Other'];

  // Validate and add video URL
  const addVideoUrl = () => {
    const url = videoInput.trim();
    if (!url) {
      toast.error('Please enter a video URL');
      return;
    }
    try {
      new URL(url);
      if (videoUrls.length >= 3) {
        toast.error('Maximum 3 video URLs allowed');
        return;
      }
      if (videoUrls.includes(url)) {
        toast.error('This URL is already added');
        return;
      }
      setVideoUrls([...videoUrls, url]);
      setVideoInput('');
      toast.success('Video URL added');
    } catch {
      toast.error('Please enter a valid URL (e.g., https://youtube.com/...)');
    }
  };

  const removeVideoUrl = (index: number) => {
    setVideoUrls(videoUrls.filter((_, i) => i !== index));
  };

  const validateFile = (file: File, fileType: 'image' | 'video' | 'document'): string | null => {
    const MAX_SIZE = 15 * 1024 * 1024; // 15MB

    if (file.size > MAX_SIZE) {
      return `File size must be less than 15MB (${(file.size / 1024 / 1024).toFixed(2)}MB)`;
    }

    switch (fileType) {
      case 'image': {
        const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          return 'Only JPG, PNG, and WebP images are allowed';
        }
        break;
      }

      case 'video': {
        const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
        if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
          return 'Only MP4, WebM, OGG, and MOV videos are allowed';
        }
        break;
      }

      case 'document': {
        const ALLOWED_DOC_TYPES = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ];
        if (!ALLOWED_DOC_TYPES.includes(file.type)) {
          return 'Only PDF, Word (DOC/DOCX), and TXT documents are allowed';
        }
        break;
      }
    }
    return null;
  };

  const handleImageChange = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const totalImages = previewImages.length + newFiles.length;

    if (totalImages > 10) {
      toast.error(`Maximum 10 images allowed. You have ${previewImages.length} already.`);
      return;
    }

    const validFiles: { file: File; url: string }[] = [];

    newFiles.forEach((file) => {
      const error = validateFile(file, 'image');
      if (error) {
        toast.error(`${file.name}: ${error}`);
      } else {
        const url = URL.createObjectURL(file);
        validFiles.push({ file, url });
      }
    });

    setPreviewImages([...previewImages, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleVideoFileChange = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const totalVideos = uploadedVideos.length + newFiles.length;

    if (totalVideos > 5) {
      toast.error(`Maximum 5 video files allowed. You have ${uploadedVideos.length} already.`);
      return;
    }

    const validFiles: { file: File; name: string; url?: string }[] = [];

    newFiles.forEach((file) => {
      const error = validateFile(file, 'video');
      if (error) {
        toast.error(`${file.name}: ${error}`);
      } else {
        const url = URL.createObjectURL(file);
        validFiles.push({ file, name: file.name, url });
      }
    });

    setUploadedVideos([...uploadedVideos, ...validFiles]);
    if (videoFileInputRef.current) videoFileInputRef.current.value = '';
  };

  const handleDocumentChange = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const totalDocs = uploadedDocuments.length + newFiles.length;

    if (totalDocs > 5) {
      toast.error(`Maximum 5 documents allowed. You have ${uploadedDocuments.length} already.`);
      return;
    }

    const validFiles: { file: File; name: string }[] = [];

    newFiles.forEach((file) => {
      const error = validateFile(file, 'document');
      if (error) {
        toast.error(`${file.name}: ${error}`);
      } else {
        validFiles.push({ file, name: file.name });
      }
    });

    setUploadedDocuments([...uploadedDocuments, ...validFiles]);
    if (documentInputRef.current) documentInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    const removed = previewImages[index];
    URL.revokeObjectURL(removed.url);
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    const removed = uploadedVideos[index];
    if (removed?.url) URL.revokeObjectURL(removed.url);
    setUploadedVideos(uploadedVideos.filter((_, i) => i !== index));
  };

  const removeDocument = (index: number) => {
    setUploadedDocuments(uploadedDocuments.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent, type: 'images' | 'videos' | 'documents') => {
    e.preventDefault();
    setIsDragging(true);
    setDragType(type);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent, type: 'images' | 'videos' | 'documents') => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      if (type === 'images') handleImageChange(e.dataTransfer.files);
      else if (type === 'videos') handleVideoFileChange(e.dataTransfer.files);
      else if (type === 'documents') handleDocumentChange(e.dataTransfer.files);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (previewImages.length === 0) {
      toast.error('Please add at least one product image');
      return;
    }

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price.toString());
    formData.append('stock', data.stock.toString());
    formData.append('category', data.category);
    if (data.breed) formData.append('breed', data.breed);
    if (data.healthStatus) formData.append('healthStatus', data.healthStatus);
    if (data.ageOrWeight) formData.append('ageOrWeight', data.ageOrWeight);

    previewImages.forEach((img) => {
      formData.append('images', img.file);
    });

    uploadedVideos.forEach((video) => {
      formData.append('videoFiles', video.file);
    });

    uploadedDocuments.forEach((doc) => {
      formData.append('documents', doc.file);
    });

    videoUrls.forEach((url) => {
      formData.append('videos', url);
    });

    try {
      const response = await authenticatedFetch('/api/admin/products', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create product';
        const contentType = response.headers.get('content-type') ?? '';

        if (contentType.includes('application/json')) {
          const errorBody = await response.json().catch(() => null);
          if (errorBody?.error) {
            errorMessage = errorBody.error;
          } else if (typeof errorBody === 'string') {
            errorMessage = errorBody;
          }
        } else {
          const errorText = await response.text().catch(() => '');
          if (errorText) {
            errorMessage = errorText;
          }
        }

        const detailedError = `Product upload failed: ${response.status} ${response.statusText} - ${errorMessage}`;
        console.error('Product upload response error:', {
          status: response.status,
          statusText: response.statusText,
          contentType,
          errorMessage,
        });
        throw new Error(errorMessage || detailedError);
      }

      const created = await response.json();
      toast.success('Product created successfully!');
      // Clear form state
      reset();
      setPreviewImages([]);
      // revoke any video object URLs
      uploadedVideos.forEach(v => v.url && URL.revokeObjectURL(v.url));
      setUploadedVideos([]);
      setUploadedDocuments([]);
      setVideoUrls([]);
      setVideoInput('');

      // Redirect to newly created product page if id available
      if (created?.id) {
        router.push(`/products/${created.id}`);
        return;
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload product');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleCancel = () => {
    (async () => {
      const hasChanges = previewImages.length > 0 || uploadedVideos.length > 0 || uploadedDocuments.length > 0 || videoUrls.length > 0;
      if (hasChanges) {
        const ok = await confirm('Are you sure? You have unsaved changes.');
        if (ok) router.back();
      } else {
        router.back();
      }
    })();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="min-h-screen bg-linear-to-br from-green-50 to-green-100 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center gap-3 mb-8">
          <button
            type="button"
            onClick={handleCancel}
            className="p-2 hover:bg-white rounded-lg transition"
            title="Go back to previous page"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-gray-600 mt-1">Complete the form to add a new product to your farm catalog</p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Basic Information Section */}
          <div className="p-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                <input
                  {...register('name')}
                  placeholder="e.g., Jersey Dairy Cow"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-600 text-gray-900 cursor-text"
                  disabled={isSubmitting}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  {...register('category')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  disabled={isSubmitting}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Breed / Type (Optional)</label>
                <input
                  {...register('breed')}
                  placeholder="e.g., Jersey, Angus, Boer Goat"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-600 text-gray-900 cursor-text"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Health Status / Age / Weight (Optional)</label>
                <input
                  {...register('ageOrWeight')}
                  placeholder="e.g., 3 years old, 450kg, Vaccinated"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-600 text-gray-900 cursor-text"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (KES) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('price')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-600 text-gray-900 cursor-text"
                    disabled={isSubmitting}
                  />
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                  <input
                    type="number"
                    placeholder="0"
                    {...register('stock')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-600 text-gray-900 cursor-text"
                    disabled={isSubmitting}
                  />
                  {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-6">Description *</label>
              <textarea
                {...register('description')}
                placeholder="Describe the product, features, care instructions, breeding info, health certificates, etc."
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-600 text-gray-900 cursor-text"
                disabled={isSubmitting}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>
          </div>

          {/* Media Section with Tabs */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
              Media & Documentation
            </h2>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              {[
                { id: 'images', label: 'Images', icon: ImageIcon },
                { id: 'videos', label: 'Videos', icon: Video },
                { id: 'documents', label: 'Documents', icon: FileText },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition border-b-2 ${
                    activeTab === id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Images Tab */}
            {activeTab === 'images' && (
              <div className="space-y-4">
                <div
                  ref={dragOverRef}
                  onDragOver={(e) => handleDragOver(e, 'images')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'images')}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                    isDragging && dragType === 'images' ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm font-medium text-gray-700 mb-2">Drag images here or click to select</p>
                  <p className="text-xs text-gray-600 mb-4">JPG, PNG, or WebP • Max 15MB each • Max 10 images</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                    disabled={isSubmitting}
                    aria-label="Select product images"
                  >
                    <Upload className="w-4 h-4" />
                    Select Images
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(e) => handleImageChange(e.target.files)}
                    aria-label="Select product images"
                    title="Select product images"
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </div>

                {previewImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      {previewImages.length} / 10 images selected
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {previewImages.map((img, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={img.url}
                            alt={`Preview ${i + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => removeImage(i)}
                              className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-1.5 rounded-full transition"
                              title="Remove image"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="mt-1 text-xs text-gray-600 truncate">
                            {formatFileSize(img.file.size)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Videos Tab */}
            {activeTab === 'videos' && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Upload Video Files</h3>
                  <div
                    onDragOver={(e) => handleDragOver(e, 'videos')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'videos')}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                      isDragging && dragType === 'videos' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm font-medium text-gray-700 mb-2">Drag video files here or click to select</p>
                    <p className="text-xs text-gray-600 mb-4">MP4, WebM, OGG, or MOV • Max 15MB each • Max 5 videos</p>
                    <button
                      type="button"
                      onClick={() => videoFileInputRef.current?.click()}
                      aria-label="Select video files"
                      disabled={isSubmitting}
                    >
                      <Upload className="w-4 h-4" />
                      Select Videos
                    </button>
                    <input
                      ref={videoFileInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime"
                      multiple
                      onChange={(e) => handleVideoFileChange(e.target.files)}
                      aria-label="Select video files"
                      title="Select video files"
                      className="hidden"
                      disabled={isSubmitting}
                    />
                  </div>

                  {uploadedVideos.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        {uploadedVideos.length} / 5 video files selected
                      </p>
                      <div className="space-y-2">
                        {uploadedVideos.map((video, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Video className="w-4 h-4 text-blue-600 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-blue-900 truncate">{video.name}</div>
                                <div className="text-xs text-blue-600">{formatFileSize(video.file.size)}</div>
                                {video.url && (
                                  <video src={video.url} className="mt-2 w-full h-28 object-cover rounded-md" controls />
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeVideo(i)}
                              className="ml-2 text-red-600 hover:text-red-700 shrink-0"
                              title="Remove video file"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Add Video URLs</h3>
                  <div className="flex gap-2 mb-2">
                    <input
                        ref={videoUrlInputRef}
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={videoInput}
                      onChange={(e) => setVideoInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addVideoUrl()}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 text-gray-900 cursor-text"
                        aria-label="Video URL"
                        title="Video URL"
                      disabled={isSubmitting || videoUrls.length >= 3}
                    />
                    <button
                      type="button"
                      onClick={addVideoUrl}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2 disabled:opacity-50"
                      disabled={isSubmitting || videoUrls.length >= 3}
                    >
                      <Link2Icon className="w-4 h-4" />
                      Add URL
                    </button>
                  </div>

                  {videoUrls.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        {videoUrls.length} / 3 video URLs added
                      </p>
                      <div className="space-y-2">
                        {videoUrls.map((url, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Link2Icon className="w-4 h-4 text-blue-600 shrink-0" />
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline truncate"
                                title="Open video URL"
                              >
                                {url}
                              </a>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeVideoUrl(i)}
                              className="ml-2 text-red-600 hover:text-red-700 shrink-0"
                              title="Remove video URL"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <div
                  onDragOver={(e) => handleDragOver(e, 'documents')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'documents')}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                    isDragging && dragType === 'documents' ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm font-medium text-gray-700 mb-2">Drag documents here or click to select</p>
                  <p className="text-xs text-gray-600 mb-4">PDF, DOC, DOCX, or TXT • Max 15MB each • Max 5 documents</p>
                  <p className="text-xs text-gray-500 mb-4">
                    Useful for: Health certificates, Breeding records, Vaccination records, Care instructions, Product specs
                  </p>
                  <button
                    type="button"
                    onClick={() => documentInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                    disabled={isSubmitting}
                  >
                    <Upload className="w-4 h-4" />
                    Select Documents
                  </button>
                  <input
                    ref={documentInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    multiple
                    onChange={(e) => handleDocumentChange(e.target.files)}
                    aria-label="Select document files"
                    title="Select document files"
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </div>

                {uploadedDocuments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      {uploadedDocuments.length} / 5 documents selected
                    </p>
                    <div className="space-y-2">
                      {uploadedDocuments.map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                              <span className="text-sm text-purple-900 truncate">{doc.name}</span>
                              <span className="text-xs text-purple-600 shrink-0">({formatFileSize(doc.file.size)})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocument(i)}
                            className="ml-2 text-red-600 hover:text-red-700 shrink-0"
                            title="Remove document"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Buttons Section */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition font-semibold flex items-center gap-2"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition font-semibold flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Creating Product...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Create Product
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
