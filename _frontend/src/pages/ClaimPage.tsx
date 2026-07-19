import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

const API_URL = "https://shareany-exnote.vercel.app/";

interface DropData {
  text?: string;
  files: string[];
  keyword: string;
  createdAt: string;
}

const getFileName = (url: string) => url.split("/").pop() || "file";

const timeRemaining = (createdAt: string) => {
  const expires = new Date(createdAt).getTime() + 24 * 60 * 60 * 1000;
  const remaining = expires - Date.now();
  if (remaining <= 0) return "burned";
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  return `burns in ${hours}h ${minutes}m`;
};

export default function ClaimPage() {
  const { keyword } = useParams();
  const [data, setData] = useState<DropData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    const fetchDrop = async () => {
      if (!keyword) return;
      setLoading(true);
      try {
        const res = await fetch(API_URL + keyword);
        const result = await res.json();
        if (res.ok && result.status === 200) {
          setData({
            text: result.data.text || "",
            files: result.data.files || [],
            keyword: result.data.keyword,
            createdAt: result.data.createdAt,
          });
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
        toast.error("Could not reach the shelf. Check your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchDrop();
  }, [keyword]);

  // refresh the burn countdown every minute
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const res = await fetch(url, { mode: "cors" });
      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        toast.success(`Downloaded ${filename}`);
        return;
      }
      throw new Error("fetch failed");
    } catch {
      // Cloudinary fl_attachment fallback forces a download header
      const href = url.includes("cloudinary.com")
        ? `${url.split("?")[0]}?fl_attachment:${encodeURIComponent(filename)}`
        : url;
      window.open(href, "_blank", "noopener,noreferrer");
      toast.info(`Opened ${filename} — save it manually if needed`);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied");
  };

  return (
    <div className="shell">
      <header className="topbar">
        <Link className="wordmark" to="/">exnote<em>share</em></Link>
        <span className="topbar-note">digital coat check · every drop burns in 24h</span>
      </header>

      <main className="claim-wrap">
        <div className="claim-inner">
          {loading ? (
            <div className="void-state">
              <h2>Checking the shelf…</h2>
              <p>Looking for <span className="kw">{keyword}</span></p>
            </div>
          ) : notFound || !data ? (
            <div className="void-state">
              <h2>Nothing on the shelf</h2>
              <p>
                No drop matches <span className="kw">{keyword}</span>. It may have already burned —
                tickets only last 24 hours.
              </p>
              <Link to="/" className="btn btn-ticket">Drop something new</Link>
            </div>
          ) : (
            <>
              <div className="claim-stub">
                <span className="claim-stub-word">{data.keyword}</span>
                <span className="claim-stub-meta">{timeRemaining(data.createdAt)}</span>
              </div>

              {data.text && (
                <div className="claim-card">
                  <h2>Note</h2>
                  <p className="claim-message">{data.text}</p>
                </div>
              )}

              {data.files.length > 0 && (
                <div className="claim-card">
                  <h2>Files ({data.files.length})</h2>
                  {data.files.map((url, i) => {
                    const filename = getFileName(url);
                    return (
                      <div key={i} className="claim-file-row">
                        <span className="claim-file-name">{filename}</span>
                        <div className="claim-file-actions">
                          <button
                            className="btn btn-ink btn-sm"
                            onClick={() => handleDownload(url, filename)}
                          >
                            Download
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => {
                              navigator.clipboard.writeText(url);
                              toast.success(`Copied link for ${filename}`);
                            }}
                          >
                            Copy link
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                          >
                            Open
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="claim-actions">
                <button className="btn btn-ticket" onClick={copyLink}>Copy this link</button>
                <Link to="/" className="btn btn-ghost">Drop something new</Link>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="footer">
        no accounts · no history · everything <strong>burns after 24 hours</strong>
      </footer>
    </div>
  );
}
