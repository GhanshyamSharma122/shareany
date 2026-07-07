import { useRef, useState } from "react";
import { toast } from "sonner";
import "./SimpleShareAny.css";

const API_URL = "https://shareany-exnote.vercel.app/";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const MAX_FILES = 3;

const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export default function SimpleShareAny() {
  const [files, setFiles] = useState([]);
  const [text, setText] = useState("");
  const [uploaded, setUploaded] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [retrieved, setRetrieved] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [copyText, setCopyText] = useState("Copy");
  const [keywordCopyText, setKeywordCopyText] = useState("Copy");
  const fileInputRef = useRef(null);

  // File size validation function
  const validateFileSize = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setError(`File "${file.name}" (${fileSizeMB}MB) exceeds the 10MB limit. Please choose a smaller file.`);
      toast.error(`File too large: ${file.name} (${fileSizeMB}MB). Max size: 10MB`);
      return false;
    }
    return true;
  };

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Add files from the picker or a drop, respecting count and size limits
  const addFiles = (fileList) => {
    const incoming = Array.from(fileList);
    const next = [...files];
    for (const file of incoming) {
      if (next.length >= MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} files per share`);
        break;
      }
      if (!validateFileSize(file)) continue;
      next.push(file);
    }
    if (next.length > files.length) {
      setError("");
      toast.success(`${next.length - files.length} file(s) added`);
    }
    setFiles(next);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer?.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index) => {
    const next = [...files];
    next.splice(index, 1);
    setFiles(next);
  };

  // Copy to clipboard function
  const copyToClipboard = async (text, setCopyState) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("Copied!");
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopyState("Copy"), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopyState("Copied!");
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopyState("Copy"), 2000);
      } catch (fallbackErr) {
        setCopyState("Failed");
        toast.error("Failed to copy");
        setTimeout(() => setCopyState("Copy"), 2000);
      }
      document.body.removeChild(textArea);
    }
  };

  // Native share function
  const shareNative = async () => {
    const shareUrl = `${window.location.origin}/${uploaded.createdStore.keyword}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ShareAny - Temporary File Sharing',
          text: `Access my shared files with keyword: ${uploaded.createdStore.keyword}`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled sharing or share failed, fallback to copy
        copyToClipboard(shareUrl, setCopyText);
      }
    } else {
      // Fallback to copy for browsers that don't support native sharing
      copyToClipboard(shareUrl, setCopyText);
    }
  };

  // Uploads a single file directly to Cloudinary using a signature
  // issued by the backend (bypasses Vercel's 4.5MB request body limit)
  const uploadFileToCloudinary = async (file, sig) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sig.apiKey);
    formData.append("timestamp", sig.timestamp);
    formData.append("signature", sig.signature);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || !data.secure_url) {
      throw new Error(data?.error?.message || `Upload failed for ${file.name}`);
    }
    return data.secure_url;
  };

  // Upload handler
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!text && files.length === 0) {
      setError("Please add some text or files to share");
      return;
    }

    // Validate all file sizes before upload
    for (let file of files) {
      if (!validateFileSize(file)) {
        return; // Stop upload if any file is too large
      }
    }

    setLoading(true);
    setError("");
    try {
      // 1. upload files straight to Cloudinary with a backend-issued signature
      let fileUrls = [];
      if (files.length > 0) {
        const sigRes = await fetch(API_URL + "__signature");
        const sig = await sigRes.json();
        if (sig.status !== 200) {
          throw new Error("Could not get upload permission from server");
        }
        fileUrls = await Promise.all(files.map((file) => uploadFileToCloudinary(file, sig)));
      }
      // 2. send only text + file URLs to the backend
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, files: fileUrls }),
      });
      const data = await res.json();
      if (data.status === 200) {
        setUploaded(data);
        setKeyword(data?.createdStore?.keyword || "");
        setText("");
        setFiles([]);
      } else {
        setError(data.message || "Upload failed");
      }
    } catch (err) {
      setError(err?.message || "Network error. Please try again.");
    }
    setLoading(false);
  };

  // Retrieve handler
  const handleRetrieve = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) {
      setError("Please enter a keyword");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL + keyword);
      const data = await res.json();
      if (data.status === 200) {
        setRetrieved(data?.data || null);
      } else {
        setError(data.message || "Not found");
        setRetrieved(null);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const resetUpload = () => {
    setUploaded(null);
    setKeyword("");
    setError("");
  };

  const getFileName = (url) => {
    try {
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1] || 'Download File';
    } catch {
      return 'Download File';
    }
  };

  const handleDownload = async (url, filename) => {
    try {
      toast.info("Starting download...");

      // Method 1: Try direct download with fetch for better CORS handling
      try {
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
        });

        if (response.ok) {
          const blob = await response.blob();
          const downloadUrl = window.URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = filename || 'download';
          link.style.display = 'none';

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Clean up the blob URL
          window.URL.revokeObjectURL(downloadUrl);

          toast.success(`Downloaded ${filename}`);
          return;
        }
      } catch (fetchError) {
        console.warn('Fetch download failed, trying alternative method:', fetchError);
      }

      // Method 2: Fallback - Direct link method with Cloudinary optimization
      const link = document.createElement('a');
      link.style.display = 'none';

      if (url.includes('cloudinary.com')) {
        // For Cloudinary, use fl_attachment to force download
        const baseUrl = url.split('?')[0];
        const downloadUrl = `${baseUrl}?fl_attachment:${encodeURIComponent(filename)}`;
        link.href = downloadUrl;
      } else {
        link.href = url;
      }

      link.download = filename || 'download';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Download started for ${filename}`);

    } catch (error) {
      console.error('Download error:', error);

      // Method 3: Last resort - open in new tab
      try {
        window.open(url, '_blank', 'noopener,noreferrer');
        toast.info(`Opened ${filename} in new tab. Please save manually if needed.`);
      } catch (openError) {
        toast.error("Download failed. Please try copying the link manually.");
        console.error('All download methods failed:', openError);
      }
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="header-top">
          <h1>ShareAny</h1>
        </div>
        <p>Share files and text with a single keyword — no account needed</p>
        <div className="data-notice">
          Everything auto-deletes after 24 hours
        </div>
      </div>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      <div className="main-content">
        <div className="left-column">
          {!uploaded ? (
            <div className="upload-section">
              <h2>Share something</h2>
              <form onSubmit={handleUpload} className="form">
                <button type="submit" disabled={loading} className="btn btn-primary btn-submit-top">
                  {loading ? "Uploading..." : "Create share link"}
                </button>

                <div className="input-group">
                  <label>Message (optional)</label>
                  <textarea
                    placeholder="Type or paste anything you want to share..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                    className="textarea"
                  />
                </div>

                <div className="input-group">
                  <label>Files (optional)</label>
                  <div
                    className={`dropzone${dragOver ? " drag-over" : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="file-input"
                      onChange={(e) => {
                        if (e.target.files?.length) {
                          addFiles(e.target.files);
                          e.target.value = "";
                        }
                      }}
                    />
                    <div className="dropzone-icon"><UploadIcon /></div>
                    <div className="dropzone-title">Drop files here, or click to browse</div>
                    <div className="dropzone-hint">Up to {MAX_FILES} files · 10 MB each</div>
                  </div>

                  {files.length > 0 && (
                    <div className="file-list">
                      {files.map((file, i) => (
                        <div key={i} className="file-row">
                          <span className="file-row-name">{file.name}</span>
                          <span className="file-row-size">{formatFileSize(file.size)}</span>
                          <div className="file-row-actions">
                            <button
                              type="button"
                              className="file-remove"
                              aria-label={`Remove ${file.name}`}
                              onClick={() => removeFile(i)}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </form>
            </div>
          ) : (
            <div className="success-section">
              <h2>Ready to share</h2>
              <div className="expiry-notice">
                This share will be deleted automatically in 24 hours
              </div>
              <div className="share-info">
                <div className="keyword-box">
                  <strong>Keyword</strong>
                  <span className="keyword">{uploaded.createdStore.keyword}</span>
                  <button
                    onClick={() => copyToClipboard(uploaded.createdStore.keyword, setKeywordCopyText)}
                    className="btn btn-secondary btn-sm"
                  >
                    {keywordCopyText}
                  </button>
                </div>
                <div className="share-url-box">
                  <strong>Link</strong>
                  <span className="share-url">{`${window.location.origin}/${uploaded.createdStore.keyword}`}</span>
                  <button
                    onClick={() => copyToClipboard(`${window.location.origin}/${uploaded.createdStore.keyword}`, setCopyText)}
                    className="btn btn-secondary btn-sm"
                  >
                    {copyText}
                  </button>
                </div>
                <div className="share-actions">
                  <button onClick={shareNative} className="btn btn-primary">
                    Share link
                  </button>
                  <button onClick={resetUpload} className="btn btn-secondary">
                    Share something else
                  </button>
                </div>
                <div className="created-date">
                  Created {new Date(uploaded.createdStore.createdAt).toLocaleString()}
                </div>
                {uploaded.createdStore.text && (
                  <div className="shared-text">
                    <strong>Message:</strong> {uploaded.createdStore.text}
                  </div>
                )}
                {uploaded.createdStore.files && uploaded.createdStore.files.length > 0 && (
                  <div className="files-section">
                    <strong>Files</strong>
                    <div className="file-links">
                      {uploaded.createdStore.files.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="file-link">
                          {getFileName(url)}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="right-column">
          <div className="retrieve-section">
            <h2>Retrieve a share</h2>
            <form onSubmit={handleRetrieve} className="form">
              <div className="input-group">
                <label>Keyword</label>
                <input
                  placeholder="Enter the share keyword"
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  className="input"
                />
              </div>
              <button type="submit" disabled={loading} className="btn btn-secondary">
                {loading ? "Retrieving..." : "Retrieve"}
              </button>
            </form>

            {retrieved && (
              <div className="retrieved-content">
                <h3>Retrieved content</h3>
                {retrieved.text && (
                  <div className="retrieved-text">
                    <strong>Message:</strong> {retrieved.text}
                  </div>
                )}
                {retrieved.files && retrieved.files.length > 0 && (
                  <div className="files-section">
                    <strong>Files</strong>
                    <div className="file-links">
                      {retrieved.files.map((url, i) => {
                        const filename = getFileName(url);
                        return (
                          <div key={i} className="file-row">
                            <span className="file-row-name">{filename}</span>
                            <div className="file-row-actions">
                              <button
                                onClick={() => handleDownload(url, filename)}
                                className="btn btn-primary btn-sm"
                              >
                                Download
                              </button>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(url);
                                  toast.success(`Copied link for ${filename}`);
                                }}
                                className="btn btn-secondary btn-sm"
                              >
                                Copy link
                              </button>
                              <button
                                onClick={() => window.open(url, '_blank')}
                                className="btn btn-secondary btn-sm"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
