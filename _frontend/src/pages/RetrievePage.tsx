import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import "./SimpleShareAny.css";

interface FileData {
  text?: string;
  files: string[];
  keyword: string;
  createdAt: string;
}

const RetrievePage = () => {
  const { keyword } = useParams();
  const [data, setData] = useState<FileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!keyword) return;
      
      setIsLoading(true);
      
      try {
        const response = await fetch(`https://shareany.onrender.com/${keyword}`);
        const result = await response.json();

        if (response.ok && result.status === 200) {
          setData({
            text: result.data.text || "",
            files: result.data.files || [],
            keyword: result.data.keyword,
            createdAt: result.data.createdAt
          });
        } else {
          throw new Error(result.message || 'Files not found');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setError(true);
        toast.error("Files not found or expired");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [keyword]);

  const handleDownload = async (url: string, filename: string) => {
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

  const getFileName = (url: string) => {
    return url.split('/').pop() || 'Unknown file';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (createdAt: string) => {
    const created = new Date(createdAt);
    const expires = new Date(created.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    const remaining = expires.getTime() - now.getTime();
    
    if (remaining <= 0) return "Expired";
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="header">
          <h1>🔍 ShareAny</h1>
          <p>Retrieving shared files...</p>
        </div>
        <div className="upload-section" style={{ textAlign: 'center' }}>
          <h2>⏳ Loading...</h2>
          <p>Searching for keyword: <strong>{keyword}</strong></p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container">
        <div className="header">
          <h1>❌ ShareAny</h1>
          <p>Files not found</p>
        </div>
        <div className="upload-section" style={{ textAlign: 'center' }}>
          <h2>🚫 Files Not Found</h2>
          <p>The keyword <strong>{keyword}</strong> doesn't exist or the files have expired.</p>
          <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none', marginTop: '1rem', display: 'inline-block' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <div className="header-top">
          <h1>ShareAny</h1>
        </div>
        <p>Shared files for keyword: <strong>{data.keyword}</strong></p>
        <div className="data-notice">
          ⏰ {getTimeRemaining(data.createdAt)}
        </div>
      </div>

      <div className="main-content">
        <div className="left-column">
          <div className="upload-section">
            <h2>📋 Retrieved Content</h2>
            <div className="warning-notice">
              📅 Shared on: {formatDate(data.createdAt)}
            </div>
            
            {data.text && (
              <div className="retrieved-content">
                <h3>💬 Message</h3>
                <div className="retrieved-text">
                  {data.text}
                </div>
              </div>
            )}

            {data.files.length > 0 && (
              <div className="files-section">
                <h3>📎 Files ({data.files.length})</h3>
                <div className="file-links">
                  {data.files.map((fileUrl, index) => {
                    const filename = getFileName(fileUrl);
                    return (
                      <div key={index} className="file-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--input-bg)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--card-text)' }}>📄 {filename}</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleDownload(fileUrl, filename)}
                            className="btn btn-primary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                          >
                            ⬇️ Download
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(fileUrl);
                              toast.success(`Copied link for ${filename}`);
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                          >
                            📋 Copy Link
                          </button>
                          <button
                            onClick={() => window.open(fileUrl, '_blank')}
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                          >
                            👁️ View
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="right-column">
          <div className="retrieve-section">
            <h2>🔗 Share This Link</h2>
            <p style={{ marginBottom: '1rem', color: 'var(--card-text)', opacity: 0.7 }}>
              Others can access these files using the same link.
            </p>
            <button onClick={copyLink} className="btn btn-secondary" style={{ width: '100%', marginBottom: '1rem' }}>
              📋 Copy Link
            </button>
            <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
              🏠 Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetrievePage;