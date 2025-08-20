import { useState } from "react";
import { Search, Download, FileText, Image, File, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface FileData {
  text?: string;
  files: string[];
  keyword: string;
  createdAt: string;
}

export const RetrieveSection = () => {
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<FileData | null>(null);

  const handleRetrieve = async () => {
    if (!keyword.trim()) {
      toast.error("Please enter a keyword");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`http://localhost:8000/${keyword.trim()}`);
      const result = await response.json();

      if (response.ok && result.status === 200) {
        setData({
          text: result.data.text || "",
          files: result.data.files || [],
          keyword: result.data.keyword,
          createdAt: result.data.createdAt
        });
        toast.success("Files retrieved successfully!");
      } else {
        throw new Error(result.message || 'Files not found');
      }
    } catch (error) {
      console.error('Retrieve error:', error);
      toast.error("Files not found or expired");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

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
      return <Image className="w-4 h-4" />;
    } else if (url.includes('.pdf') || url.includes('.doc')) {
      return <FileText className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
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

  const reset = () => {
    setKeyword("");
    setData(null);
  };

  return (
    <Card className="p-6 gradient-card border-primary/20 shadow-card">
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Search className="w-6 h-6 text-primary" />
        Retrieve Files
      </h2>

      {!data ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Enter Keyword
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your keyword..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleRetrieve()}
                className="bg-background/50 border-primary/20 font-mono"
              />
              <Button
                onClick={handleRetrieve}
                disabled={isLoading}
                className="gradient-primary text-white hover:opacity-90 transition-smooth"
              >
                {isLoading ? "Searching..." : "Retrieve"}
                <Search className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Enter a keyword to retrieve shared files</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Shared on {formatDate(data.createdAt)}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={reset}>
              Search Again
            </Button>
          </div>

          {data.text && (
            <div className="p-4 rounded-lg bg-background/50 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Message</span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{data.text}</p>
            </div>
          )}

          {data.files.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Download className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Files ({data.files.length})</span>
              </div>
              <div className="space-y-2">
                {data.files.map((fileUrl, index) => {
                  const filename = getFileName(fileUrl);
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-primary/20 transition-smooth hover:border-primary/40"
                    >
                      {getFileIcon(fileUrl)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{filename}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleDownload(fileUrl, filename)}
                        className="gradient-primary text-white hover:opacity-90 transition-smooth"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
            <p className="text-sm text-center text-orange-300">
              ⏰ Files will be automatically deleted in 24 hours
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};