import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const API_URL = "https://shareany-exnote.vercel.app/";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 3;

const formatSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

interface UploadedStore {
  keyword: string;
  createdAt: string;
  text?: string;
  files?: string[];
}

export default function DropPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState("");
  const [ticket, setTicket] = useState<UploadedStore | null>(null);
  const [claimWord, setClaimWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const addFiles = (fileList: FileList) => {
    const next = [...files];
    for (const file of Array.from(fileList)) {
      if (next.length >= MAX_FILES) {
        toast.error(`A ticket holds up to ${MAX_FILES} files`);
        break;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is over the 10 MB limit`);
        continue;
      }
      next.push(file);
    }
    if (next.length > files.length) setError("");
    setFiles(next);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // Uploads one file straight to Cloudinary with a backend-issued
  // signature (bypasses Vercel's 4.5MB request body limit)
  const uploadToCloudinary = async (file: File, sig: any) => {
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
    return data.secure_url as string;
  };

  const handleDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text && files.length === 0) {
      setError("Add some text or a file first — the shelf can't hold nothing.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      let fileUrls: string[] = [];
      if (files.length > 0) {
        const sigRes = await fetch(API_URL + "__signature");
        const sig = await sigRes.json();
        if (sig.status !== 200) {
          throw new Error("Could not get upload permission from server");
        }
        fileUrls = await Promise.all(files.map((file) => uploadToCloudinary(file, sig)));
      }
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, files: fileUrls }),
      });
      const data = await res.json();
      if (data.status === 200) {
        setTicket(data.createdStore);
        setText("");
        setFiles([]);
      } else {
        setError(data.message || "Drop failed. Try again.");
      }
    } catch (err: any) {
      setError(err?.message || "Network error. Try again.");
    }
    setLoading(false);
  };

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Copy failed");
    }
  };

  const shareTicket = async () => {
    if (!ticket) return;
    const url = `${window.location.origin}/${ticket.keyword}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "exnoteshare claim ticket",
          text: `Claim my drop with the word: ${ticket.keyword}`,
          url,
        });
        return;
      } catch {
        /* fall through to copy */
      }
    }
    copy(url, "Link");
  };

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const word = claimWord.trim();
    if (!word) {
      toast.error("Type the claim word first");
      return;
    }
    navigate(`/${encodeURIComponent(word)}`);
  };

  return (
    <div className="shell">
      <header className="topbar">
        <a className="wordmark" href="/">exnote<em>share</em></a>
        <span className="topbar-note">digital coat check · every drop burns in 24h</span>
      </header>

      <main className="split">
        <section className="panel panel-drop" aria-label="Drop something">
          <div className="panel-inner">
            <h1 className="verb">Drop it.</h1>
            <p className="verb-sub">
              Hand over text or files. You get a one-word claim ticket — no account, no email.
            </p>

            {error && <div className="error-band" role="alert">{error}</div>}

            {!ticket ? (
              <form onSubmit={handleDrop}>
                <div style={{ marginBottom: "1rem" }}>
                  <label className="field-label" htmlFor="drop-text">Text</label>
                  <textarea
                    id="drop-text"
                    className="textarea"
                    placeholder="Notes, links, code — anything you'd scribble on a slip of paper…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: "1.25rem" }}>
                  <label className="field-label">Files</label>
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
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
                    }}
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
                    <div className="dropzone-title">Drag files here or click to browse</div>
                    <div className="dropzone-hint">up to {MAX_FILES} files · 10 MB each</div>
                  </div>

                  {files.length > 0 && (
                    <div className="file-chips">
                      {files.map((file, i) => (
                        <div key={i} className="file-chip">
                          <span className="file-chip-name">{file.name}</span>
                          <span className="file-chip-size">{formatSize(file.size)}</span>
                          <button
                            type="button"
                            className="file-chip-remove"
                            aria-label={`Remove ${file.name}`}
                            onClick={() => removeFile(i)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button type="submit" className="btn btn-ticket" disabled={loading}>
                  {loading ? "Printing your ticket…" : "Get my claim ticket"}
                </button>
              </form>
            ) : (
              <>
                <div className="ticket">
                  <div className="ticket-eyebrow">
                    <span>Claim ticket</span>
                    <span>Valid 24h</span>
                  </div>
                  <p className="ticket-word">{ticket.keyword}</p>
                  <div className="ticket-perf">
                    <div className="ticket-link">
                      <a href={`/${ticket.keyword}`}>{`${window.location.origin}/${ticket.keyword}`}</a>
                      <button
                        className="ticket-copy"
                        onClick={() => copy(`${window.location.origin}/${ticket.keyword}`, "Link")}
                      >
                        Copy link
                      </button>
                      <button
                        className="ticket-copy"
                        onClick={() => copy(ticket.keyword, "Word")}
                      >
                        Copy word
                      </button>
                    </div>
                    <div className="ticket-barcode" aria-hidden="true" />
                  </div>
                </div>
                <div className="ticket-actions">
                  <button className="btn btn-ticket" onClick={shareTicket}>Share ticket</button>
                  <button className="btn btn-ghost" onClick={() => { setTicket(null); setError(""); }}>
                    Drop something else
                  </button>
                </div>
                <p className="burn-note">
                  This drop burns automatically at {new Date(new Date(ticket.createdAt).getTime() + 24 * 60 * 60 * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} tomorrow
                </p>
              </>
            )}
          </div>
        </section>

        <section className="panel panel-claim" aria-label="Claim a drop">
          <div className="panel-inner">
            <h1 className="verb">Claim it.</h1>
            <p className="verb-sub">
              Got a ticket word from someone? Type it in and pick up what they left for you.
            </p>
            <form onSubmit={handleClaim}>
              <div style={{ marginBottom: "1rem" }}>
                <label className="field-label" htmlFor="claim-word">Claim word</label>
                <input
                  id="claim-word"
                  className="input input-claim"
                  placeholder="e.g. sunfish"
                  value={claimWord}
                  onChange={(e) => setClaimWord(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <button type="submit" className="btn btn-ink">Claim my drop</button>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        no accounts · no history · everything <strong>burns after 24 hours</strong>
      </footer>
    </div>
  );
}
