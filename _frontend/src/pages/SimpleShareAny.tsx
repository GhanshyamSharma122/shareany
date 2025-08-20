import { useState } from "react";
import "./SimpleShareAny.css";

const API_URL = "http://localhost:8000/";

export default function SimpleShareAny() {
  const [files, setFiles] = useState([]);
  const [text, setText] = useState("");
  const [uploaded, setUploaded] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [retrieved, setRetrieved] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      </div>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {!uploaded ? (
        <div className="upload-section">
          <h2>📁 Upload & Share</h2>
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
              <input
                type="file"
                multiple
                onChange={e => setFiles(Array.from(e.target.files).slice(0, 3))}
                className="file-input"
                accept="*/*"
              />
              {files.length > 0 && (
                <div className="file-list">
                  {files.map((file, i) => (
                    <div key={i} className="file-item">
                      📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
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
          <div className="share-info">
            <div className="keyword-box">
              <strong>Share Keyword: </strong>
              <span className="keyword">{uploaded.createdStore.keyword}</span>
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
          <button onClick={resetUpload} className="btn btn-secondary">
            📤 Upload Another
          </button>
        </div>
      )}

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
  );
}
