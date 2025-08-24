import { useState } from "react";
import { toast } from "sonner";
import "./SimpleShareAny.css";

const API_URL = "https://shareany.onrender.com/";

export default function SimpleShareAny() {
  const [files, setFiles] = useState([]);
  const [text, setText] = useState("");
  const [uploaded, setUploaded] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [retrieved, setRetrieved] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyText, setCopyText] = useState("Copy");
  const [keywordCopyText, setKeywordCopyText] = useState("Copy");

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

  // Upload handler
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!text && files.length === 0) {
      setError("Please add some text or files to share");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      if (text) formData.append("text", text);
      for (let file of files) formData.append("files", file);
      const res = await fetch(API_URL, { method: "POST", body: formData });
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
      setError("Network error. Please try again.");
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

  return (
    <div className="container">
      <div className="header">
        <h1>📤 ShareAny</h1>
        <p>Share files and text temporarily</p>
        <div className="data-notice">
          ⏰ All shared data will be automatically deleted after 24 hours
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
              <h2>📁 Upload & Share</h2>
              <div className="warning-notice">
                ⚠️ Data will be deleted automatically after 24 hours
              </div>
              <form onSubmit={handleUpload} className="form">
                <div className="input-group">
                  <label>Message (optional)</label>
                  <textarea
                    placeholder="Add a message or text content..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                    className="textarea"
                  />
                </div>
                
                <div className="input-group">
                  <label>Files (max 3)</label>
                  
                  {/* Three separate file inputs */}
                  <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                    <div>
                      <input
                        id="file1"
                        type="file"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            const newFiles = [...files];
                            newFiles[0] = e.target.files[0];
                            setFiles(newFiles.filter(Boolean));
                          }
                        }}
                        className="file-input"
                        accept="*/*"
                      />
                      <label htmlFor="file1" className="file-label">Choose File 1</label>
                    </div>
                    
                    <div>
                      <input
                        id="file2"
                        type="file"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            const newFiles = [...files];
                            newFiles[1] = e.target.files[0];
                            setFiles(newFiles.filter(Boolean));
                          }
                        }}
                        className="file-input"
                        accept="*/*"
                      />
                      <label htmlFor="file2" className="file-label">Choose File 2</label>
                    </div>
                    
                    <div>
                      <input
                        id="file3"
                        type="file"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            const newFiles = [...files];
                            newFiles[2] = e.target.files[0];
                            setFiles(newFiles.filter(Boolean));
                          }
                        }}
                        className="file-input"
                        accept="*/*"
                      />
                      <label htmlFor="file3" className="file-label">Choose File 3</label>
                    </div>
                  </div>
                  
                  {files.length > 0 && (
                    <div className="file-list">
                      {files.map((file, i) => (
                        <div key={i} className="file-item">
                          📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                          <button 
                            type="button"
                            onClick={() => {
                              const newFiles = [...files];
                              newFiles.splice(i, 1);
                              setFiles(newFiles);
                            }}
                            style={{ marginLeft: '1rem', padding: '0.2rem 0.5rem', background: '#ff4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? "⏳ Uploading..." : "🚀 Create Share Link"}
                </button>
              </form>
            </div>
          ) : (
            <div className="success-section">
              <h2>✅ Upload Successful!</h2>
              <div className="expiry-notice">
                🕒 This data will be deleted automatically in 24 hours
              </div>
              <div className="share-info">
                <div className="keyword-box">
                  <strong>Share Keyword: </strong>
                  <span className="keyword">{uploaded.createdStore.keyword}</span>
                  <button 
                    onClick={() => copyToClipboard(uploaded.createdStore.keyword, setKeywordCopyText)}
                    className="btn btn-secondary"
                    style={{ marginLeft: '1rem', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                  >
                    {keywordCopyText}
                  </button>
                </div>
                <div className="share-url-box">
                  <strong>Share URL: </strong>
                  <span className="share-url">{`${window.location.origin}/${uploaded.createdStore.keyword}`}</span>
                  <button 
                    onClick={() => copyToClipboard(`${window.location.origin}/${uploaded.createdStore.keyword}`, setCopyText)}
                    className="btn btn-secondary"
                    style={{ marginLeft: '1rem', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                  >
                    {copyText}
                  </button>
                </div>
                <div className="share-actions" style={{ marginTop: '1rem' }}>
                  <button 
                    onClick={shareNative}
                    className="btn btn-primary"
                    style={{ marginRight: '1rem' }}
                  >
                    📤 Share Link
                  </button>
                  <button onClick={resetUpload} className="btn btn-secondary">
                    📤 Upload Another
                  </button>
                </div>
                <div className="created-date">
                  Created: {new Date(uploaded.createdStore.createdAt).toLocaleString()}
                </div>
                {uploaded.createdStore.text && (
                  <div className="shared-text">
                    <strong>Text:</strong> {uploaded.createdStore.text}
                  </div>
                )}
                {uploaded.createdStore.files && uploaded.createdStore.files.length > 0 && (
                  <div className="files-section">
                    <strong>Files:</strong>
                    <div className="file-links">
                      {uploaded.createdStore.files.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="file-link">
                          📎 {getFileName(url)}
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
            <h2>🔍 Retrieve Share</h2>
            <form onSubmit={handleRetrieve} className="form">
              <div className="input-group">
                <input
                  placeholder="Enter keyword to retrieve"
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  className="input"
                />
              </div>
              <button type="submit" disabled={loading} className="btn btn-secondary">
                {loading ? "⏳ Retrieving..." : "🔍 Retrieve"}
              </button>
            </form>
            
            {retrieved && (
              <div className="retrieved-content">
                <h3>📋 Retrieved Content</h3>
                {retrieved.text && (
                  <div className="retrieved-text">
                    <strong>Text:</strong> {retrieved.text}
                  </div>
                )}
                {retrieved.files && retrieved.files.length > 0 && (
                  <div className="files-section">
                    <strong>Files:</strong>
                    <div className="file-links">
                      {retrieved.files.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="file-link">
                          📎 {getFileName(url)}
                        </a>
                      ))}
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
