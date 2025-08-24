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
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      
      const downloadUrl = url.includes('cloudinary.com') 
        ? `${url.split('?')[0]}?fl_attachment:${encodeURIComponent(filename)}`
        : url;
      
      link.href = downloadUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Downloading ${filename}...`);
    } catch (error) {
      toast.error("Download failed. Please try again.");
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
        <h1>📁 ShareAny</h1>
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
                      <div key={index} className="file-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #e1e5e9', marginBottom: '0.5rem' }}>
                        <span>📄 {filename}</span>
                        <button
                          onClick={() => handleDownload(fileUrl, filename)}
                          className="btn btn-primary"
                          style={{ marginLeft: '1rem' }}
                        >
                          ⬇️ Download
                        </button>
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
            <p style={{ marginBottom: '1rem', color: '#666' }}>
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