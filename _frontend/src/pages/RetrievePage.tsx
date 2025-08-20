import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, FileText, Image, File, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

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
        const response = await fetch(`http://localhost:8000/${keyword}`);
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
      // Create a link element to trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      
      // For Cloudinary URLs, we might need to add download parameter
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

  const getFileIcon = (url: string) => {
    if (url.includes('.jpg') || url.includes('.png') || url.includes('.gif')) {
      return <Image className="w-5 h-5" />;
    } else if (url.includes('.pdf') || url.includes('.doc')) {
      return <FileText className="w-5 h-5" />;
    }
    return <File className="w-5 h-5" />;
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

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <Card className="p-8 gradient-card border-primary/20 shadow-card text-center">
          <div className="animate-pulse-glow w-16 h-16 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center">
            <Download className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Retrieving Files...</h2>
          <p className="text-muted-foreground">Searching for keyword: <span className="font-mono text-primary">{keyword}</span></p>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <Card className="p-8 gradient-card border-destructive/20 shadow-card text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Files Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The keyword <span className="font-mono text-primary">{keyword}</span> doesn't exist or the files have expired.
          </p>
          <Link to="/">
            <Button className="gradient-primary text-white hover:opacity-90 transition-smooth">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="w-full max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 gradient-primary bg-clip-text text-transparent">
              Shared Files
            </h1>
            <p className="text-muted-foreground">
              Keyword: <span className="font-mono text-primary font-semibold">{data.keyword}</span>
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* File Info */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in">
            {data.text && (
              <Card className="p-6 gradient-card border-primary/20 shadow-card">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Message</h3>
                </div>
                <div className="p-4 rounded-lg bg-background/50 border border-primary/20">
                  <p className="whitespace-pre-wrap">{data.text}</p>
                </div>
              </Card>
            )}

            {data.files.length > 0 && (
              <Card className="p-6 gradient-card border-primary/20 shadow-card">
                <div className="flex items-center gap-2 mb-4">
                  <Download className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Files ({data.files.length})</h3>
                </div>
                <div className="space-y-3">
                  {data.files.map((fileUrl, index) => {
                    const filename = getFileName(fileUrl);
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 rounded-lg bg-background/50 border border-primary/20 transition-smooth hover:border-primary/40"
                      >
                        <div className="p-2 rounded-lg bg-primary/10">
                          {getFileIcon(fileUrl)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{filename}</p>
                          <p className="text-sm text-muted-foreground">Ready to download</p>
                        </div>
                        <Button
                          onClick={() => handleDownload(fileUrl, filename)}
                          className="gradient-primary text-white hover:opacity-90 transition-smooth"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <Card className="p-6 gradient-card border-primary/20 shadow-card">
              <h3 className="font-semibold mb-4">File Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <div>
                    <p className="font-medium">Shared on</p>
                    <p className="text-muted-foreground">{formatDate(data.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="font-medium">Expires</p>
                    <p className="text-orange-400">{getTimeRemaining(data.createdAt)}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 gradient-card border-primary/20 shadow-card">
              <h3 className="font-semibold mb-3">Share This Link</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Others can access these files using the same keyword.
              </p>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied to clipboard!");
                }}
                variant="outline"
                className="w-full"
              >
                Copy Link
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetrievePage;